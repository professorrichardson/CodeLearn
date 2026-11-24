import argparse
import os
import shutil
import sys
import subprocess
from tempfile import TemporaryDirectory
from pathlib import Path


def localizar_compilador(nome=None):
    candidatos = ("clang", "gcc") if sys.platform == "darwin" else ("gcc", "clang")
    for candidato in (nome,) if nome else candidatos:
        caminho = shutil.which(candidato)
        if caminho:
            return caminho
    raise FileNotFoundError(f"Compilador não encontrado: {nome or 'Clang ou GCC'}.")


def executar_c(codigo, entrada="", *, apenas_verificar=False, compilador=None):
    compilador = localizar_compilador(compilador)
    # shortcut: execução nativa para código confiável, isolar antes de aceitar envios de alunos.
    with TemporaryDirectory(prefix="codlearn-") as pasta_temporaria:
        pasta = Path(pasta_temporaria)
        fonte = pasta / "missao.c"
        fonte.write_text(codigo, encoding="utf-8")
        try:
            compilacao = subprocess.run(
                [compilador, "-std=c17", "-Wall", "-Wextra", "-fdiagnostics-color=never", "missao.c"]
                + (["-fsyntax-only"] if apenas_verificar else ["-o", "missao"]),
                cwd=pasta, capture_output=True, text=True, errors="replace", timeout=10,
                env={**os.environ, "LC_ALL": "C"},
            )
        except subprocess.TimeoutExpired:
            return "tempo_compilacao", "", "A compilação excedeu 10 segundos."
        if compilacao.returncode != 0:
            return "erro_compilacao", "", compilacao.stderr

        if apenas_verificar:
            return "ok", "", compilacao.stderr

        try:
            programa = subprocess.run(
                [str(pasta / "missao")],
                cwd=pasta, input=entrada, capture_output=True, text=True,
                errors="replace", timeout=1, env={"PATH": os.defpath, "LC_ALL": "C"},
            )
        except subprocess.TimeoutExpired:
            return "tempo_execucao", "", "O programa excedeu 1 segundo."
        estado = "ok" if programa.returncode == 0 else "erro_execucao"
        return estado, programa.stdout, compilacao.stderr + programa.stderr


def verificar(compilador):
    energia = Path(__file__).with_name("energia.c").read_text(encoding="utf-8")
    casos = [
        ("printf", '#include <stdio.h>\nint main(void) { printf("OLA\\n"); }',
         "", "ok", "OLA\n", ""),
        ("scanf, variáveis, for e if", energia, "3\n", "ok", "Porta aberta: 30\n", ""),
        ("outro valor alcança o else", energia, "2\n", "ok", "Energia insuficiente: 20\n", ""),
        ("zero iterações", energia, "0\n", "ok", "Energia insuficiente: 0\n", ""),
        ("entrada inválida", energia, "abc\n", "erro_execucao", "", "Digite um numero inteiro."),
        ("erro de compilação", "int main(void) { return 0 }", "", "erro_compilacao", "", "error:"),
        ("laço infinito", "int main(void) { for (;;) {} }", "", "tempo_execucao", "", "1 segundo"),
    ]
    assert executar_c(casos[-1][1], apenas_verificar=True, compilador=compilador) == ("ok", "", "")
    assert executar_c(casos[-2][1], apenas_verificar=True, compilador=compilador)[0] == "erro_compilacao"
    print("OK — verificação sem execução")
    for nome, codigo, entrada, estado_esperado, saida_esperada, trecho in casos:
        estado, saida, diagnostico = executar_c(codigo, entrada, compilador=compilador)
        if (estado, saida) != (estado_esperado, saida_esperada) or trecho not in diagnostico:
            raise AssertionError(f"{nome}: {estado}, {saida!r}, {diagnostico!r}")
        print(f"OK — {nome}")


def main():
    parser = argparse.ArgumentParser(description="Piloto local de C para código próprio e confiável.")
    parser.add_argument("arquivo", type=Path, nargs="?")
    parser.add_argument("--entrada", default="", help="Uma linha de entrada para o programa")
    parser.add_argument("--compilador", help="Executável do Clang ou GCC")
    args = parser.parse_args()

    try:
        compilador = localizar_compilador(args.compilador)
        if args.arquivo is None:
            print(f"Compilador: {compilador}")
            verificar(compilador)
            return 0
        estado, saida, diagnostico = executar_c(
            args.arquivo.read_text(encoding="utf-8"), args.entrada + "\n", compilador=compilador
        )
    except (OSError, UnicodeError) as erro:
        parser.exit(1, f"{erro}\n")

    print(f"Estado: {estado}")
    if saida:
        print(saida, end="")
    if diagnostico:
        print(diagnostico)
    return 0 if estado == "ok" else 1


if __name__ == "__main__":
    raise SystemExit(main())
