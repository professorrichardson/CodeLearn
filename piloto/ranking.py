import re
import sqlite3
from contextlib import closing
from pathlib import Path

BANCO = Path(__file__).with_name("ranking.sqlite3")


def preparar(conexao):
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS ranking (
            id TEXT PRIMARY KEY NOT NULL, nome TEXT NOT NULL, pontos INTEGER NOT NULL
        )
    """)
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS ranking_base (
            id TEXT PRIMARY KEY NOT NULL, pontos INTEGER NOT NULL
        )
    """)


LISTAR_XP = """
    SELECT r.id, r.nome, r.pontos - coalesce(b.pontos, 0) AS xp
    FROM ranking r LEFT JOIN ranking_base b ON r.id = b.id
    WHERE r.pontos > coalesce(b.pontos, 0)
    ORDER BY xp DESC, r.id ASC
"""


def listar(jogador=None, *, banco=BANCO):
    dados = None
    if jogador is not None:
        if not isinstance(jogador, dict):
            raise ValueError
        identificador = jogador.get("id")
        nome = jogador.get("nome")
        pontos = jogador.get("pontos")
        if (
            not isinstance(identificador, str)
            or not re.fullmatch(r"[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}", identificador)
            or not isinstance(nome, str)
            or not nome.strip()
            or len(nome.encode("utf-16-le")) > 64
            or re.search(r"[\x00-\x1f\x7f]", nome)
            or type(pontos) is not int
            or pontos not in range(70, 1201, 10)
        ):
            raise ValueError
        dados = (identificador, nome.strip(), pontos)

    with closing(sqlite3.connect(banco)) as conexao, conexao:
        preparar(conexao)
        if dados:
            conexao.execute("""
                INSERT INTO ranking (id, nome, pontos) VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET pontos = excluded.pontos
                WHERE excluded.pontos > ranking.pontos
            """, dados)
        linhas = conexao.execute(LISTAR_XP + " LIMIT 20").fetchall()
    return [
        dict(nome=nome, pontos=pontos, **({"meu": True} if dados and id_linha == dados[0] else {}))
        for id_linha, nome, pontos in linhas
    ]
