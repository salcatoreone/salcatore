"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Search, X, Edit3, Trash2, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"

type BinderCategory = "jail" | "mute" | "ban" | "warn" | "pm" | "other"
type UsageType = "recon" | "everywhere"
type ModalType = "add" | "edit" | null

interface Binder {
  id: string
  name: string
  command: string
  category: BinderCategory
  time?: string
  reason: string
  usage: UsageType
  createdAt: Date
}

// Функция для получения аккаунт-специфичного ключа
const getStorageKey = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return `${accountKey}_binders`
}

const CATEGORIES = {
  jail: {
    label: "/jail",
    icon: "⚖️",
    color: "text-red-400",
    bgColor: "bg-red-600/20",
    borderColor: "border-red-500/50",
    description: "Посадить игрока в тюрьму",
  },
  mute: {
    label: "/mute",
    icon: "🔇",
    color: "text-orange-400",
    bgColor: "bg-orange-600/20",
    borderColor: "border-orange-500/50",
    description: "Заблокировать чат игроку",
  },
  ban: {
    label: "/ban",
    icon: "❌",
    color: "text-red-600",
    bgColor: "bg-red-700/20",
    borderColor: "border-red-600/50",
    description: "Заблокировать игрока",
  },
  warn: {
    label: "/warn",
    icon: "⚠️",
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/50",
    description: "Выдать предупреждение",
  },
  pm: {
    label: "/pm",
    icon: "✉️",
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-500/50",
    description: "Личное сообщение",
  },
  other: {
    label: "Прочее",
    icon: "📋",
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
    description: "Другие команды",
  },
}

interface BindersPageProps {
  accountName: string
  onBack: () => void
}

export default function BindersPage({ accountName, onBack }: BindersPageProps) {
  const [binders, setBinders] = useState<Binder[]>([])
  const [filteredBinders, setFilteredBinders] = useState<Binder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<BinderCategory | "all">("all")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingBinder, setEditingBinder] = useState<Binder | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const STORAGE_KEY = getStorageKey(accountName)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    command: "",
    category: "jail" as BinderCategory,
    time: "",
    reason: "",
    usage: "recon" as UsageType,
  })

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedBinders = localStorage.getItem(STORAGE_KEY)
      if (savedBinders) {
        const parsedBinders = JSON.parse(savedBinders, (key, value) => {
          if (key === "createdAt") {
            return new Date(value)
          }
          return value
        })
        setBinders(parsedBinders)
      }
    } catch (error) {
      console.error("Ошибка при загрузке биндеров:", error)
    }
  }, [STORAGE_KEY])

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(binders))
  }, [binders, STORAGE_KEY])

  // Фильтрация биндеров
  useEffect(() => {
    let filtered = binders

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter((binder) => binder.category === selectedCategory)
    }

    // Фильтр по поиску
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (binder) =>
          binder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          binder.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          binder.reason.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Сортировка по дате создания
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    setFilteredBinders(filtered)
  }, [binders, selectedCategory, searchQuery])

  const openModal = (type: ModalType, binder?: Binder) => {
    setActiveModal(type)
    if (type === "edit" && binder) {
      setEditingBinder(binder)
      setFormData({
        name: binder.name,
        command: binder.command,
        category: binder.category,
        time: binder.time || "",
        reason: binder.reason,
        usage: binder.usage,
      })
    } else {
      setEditingBinder(null)
      setFormData({
        name: "",
        command: "",
        category: "jail",
        time: "",
        reason: "",
        usage: "recon",
      })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingBinder(null)
    setFormData({
      name: "",
      command: "",
      category: "jail",
      time: "",
      reason: "",
      usage: "recon",
    })
  }

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.reason.trim()) return

    // Для "везде" проверяем наличие команды
    if (formData.usage === "everywhere" && !formData.command.trim()) return

    // Валидация времени в зависимости от категории
    if (formData.time && shouldShowTimeField()) {
      const timeValue = Number.parseInt(formData.time)
      const limits = getTimeLimits()
      if (isNaN(timeValue) || timeValue < limits.min || timeValue > limits.max) {
        alert(`Время должно быть от ${limits.min} до ${limits.max}`)
        return
      }
    }

    if (activeModal === "edit" && editingBinder) {
      // Редактирование существующего биндера
      setBinders((prev) =>
        prev.map((binder) =>
          binder.id === editingBinder.id
            ? {
                ...binder,
                name: formData.name.trim(),
                command: formData.command.trim(),
                category: formData.category,
                time: formData.time.trim() || undefined,
                reason: formData.reason.trim(),
                usage: formData.usage,
              }
            : binder,
        ),
      )
    } else {
      // Добавление нового биндера
      const newBinder: Binder = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        command: formData.command.trim(),
        category: formData.category,
        time: formData.time.trim() || undefined,
        reason: formData.reason.trim(),
        usage: formData.usage,
        createdAt: new Date(),
      }
      setBinders((prev) => [newBinder, ...prev])
    }

    closeModal()
  }

  const handleDelete = (binderId: string) => {
    setBinders((prev) => prev.filter((binder) => binder.id !== binderId))
  }

  const generateCommand = (binder: Binder) => {
    if (binder.usage === "recon") {
      const category = CATEGORIES[binder.category].label
      let command = `${category} {reconID}`
      if (binder.time) {
        command += ` ${binder.time}`
      }
      command += ` ${binder.reason}`
      return command
    } else {
      return binder.command
    }
  }

  const shouldShowTimeField = () => {
    return formData.category !== "warn"
  }

  const getTimeLimits = () => {
    switch (formData.category) {
      case "jail":
        return { min: 15, max: 300 }
      case "mute":
        return { min: 15, max: 600 }
      case "ban":
        return { min: 1, max: 30 }
      default:
        return { min: 1, max: 9999 }
    }
  }

  const getTimePlaceholder = () => {
    const limits = getTimeLimits()
    switch (formData.category) {
      case "jail":
        return `От ${limits.min} до ${limits.max} минут`
      case "mute":
        return `От ${limits.min} до ${limits.max} минут`
      case "ban":
        return `От ${limits.min} до ${limits.max} дней`
      default:
        return "Введите время"
    }
  }

  const copyToClipboard = async (text: string, binderId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(binderId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Ошибка при копировании:", error)
    }
  }

  const renderModal = () => {
    if (!activeModal) return null

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-orange-400 font-rajdhani">
              {activeModal === "edit" ? "Редактировать биндер" : "Добавить биндер"}
            </h3>
            <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Название */}
            <div>
              <label className="block text-gray-300 mb-2">Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Введите название биндера"
              />
            </div>

            {/* Категория */}
            <div>
              <label className="block text-gray-300 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as BinderCategory }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Использование */}
            <div>
              <label className="block text-gray-300 mb-2">Использование</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, usage: "recon" }))}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    formData.usage === "recon"
                      ? "bg-orange-600/20 border-orange-500 text-orange-400"
                      : "bg-gray-700/20 border-gray-600 text-gray-400 hover:bg-gray-700/30"
                  }`}
                >
                  Только в реконе
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, usage: "everywhere" }))}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    formData.usage === "everywhere"
                      ? "bg-orange-600/20 border-orange-500 text-orange-400"
                      : "bg-gray-700/20 border-gray-600 text-gray-400 hover:bg-gray-700/30"
                  }`}
                >
                  Везде
                </button>
              </div>
            </div>

            {/* Название команды (только для "везде") */}
            {formData.usage === "everywhere" && (
              <div>
                <label className="block text-gray-300 mb-2">Название команды</label>
                <input
                  type="text"
                  value={formData.command}
                  onChange={(e) => setFormData((prev) => ({ ...prev, command: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Введите полную команду"
                />
              </div>
            )}

            {/* Время (с ограничениями) */}
            {shouldShowTimeField() && (
              <div>
                <label className="block text-gray-300 mb-2">
                  Время {formData.category === "other" || formData.category === "pm" ? "(необязательно)" : ""}
                </label>
                <input
                  type="number"
                  min={getTimeLimits().min}
                  max={getTimeLimits().max}
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder={getTimePlaceholder()}
                />
                <p className="text-gray-500 text-xs mt-1">{getTimePlaceholder()}</p>
              </div>
            )}

            {/* Причина наказания */}
            <div>
              <label className="block text-gray-300 mb-2">Причина наказания</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Введите причину наказания"
              />
            </div>

            {/* Предпросмотр команды */}
            {formData.reason && (
              <div className="bg-[#252525] p-3 rounded-lg border border-gray-600">
                <label className="block text-gray-300 mb-2 text-sm">Предпросмотр команды:</label>
                <code className="text-green-400 text-sm">
                  {formData.usage === "recon"
                    ? `${CATEGORIES[formData.category].label} {reconID}${formData.time && shouldShowTimeField() ? ` ${formData.time}` : ""} ${formData.reason}`
                    : formData.command || "Введите команду"}
                </code>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex space-x-3 pt-4">
              <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.name.trim() ||
                  !formData.reason.trim() ||
                  (formData.usage === "everywhere" && !formData.command.trim())
                }
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeModal === "edit" ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
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
            <p className="text-orange-500 font-mono font-bold">{binders.length} биндеров</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">📁 БИНДЕРЫ</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
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
                  className="w-full pl-10 pr-4 py-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Поиск биндеров..."
                />
              </div>
              <Button
                onClick={() => openModal("add")}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-rajdhani tracking-wider transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить биндер
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
                Все биндеры ({binders.length})
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => {
                const count = binders.filter((binder) => binder.category === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as BinderCategory)}
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

          {/* Binders List */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border border-gray-700">
            {filteredBinders.length > 0 ? (
              <div className="space-y-4">
                {filteredBinders.map((binder) => {
                  const category = CATEGORIES[binder.category]
                  const command = generateCommand(binder)

                  return (
                    <div
                      key={binder.id}
                      className={`group relative bg-gradient-to-r from-[#252525] to-[#1A1A1A] p-6 rounded-xl border-2 ${category.borderColor} hover:border-opacity-100 hover:shadow-lg transition-all duration-300`}
                    >
                      {/* Category Badge */}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 ${category.bgColor} ${category.borderColor} border rounded-full text-xs ${category.color} font-semibold backdrop-blur-sm`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.label}
                      </div>

                      {/* Binder Content */}
                      <div className="relative z-10 pr-24">
                        <h3 className="text-xl font-bold text-white mb-3 font-rajdhani">{binder.name}</h3>

                        {/* Command */}
                        <div className="mb-4 p-3 bg-[#1A1A1A]/50 rounded-lg border border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <code className="text-green-400 font-mono text-sm flex-1 mr-3">{command}</code>
                            <button
                              onClick={() => copyToClipboard(command, binder.id)}
                              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                              title="Копировать команду"
                            >
                              {copiedId === binder.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-white" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Использование:</span>
                            <div
                              className={`font-semibold ${binder.usage === "recon" ? "text-blue-400" : "text-purple-400"}`}
                            >
                              {binder.usage === "recon" ? "Только в реконе" : "Везде"}
                            </div>
                          </div>
                          {binder.time && (
                            <div>
                              <span className="text-gray-400">Время:</span>
                              <div className="text-yellow-400 font-semibold">{binder.time}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Причина:</span>
                            <div className="text-white font-semibold">{binder.reason}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                        <button
                          onClick={() => openModal("edit", binder)}
                          className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(binder.id)}
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
                  {searchQuery || selectedCategory !== "all" ? "Биндеры не найдены" : "Биндеры отсутствуют"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {searchQuery || selectedCategory !== "all"
                    ? "Попробуйте изменить фильтры поиска"
                    : "Создайте свой первый биндер, чтобы начать"}
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
