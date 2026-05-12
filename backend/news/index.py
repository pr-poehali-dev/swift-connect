import json
import os
import psycopg2  # noqa: F401 — psycopg2-binary

SCHEMA = "t_p66814254_swift_connect"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Управление новостями: GET — список, POST — создать, PUT — обновить, DELETE — удалить"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, category, published_at FROM {SCHEMA}.news ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        news = [{"id": r[0], "title": r[1], "category": r[2], "published_at": r[3]} for r in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps(news, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        title = body["title"]
        category = body["category"]
        published_at = body["published_at"]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.news (title, category, published_at) VALUES (%s, %s, %s) RETURNING id",
            (title, category, published_at),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 201, "headers": cors, "body": json.dumps({"id": new_id})}

    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        news_id = body["id"]
        title = body["title"]
        category = body["category"]
        published_at = body["published_at"]
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.news SET title=%s, category=%s, published_at=%s WHERE id=%s",
            (title, category, published_at, news_id),
        )
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        news_id = params.get("id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.news WHERE id=%s", (news_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}