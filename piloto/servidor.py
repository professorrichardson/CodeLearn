import json
import sqlite3
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

from professor import DURACAO, painel
from ranking import listar
from testar import executar_c

PASTA = Path(__file__).resolve().parent
PUBLICO = PASTA.parent / "public"
HOST = "127.0.0.1:8765"
ORIGEM = f"http://{HOST}"


class Piloto(BaseHTTPRequestHandler):
    def responder(self, dados, tipo, status=200, cookie=None):
        self.send_response(status)
        self.send_header("Content-Type", tipo if tipo == "image/png" else f"{tipo}; charset=utf-8")
        if self.path in {"/api/ranking", "/api/professor", "/professor"}:
            self.send_header("Cache-Control", "no-store")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Length", str(len(dados)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.headers.get("Host") != HOST:
            self.send_error(403)
        elif self.path == "/":
            self.responder((PUBLICO / "index.html").read_bytes(), "text/html")
        elif self.path == "/licoes.js":
            self.responder((PUBLICO / "licoes.js").read_bytes(), "text/javascript")
        elif self.path == "/codrich.png":
            self.responder((PUBLICO / "codrich.png").read_bytes(), "image/png")
        elif self.path == "/professor":
            self.responder((PUBLICO / "professor.html").read_bytes(), "text/html")
        elif self.path == "/api/professor":
            self.responder_professor("listar")
        elif self.path == "/api/ranking":
            self.responder_ranking()
        elif self.path == "/energia.c":
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
            estado, saida, diagnostico = executar_c(codigo, entrada, apenas_verificar=apenas_verificar)
        except OSError:
            estado, saida, diagnostico = "erro_executor", "", "Confira se o Clang está instalado no Mac."
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
        try:
            linhas = listar(dados)
        except ValueError:
            self.send_error(400)
            return
        except sqlite3.Error:
            self.send_error(503)
            return
        self.responder(json.dumps(linhas).encode("utf-8"), "application/json")


if __name__ == "__main__":
    with HTTPServer(("127.0.0.1", 8765), Piloto) as servidor:
        print(f"CodLearn em {ORIGEM}/", flush=True)
        servidor.serve_forever()
