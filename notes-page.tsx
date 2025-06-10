"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Search, X, Edit3, Trash2, Calendar, Clock } from "lucide-react"
import { useState, useEffect, useRef } from "react"

type NoteCategory = "important" | "tech" | "illegal" | "plans"
type ModalType = "add" | "delete" | null

interface Note {
  id: string
  title: string
  category: NoteCategory
  content: string
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

// Функция для получения аккаунт-специфичных ключей
const getStorageKey = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return `${accountKey}_notes`
}

const CATEGORIES = {
  important: {
    label: "Важное",
    icon: "⭐",
    color: "text-red-400",
    bgColor: "bg-red-600/20",
    borderColor: "border-red-500/50",
  },
  tech: {
    label: "Тех",
    icon: "⚙️",
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-500/50",
  },
  illegal: {
    label: "Нелегалы",
    icon: "🔒",
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
  },
  plans: {
    label: "Планы",
    icon: "📅",
    color: "text-green-400",
    bgColor: "bg-green-600/20",
    borderColor: "border-green-500/50",
  },
}

interface NotesPageProps {
  accountName: string
  onBack: () => void
}

export default function NotesPage({ accountName, onBack }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "all">("all")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const [fadingNotes, setFadingNotes] = useState<Set<string>>(new Set())

  const STORAGE_KEY = getStorageKey(accountName)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "important" as NoteCategory,
    deadline: "",
    deadlineTime: "",
  })

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY)
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes, (key, value) => {
          if (key === "createdAt" || key === "updatedAt" || key === "deadline") {
            return value ? new Date(value) : undefined
          }
          return value
        })
        setNotes(parsedNotes)
      }
    } catch (error) {
      console.error("Ошибка при загрузке заметок:", error)
    }
  }, [STORAGE_KEY])

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes, STORAGE_KEY])

  // Фильтрация заметок
  useEffect(() => {
    let filtered = notes

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter((note) => note.category === selectedCategory)
    }

    // Фильтр по поиску
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Сортировка: сначала планы с дедлайном, потом по дате создания
    filtered.sort((a, b) => {
      if (a.category === "plans" && a.deadline && b.category === "plans" && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime()
      }
      if (a.category === "plans" && a.deadline) return -1
      if (b.category === "plans" && b.deadline) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    setFilteredNotes(filtered)
  }, [notes, selectedCategory, searchQuery])

  const openModal = (type: ModalType, note?: Note) => {
    setActiveModal(type)
    if (type === "delete" && note) {
      setDeletingNote(note)
    } else {
      setDeletingNote(null)
      setFormData({
        title: "",
        category: "important",
        deadline: "",
        deadlineTime: "",
      })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setDeletingNote(null)
    setFormData({
      title: "",
      category: "important",
      deadline: "",
      deadlineTime: "",
    })
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    let deadline: Date | undefined
    if (formData.category === "plans" && formData.deadline) {
      deadline = new Date(formData.deadline)
      if (formData.deadlineTime) {
        const [hours, minutes] = formData.deadlineTime.split(":")
        deadline.setHours(Number.parseInt(hours), Number.parseInt(minutes))
      }
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      category: formData.category,
      content: "",
      deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes((prev) => [newNote, ...prev])
    closeModal()

    // Переход к редактированию заметки
    setEditingNoteId(newNote.id)
  }

  const handleDelete = () => {
    if (!deletingNote) return

    // Добавляем заметку в список исчезающих
    setFadingNotes((prev) => new Set(prev).add(deletingNote.id))

    // Удаляем заметку через 300ms (время анимации)
    setTimeout(() => {
      setNotes((prev) => prev.filter((note) => note.id !== deletingNote.id))
      setFadingNotes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(deletingNote.id)
        return newSet
      })
    }, 300)

    closeModal()
  }

  const handleEditNote = (noteId: string) => {
    setEditingNoteId(noteId)
  }

  const handleSaveNote = (noteId: string, content: string) => {
    setNotes((prev) => prev.map((note) => (note.id === noteId ? { ...note, content, updatedAt: new Date() } : note)))
    setEditingNoteId(null)
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDeadline = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: "Просрочено", color: "text-red-500" }
    } else if (diffDays === 0) {
      return { text: "Сегодня", color: "text-orange-500" }
    } else if (diffDays === 1) {
      return { text: "Завтра", color: "text-yellow-500" }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} дн.`, color: "text-green-500" }
    } else {
      return { text: date.toLocaleDateString("ru-RU"), color: "text-gray-400" }
    }
  }

  const renderModal = () => {
    if (!activeModal) return null

    if (activeModal === "delete") {
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-400 font-rajdhani">Удалить заметку</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-300">
                Вы уверены, что хотите удалить заметку{" "}
                <span className="font-semibold text-white">"{deletingNote?.title}"</span> навсегда?
              </p>
              <p className="text-gray-500 text-sm">Это действие нельзя отменить.</p>
              <div className="flex space-x-3 pt-4">
                <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Нет
                </Button>
                <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                  Да, удалить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-400 font-rajdhani">Добавить заметку</h3>
            <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Название */}
            <div>
              <label className="block text-gray-300 mb-2">Название заметки</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="Введите название заметки"
              />
            </div>

            {/* Категория */}
            <div>
              <label className="block text-gray-300 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as NoteCategory }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Дедлайн для планов */}
            {formData.category === "plans" && (
              <div className="space-y-3">
                <label className="block text-gray-300 mb-2">Дедлайн</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                      className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.deadlineTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deadlineTime: e.target.value }))}
                      className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex space-x-3 pt-4">
              <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если редактируем заметку, показываем редактор
  if (editingNoteId) {
    const note = notes.find((n) => n.id === editingNoteId)
    if (note) {
      return (
        <NoteEditor
          note={note}
          onSave={(content) => handleSaveNote(editingNoteId, content)}
          onBack={() => setEditingNoteId(null)}
        />
      )
    }
  }

  return (
    <div className="relative min-h-screen bg-[#121212] overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </Button>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{accountName}</p>
            <p className="text-purple-500 font-mono font-bold">{notes.length} заметок</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">📄 ЗАМЕТКИ</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
          </div>

          {/* Controls */}
          <div className="mb-8 space-y-6">
            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Поиск заметок..."
                />
              </div>
              <Button
                onClick={() => openModal("add")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-rajdhani tracking-wider transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить заметку
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-gray-600 border border-gray-500 text-white"
                    : "bg-gray-600/20 border border-gray-500/50 text-gray-400 hover:bg-gray-600/30"
                }`}
              >
                Все заметки ({notes.length})
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => {
                const count = notes.filter((note) => note.category === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as NoteCategory)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                      selectedCategory === key
                        ? `${category.bgColor} border ${category.borderColor} text-white`
                        : `${category.bgColor} border ${category.borderColor} ${category.color} hover:bg-opacity-30`
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>
                      {category.label} ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border border-gray-700">
            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => {
                  const category = CATEGORIES[note.category]
                  const deadlineInfo = note.deadline ? formatDeadline(note.deadline) : null
                  const isFading = fadingNotes.has(note.id)

                  return (
                    <div
                      key={note.id}
                      className={`group relative bg-gradient-to-br from-[#252525] to-[#1A1A1A] p-6 rounded-xl border-2 ${category.borderColor} hover:border-opacity-100 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                        isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                      }`}
                      onClick={() => handleEditNote(note.id)}
                    >
                      {/* Category Badge */}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 ${category.bgColor} ${category.borderColor} border rounded-full text-xs ${category.color} font-semibold backdrop-blur-sm`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.label}
                      </div>

                      {/* Note Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-3 font-rajdhani pr-24 leading-tight">
                          {note.title}
                        </h3>

                        {/* Deadline for plans */}
                        {note.deadline && (
                          <div className="mb-3 flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm font-semibold ${deadlineInfo?.color}`}>{deadlineInfo?.text}</span>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              {note.deadline.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}

                        {/* Content Preview */}
                        <div className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {note.content || "Заметка пуста..."}
                        </div>

                        {/* Meta Info */}
                        <div className="text-gray-500 text-xs">
                          <div>Создано: {formatDateTime(note.createdAt)}</div>
                          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                            <div>Изменено: {formatDateTime(note.updatedAt)}</div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditNote(note.id)
                          }}
                          className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal("delete", note)
                          }}
                          className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl pointer-events-none`}
                      ></div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {searchQuery || selectedCategory !== "all" ? "Заметки не найдены" : "Заметки отсутствуют"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {searchQuery || selectedCategory !== "all"
                    ? "Попробуйте изменить фильтры поиска"
                    : "Создайте свою первую заметку, чтобы начать"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  )
}

// Компонент редактора заметки
interface NoteEditorProps {
  note: Note
  onSave: (content: string) => void
  onBack: () => void
}

function NoteEditor({ note, onSave, onBack }: NoteEditorProps) {
  const [content, setContent] = useState(note.content)
  const [hasChanges, setHasChanges] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [tableRows, setTableRows] = useState("3")
  const [tableCols, setTableCols] = useState("3")
  const editorRef = useRef<HTMLDivElement>(null)
  const category = CATEGORIES[note.category]

  useEffect(() => {
    setHasChanges(content !== note.content)
  }, [content, note.content])

  useEffect(() => {
    if (editorRef.current && note.content) {
      editorRef.current.innerHTML = note.content
    }
  }, [note.content])

  const handleSave = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML
      setContent(htmlContent)
      onSave(htmlContent)
    }
  }

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("У вас есть несохраненные изменения. Сохранить перед выходом?")) {
        handleSave()
      }
    }
    onBack()
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML
      setContent(htmlContent)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const link = document.createElement("a")
        link.href = linkUrl
        link.textContent = linkText
        link.style.color = "#60A5FA"
        link.style.textDecoration = "underline"
        range.insertNode(link)
        selection.removeAllRanges()
      }
      setShowLinkModal(false)
      setLinkUrl("")
      setLinkText("")
      handleContentChange()
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const img = document.createElement("img")
        img.src = imageUrl
        img.alt = imageAlt || "Изображение"
        img.style.maxWidth = "100%"
        img.style.height = "auto"
        img.style.margin = "10px 0"
        range.insertNode(img)
        selection.removeAllRanges()
      }
      setShowImageModal(false)
      setImageUrl("")
      setImageAlt("")
      handleContentChange()
    }
  }

  const insertTable = () => {
    const rows = Number.parseInt(tableRows)
    const cols = Number.parseInt(tableCols)
    if (rows > 0 && cols > 0) {
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">'
      for (let i = 0; i < rows; i++) {
        tableHTML += "<tr>"
        for (let j = 0; j < cols; j++) {
          tableHTML += '<td style="border: 1px solid #666; padding: 8px; background: #2A2A2A;">Ячейка</td>'
        }
        tableHTML += "</tr>"
      }
      tableHTML += "</table>"

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const div = document.createElement("div")
        div.innerHTML = tableHTML
        range.insertNode(div.firstChild!)
        selection.removeAllRanges()
      }
      setShowTableModal(false)
      setTableRows("3")
      setTableCols("3")
      handleContentChange()
    }
  }

  const insertQuote = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      range.deleteContents()
      const quote = document.createElement("blockquote")
      quote.style.borderLeft = "4px solid #8B5CF6"
      quote.style.paddingLeft = "16px"
      quote.style.margin = "16px 0"
      quote.style.fontStyle = "italic"
      quote.style.color = "#D1D5DB"
      quote.textContent = selectedText || "Цитата"
      range.insertNode(quote)
      selection.removeAllRanges()
    }
    handleContentChange()
  }

  return (
    <div className="relative min-h-screen bg-[#121212] overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к заметкам</span>
          </Button>
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <Button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
              >
                Сохранить
              </Button>
            )}
            <div
              className={`px-3 py-1 ${category.bgColor} ${category.borderColor} border rounded-full text-sm ${category.color} font-semibold`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Note Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider font-rajdhani">
              {note.title}
            </h1>
            {note.deadline && (
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Дедлайн: {note.deadline.toLocaleDateString("ru-RU")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{note.deadline.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="bg-[#1A1A1A] p-4 rounded-t-lg border border-gray-700 border-b-0">
            <div className="flex flex-wrap gap-2">
              {/* Text Formatting */}
              <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
                <button
                  onClick={() => execCommand("bold")}
                  className="p-2 hover:bg-gray-700 rounded text-white font-bold"
                  title="Жирный"
                >
                  B
                </button>
                <button
                  onClick={() => execCommand("italic")}
                  className="p-2 hover:bg-gray-700 rounded text-white italic"
                  title="Курсив"
                >
                  I
                </button>
                <button
                  onClick={() => execCommand("underline")}
                  className="p-2 hover:bg-gray-700 rounded text-white underline"
                  title="Подчеркнутый"
                >
                  U
                </button>
                <button
                  onClick={() => execCommand("strikeThrough")}
                  className="p-2 hover:bg-gray-700 rounded text-white line-through"
                  title="Зачеркнутый"
                >
                  S
                </button>
              </div>

              {/* Font Size */}
              <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
                <select
                  onChange={(e) => execCommand("fontSize", e.target.value)}
                  className="bg-gray-700 text-white text-sm p-1 rounded"
                  title="Размер шрифта"
                >
                  <option value="">Размер</option>
                  {Array.from({ length: 18 }, (_, i) => i + 9).map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Family */}
              <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
                <select
                  onChange={(e) => execCommand("fontName", e.target.value)}
                  className="bg-gray-700 text-white text-sm p-1 rounded"
                  title="Шрифт"
                >
                  <option value="">Шрифт</option>
                  <option value="Arial">Arial</option>
                  <option value="Book Antiqua">Book Antiqua</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>

              {/* Text Color */}
              <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
                <input
                  type="color"
                  onChange={(e) => execCommand("foreColor", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Цвет текста"
                />
              </div>

              {/* Alignment */}
              <div className="flex items-center space-x-1 border-r border-gray-600 pr-3">
                <button
                  onClick={() => execCommand("justifyLeft")}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="По левому краю"
                >
                  ⬅
                </button>
                <button
                  onClick={() => execCommand("justifyCenter")}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="По центру"
                >
                  ↔
                </button>
                <button
                  onClick={() => execCommand("justifyRight")}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="По правому краю"
                >
                  ➡
                </button>
                <button
                  onClick={() => execCommand("justifyFull")}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="По ширине"
                >
                  ⬌
                </button>
              </div>

              {/* Insert Elements */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="Вставить ссылку"
                >
                  🔗
                </button>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="Вставить изображение"
                >
                  🖼️
                </button>
                <button onClick={insertQuote} className="p-2 hover:bg-gray-700 rounded text-white" title="Цитата">
                  💬
                </button>
                <button
                  onClick={() => setShowTableModal(true)}
                  className="p-2 hover:bg-gray-700 rounded text-white"
                  title="Вставить таблицу"
                >
                  📊
                </button>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-[#1A1A1A] rounded-b-lg border border-gray-700 border-t-0">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className="w-full min-h-96 p-8 text-white text-lg leading-relaxed focus:outline-none"
              style={{ wordWrap: "break-word" }}
              suppressContentEditableWarning={true}
            />
          </div>

          {/* Status */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              {hasChanges ? "Есть несохраненные изменения" : "Все изменения сохранены"}
            </p>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-400 font-rajdhani">Вставить ссылку</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Текст ссылки</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Введите текст ссылки"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => setShowLinkModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button onClick={insertLink} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Вставить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-400 font-rajdhani">Вставить изображение</h3>
              <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">URL изображения</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Альтернативный текст</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  placeholder="Описание изображения"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => setShowImageModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button onClick={insertImage} className="flex-1 bg-green-600 hover:bg-green-700">
                  Вставить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-orange-400 font-rajdhani">Вставить таблицу</h3>
              <button onClick={() => setShowTableModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Строки</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Столбцы</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => setShowTableModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button onClick={insertTable} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Вставить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
