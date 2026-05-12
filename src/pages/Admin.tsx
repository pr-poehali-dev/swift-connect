import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const API_URL = "https://functions.poehali.dev/6f0ba384-7ba0-431d-bf97-4f93cbb01a11"

const CATEGORIES = ["Безопасность", "Инструменты", "Контейнеризация", "Гайды"]

interface NewsItem {
  id: number
  title: string
  category: string
  published_at: string
}

const emptyForm = { title: "", category: CATEGORIES[0], published_at: "" }

export default function Admin() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const checkPassword = () => {
    if (password === "admin123") setAuthed(true)
    else alert("Неверный пароль")
  }

  const fetchNews = async () => {
    const res = await fetch(API_URL)
    const data = await res.json()
    setNews(JSON.parse(data))
  }

  useEffect(() => {
    if (authed) fetchNews()
  }, [authed])

  const handleSave = async () => {
    if (!form.title || !form.published_at) return alert("Заполни все поля")
    setLoading(true)
    if (editing) {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing.id }),
      })
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }
    setForm(emptyForm)
    setEditing(null)
    setLoading(false)
    fetchNews()
  }

  const handleEdit = (item: NewsItem) => {
    setEditing(item)
    setForm({ title: item.title, category: item.category, published_at: item.published_at })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить новость?")) return
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" })
    fetchNews()
  }

  const handleCancel = () => {
    setEditing(null)
    setForm(emptyForm)
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-foreground/5 p-8">
          <h1 className="mb-6 font-sans text-3xl font-light text-foreground">Админ-панель</h1>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkPassword()}
            className="mb-4 w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-foreground/50"
          />
          <button
            onClick={checkPassword}
            className="w-full rounded-lg bg-foreground px-4 py-3 font-mono text-sm text-background transition hover:opacity-80"
          >
            Войти
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-sans text-4xl font-light text-foreground">Управление новостями</h1>
          <button
            onClick={() => navigate("/")}
            className="font-mono text-sm text-foreground/50 hover:text-foreground"
          >
            ← На сайт
          </button>
        </div>

        <div className="mb-10 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
          <h2 className="mb-5 font-sans text-xl font-light text-foreground">
            {editing ? "Редактировать новость" : "Добавить новость"}
          </h2>
          <div className="space-y-4">
            <input
              placeholder="Заголовок"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-foreground/20 bg-transparent px-4 py-3 font-sans text-sm text-foreground outline-none focus:border-foreground/50"
            />
            <div className="flex gap-4">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex-1 rounded-lg border border-foreground/20 bg-background px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-foreground/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                placeholder="Дата (напр. Май 2026)"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                className="flex-1 rounded-lg border border-foreground/20 bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-foreground/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-foreground px-6 py-3 font-mono text-sm text-background transition hover:opacity-80 disabled:opacity-40"
              >
                {editing ? "Сохранить" : "Добавить"}
              </button>
              {editing && (
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-foreground/20 px-6 py-3 font-mono text-sm text-foreground transition hover:border-foreground/40"
                >
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {news.length === 0 && (
            <p className="font-mono text-sm text-foreground/40">Новостей пока нет</p>
          )}
          {news.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-foreground/10 px-5 py-4"
            >
              <div>
                <p className="font-sans text-base text-foreground">{item.title}</p>
                <p className="font-mono text-xs text-foreground/40">
                  {item.category} · {item.published_at}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="font-mono text-xs text-foreground/50 hover:text-foreground"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="font-mono text-xs text-red-400 hover:text-red-300"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
