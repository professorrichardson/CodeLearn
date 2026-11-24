import hashlib
import hmac
import secrets
import sqlite3
import time
from contextlib import closing

from ranking import BANCO, LISTAR_XP, preparar

DURACAO = 8 * 60 * 60


def hash_senha(senha, sal):
    return hashlib.pbkdf2_hmac("sha256", senha.encode(), bytes.fromhex(sal), 600_000).hex()


def configurar(conexao):
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS professor (
            id INTEGER PRIMARY KEY CHECK (id = 1), sal TEXT NOT NULL, hash TEXT NOT NULL
        )
    """)
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS sessoes_professor (
            token TEXT PRIMARY KEY, expira INTEGER NOT NULL
        )
    """)


def painel(acao, token=None, senha=None, *, banco=BANCO):
    with closing(sqlite3.connect(banco)) as conexao, conexao:
        configurar(conexao)
        agora = int(time.time())
        credencial = conexao.execute("SELECT sal, hash FROM professor WHERE id = 1").fetchone()
        if acao == "cadastrar":
            if credencial is not None:
                return 409, None
            if not isinstance(senha, str) or not 8 <= len(senha) <= 128:
                return 400, None
            sal = secrets.token_hex(16)
            gravado = conexao.execute("INSERT OR IGNORE INTO professor VALUES (1, ?, ?)", (sal, hash_senha(senha, sal)))
            if gravado.rowcount != 1:
                return 409, None
        elif credencial is None:
            return 428, None
        elif acao == "entrar":
            sal, esperado = credencial
            if not isinstance(senha, str) or len(senha) > 128 or not hmac.compare_digest(hash_senha(senha, sal), esperado):
                return 401, None

        if acao in ("entrar", "cadastrar"):
            token = secrets.token_hex(32)
            conexao.execute("DELETE FROM sessoes_professor WHERE expira <= ?", (agora,))
            conexao.execute("INSERT INTO sessoes_professor VALUES (?, ?)", (hashlib.sha256(token.encode()).hexdigest(), agora + DURACAO))
            return 200, token

        chave = hashlib.sha256(token.encode()).hexdigest() if token else ""
        ativo = conexao.execute("SELECT 1 FROM sessoes_professor WHERE token = ? AND expira > ?", (chave, agora)).fetchone()
        if not ativo:
            return 401, None
        if acao == "sair":
            conexao.execute("DELETE FROM sessoes_professor WHERE token = ?", (chave,))
            return 200, None
        preparar(conexao)
        if acao == "resetar":
            conexao.execute("INSERT OR REPLACE INTO ranking_base (id, pontos) SELECT id, pontos FROM ranking")
            return 200, None
        return 200, [dict(nome=nome, pontos=pontos) for _, nome, pontos in conexao.execute(LISTAR_XP)]
