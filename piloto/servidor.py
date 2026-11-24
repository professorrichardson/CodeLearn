import argparse
import json
import sqlite3
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from professor import DURACAO, painel
from ranking import listar
from testar import executar_c, localizar_compilador

PASTA = Path(__file__).resolve().parent
PUBLICO = PASTA.parent / "public"
HOST = "127.0.0.1:8765"
ORIGEM = f"http://{HOST}"


class SemRedirecionamento(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Piloto(BaseHTTPRequestHandler):
    compilador = None
    ranking_remoto = None
    def responder(self, dados, tipo, status=200, cookie=None):
        self.send_response(status)
        self.send_header("Content-Type", tipo if tipo == "image/png" else f"{tipo}; charset=utf-8")
        if self.path in {"/api/ranking", "/api/professor", "/professor"}:
            self.send_header("Cache-Control", "no-store")
        if urlsplit(self.path).path == "/compilador/worker.mjs":
            self.send_header(
                "Content-Security-Policy",
                "default-src 'none'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; "
                "connect-src https://cdn.jsdelivr.net",
            )
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Length", str(len(dados)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        caminho = urlsplit(self.path).path
        if self.headers.get("Host") != HOST:
            self.send_error(403)
        elif caminho == "/":
            self.responder((PUBLICO / "index.html").read_bytes(), "text/html")
        elif caminho in {"/licoes.js", "/dialogos.js"}:
            self.responder((PUBLICO / caminho.lstrip("/")).read_bytes(), "text/javascript")
        elif caminho == "/dialogos.css":
            self.responder((PUBLICO / "dialogos.css").read_bytes(), "text/css")
        elif caminho in {"/compilador/executor.js", "/compilador/worker.mjs", "/compilador/wasi-host.mjs"}:
            self.responder((PUBLICO / caminho.lstrip("/")).read_bytes(), "text/javascript")
        elif caminho == "/codrich.png":
            self.responder((PUBLICO / "codrich.png").read_bytes(), "image/png")
        elif caminho == "/professor" and self.ranking_remoto:
            self.send_response(302)
            self.send_header("Location", self.ranking_remoto + "/professor")
            self.end_headers()
        elif caminho == "/professor":
            self.responder((PUBLICO / "professor.html").read_bytes(), "text/html")
        elif caminho == "/api/professor":
            self.responder_professor("listar")
        elif caminho == "/api/ranking":
            self.responder_ranking()
        elif caminho == "/energia.c":
            self.responder((PASTA / "energia.c").read_bytes(), "text/plain")
        else:
            self.send_error(404)

    def do_POST(self):
        if self.headers.get("Host") != HOST or self.headers.get("Origin") != ORIGEM:
            self.send_error(403)
            return
        if self.path not in {"/executar", "/api/ranking", "/api/professor"}:
            self.send_error(404)
            return
        if self.headers.get_content_type() != "application/json":
            self.send_error(415)
            return
        try:
            tamanho = int(self.headers.get("Content-Length", "0"))
            limite = 65536 if self.path == "/executar" else 1024
            if not 0 < tamanho <= limite:
                self.send_error(413)
                return
            dados = json.loads(self.rfile.read(tamanho))
            if self.path == "/api/ranking":
                if dados is None:
                    raise ValueError
                self.responder_ranking(dados)
                return
            if self.path == "/api/professor":
                acao = dados.get("acao") if isinstance(dados, dict) else None
                if acao not in ("cadastrar", "entrar", "sair", "resetar"):
                    raise ValueError
                self.responder_professor(acao, dados.get("senha"))
                return
            codigo, entrada = dados["codigo"], dados["entrada"]
            if not isinstance(codigo, str) or not isinstance(entrada, str):
                raise ValueError
            apenas_verificar = dados.get("apenas_verificar", False)
            if not isinstance(apenas_verificar, bool):
                raise ValueError
            codigo.encode("utf-8")
            entrada.encode("utf-8")
        except (ValueError, KeyError, TypeError):
            self.send_error(400)
            return

        try:
            estado, saida, diagnostico = executar_c(
                codigo, entrada, apenas_verificar=apenas_verificar, compilador=self.compilador,
            )
        except OSError:
            estado, saida, diagnostico = "erro_executor", "", "Confira se o Clang ou o GCC está instalado nesta máquina."
        resultado = dict(estado=estado, saida=saida, diagnostico=diagnostico)
        self.responder(json.dumps(resultado).encode("utf-8"), "application/json")

    def responder_professor(self, acao, senha=None):
        try:
            cookies = SimpleCookie(self.headers.get("Cookie", ""))
            sessao = cookies.get("codlearn_professor")
            status, valor = painel(acao, sessao.value if sessao else None, senha)
        except (sqlite3.Error, ValueError):
            status, valor = 503, None
        cookie = None
        if status == 200 and acao in ("cadastrar", "entrar", "sair"):
            cookie = f"codlearn_professor={valor or ''}; Path=/api/professor; HttpOnly; SameSite=Strict; Max-Age={DURACAO if valor else 0}"
            valor = None
        self.responder(json.dumps(valor).encode("utf-8"), "application/json", status, cookie)

    def responder_ranking(self, dados=None):
        if self.ranking_remoto:
            self.encaminhar_ranking(dados)
            return
        try:
            linhas = listar(dados)
        except ValueError:
            self.send_error(400)
            return
        except sqlite3.Error:
            self.send_error(503)
            return
        self.responder(json.dumps(linhas).encode("utf-8"), "application/json")


    def encaminhar_ranking(self, dados):
        pedido = Request(
            self.ranking_remoto + "/api/ranking",
            data=json.dumps(dados).encode("utf-8") if dados is not None else None,
            headers={"Origin": self.ranking_remoto, "Content-Type": "application/json"},
        )
        try:
            with build_opener(SemRedirecionamento()).open(pedido, timeout=4) as resposta:
                linhas = json.loads(resposta.read(32768))
            if not isinstance(linhas, list):
                raise ValueError
        except HTTPError as erro:
            self.send_error(erro.code if erro.code in {400, 403, 413, 415, 503} else 502)
            return
        except (OSError, ValueError):
            self.send_error(502)
            return
        self.responder(json.dumps(linhas).encode("utf-8"), "application/json")


def main():
    parser = argparse.ArgumentParser(description="Inicia o CodLearn só neste computador.")
    parser.add_argument("--compilador", help="Executável do GCC ou Clang. No Linux, o padrão é GCC. No Mac, Clang.")
    parser.add_argument("--ranking-url", help="Endereço HTTPS do CodLearn na Vercel para compartilhar o ranking.")
    args = parser.parse_args()
    try:
        Piloto.compilador = localizar_compilador(args.compilador)
        if args.ranking_url:
            url = urlsplit(args.ranking_url)
            if (url.scheme != "https" or not url.hostname or url.username or url.password
                    or url.path not in ("", "/") or url.query or url.fragment):
                raise ValueError("Use o endereço HTTPS inicial do CodLearn, sem /professor ou outro caminho.")
            Piloto.ranking_remoto = f"{url.scheme}://{url.netloc}"
    except (OSError, ValueError) as erro:
        parser.error(str(erro))
    with HTTPServer(("127.0.0.1", 8765), Piloto) as servidor:
        print(f"CodLearn em {ORIGEM}/ · Compilador: {Piloto.compilador}", flush=True)
        if Piloto.ranking_remoto:
            print(f"Ranking compartilhado: {Piloto.ranking_remoto}/professor", flush=True)
        servidor.serve_forever()


if __name__ == "__main__":
    main()
