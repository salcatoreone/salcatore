"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Search, X, Edit3, Trash2 } from "lucide-react"

interface ItemsPageProps {
  accountName: string
  onBack: () => void
}

type ItemCategory = "skins" | "accessories" | "certificates" | "resources"

interface Item {
  id: string
  name: string
  category: ItemCategory
  quantity: number
  priceFrom: number
  priceTo: number
  createdAt: Date
}

type ModalType = "add" | "edit" | null

// Функция для получения аккаунт-специфичного ключа
const getStorageKey = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return `${accountKey}_items`
}

const CATEGORIES = {
  skins: {
    label: "Скины",
    icon: "🎨",
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    borderColor: "border-purple-500/50",
  },
  accessories: {
    label: "Аксессуары",
    icon: "👑",
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/50",
  },
  certificates: {
    label: "Сертификаты",
    icon: "📜",
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-500/50",
  },
  resources: {
    label: "Ресурсы",
    icon: "⚡",
    color: "text-green-400",
    bgColor: "bg-green-600/20",
    borderColor: "border-green-500/50",
  },
}

export default function ItemsPage({ accountName, onBack }: ItemsPageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "all">("all")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const STORAGE_KEY = getStorageKey(accountName)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "skins" as ItemCategory,
    quantity: "",
    priceFrom: "",
    priceTo: "",
  })

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY)
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems, (key, value) => {
          if (key === "createdAt") {
            return new Date(value)
          }
          return value
        })
        setItems(parsedItems)
      }
    } catch (error) {
      console.error("Ошибка при загрузке предметов:", error)
    }
  }, [STORAGE_KEY])

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, STORAGE_KEY])

  // Фильтрация предметов
  useEffect(() => {
    let filtered = items

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Фильтр по поиску
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredItems(filtered)
  }, [items, selectedCategory, searchQuery])

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatQuantity = (quantity: number) => {
    return quantity >= 1000 ? quantity.toLocaleString("en-US") : quantity.toString()
  }

  const openModal = (type: ModalType, item?: Item) => {
    setActiveModal(type)
    if (type === "edit" && item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        priceFrom: item.priceFrom.toString(),
        priceTo: item.priceTo.toString(),
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: "",
        category: "skins",
        quantity: "",
        priceFrom: "",
        priceTo: "",
      })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingItem(null)
    setFormData({
      name: "",
      category: "skins",
      quantity: "",
      priceFrom: "",
      priceTo: "",
    })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.quantity || !formData.priceFrom || !formData.priceTo) return

    const quantity = Number.parseInt(formData.quantity)
    const priceFrom = Number.parseFloat(formData.priceFrom)
    const priceTo = Number.parseFloat(formData.priceTo)

    if (isNaN(quantity) || isNaN(priceFrom) || isNaN(priceTo) || quantity <= 0 || priceFrom < 0 || priceTo < priceFrom)
      return

    if (activeModal === "edit" && editingItem) {
      // Редактирование существующего предмета
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                quantity,
                priceFrom,
                priceTo,
              }
            : item,
        ),
      )
    } else {
      // Добавление нового предмета
      const newItem: Item = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        quantity,
        priceFrom,
        priceTo,
        createdAt: new Date(),
      }
      setItems((prev) => [newItem, ...prev])
    }

    closeModal()
  }

  const handleDelete = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const renderModal = () => {
    if (!activeModal) return null

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-blue-400 font-rajdhani">
              {activeModal === "edit" ? "Редактировать предмет" : "Добавить предмет"}
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
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Введите название предмета"
              />
            </div>

            {/* Категория */}
            <div>
              <label className="block text-gray-300 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as ItemCategory }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Количество */}
            <div>
              <label className="block text-gray-300 mb-2">Количество</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="1"
              />
            </div>

            {/* Стоимость */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Цена от</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceFrom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceFrom: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Цена до</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceTo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceTo: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex space-x-3 pt-4">
              <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.quantity || !formData.priceFrom || !formData.priceTo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-blue-500 font-mono font-bold">{items.length} предметов</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">🎒 ПРЕДМЕТЫ</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
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
                  className="w-full pl-10 pr-4 py-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Поиск предметов..."
                />
              </div>
              <Button
                onClick={() => openModal("add")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-rajdhani tracking-wider transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Добавить предмет
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
                Все категории ({items.length})
              </button>
              {Object.entries(CATEGORIES).map(([key, category]) => {
                const count = items.filter((item) => item.category === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as ItemCategory)}
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

          {/* Items Grid */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border border-gray-700">
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const category = CATEGORIES[item.category]
                  return (
                    <div
                      key={item.id}
                      className={`group relative bg-gradient-to-br from-[#252525] to-[#1A1A1A] p-6 rounded-xl border-2 ${category.borderColor} hover:border-opacity-100 hover:shadow-lg hover:shadow-${category.color.split("-")[1]}-500/20 transition-all duration-300 overflow-hidden`}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: "20px 20px",
                          }}
                        ></div>
                      </div>

                      {/* Category Badge */}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 ${category.bgColor} ${category.borderColor} border rounded-full text-xs ${category.color} font-semibold backdrop-blur-sm`}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.label}
                      </div>

                      {/* Item Header */}
                      <div className="relative z-10 mb-6">
                        <h3 className="text-xl font-bold text-white mb-3 font-rajdhani pr-24 leading-tight">
                          {item.name}
                        </h3>

                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Quantity Card */}
                          <div className="bg-[#1A1A1A]/50 p-3 rounded-lg border border-gray-700/50">
                            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Количество</div>
                            <div className="text-white font-mono font-bold text-lg">
                              {formatQuantity(item.quantity)}
                            </div>
                            <div className="text-gray-500 text-xs">штук</div>
                          </div>

                          {/* Price Range Card */}
                          <div className="bg-[#1A1A1A]/50 p-3 rounded-lg border border-gray-700/50">
                            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">За штуку</div>
                            <div className={`font-mono font-bold text-sm ${category.color} flex items-center gap-1`}>
                              <span>от {formatCurrency(item.priceFrom)}</span>
                            </div>
                            <div className={`font-mono font-bold text-sm ${category.color} flex items-center gap-1`}>
                              <span>до {formatCurrency(item.priceTo)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Total Value */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/30">
                          <div className="text-green-300 text-xs uppercase tracking-wide mb-2">Общая стоимость</div>
                          <div className="space-y-1">
                            <div className="text-green-400 font-mono font-bold text-sm">
                              от {formatCurrency(item.priceFrom * item.quantity)}
                            </div>
                            <div className="text-green-400 font-mono font-bold text-sm">
                              до {formatCurrency(item.priceTo * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                        <button
                          onClick={() => openModal("edit", item)}
                          className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
                  {searchQuery || selectedCategory !== "all" ? "Предметы не найдены" : "Предметы отсутствуют"}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {searchQuery || selectedCategory !== "all"
                    ? "Попробуйте изменить фильтры поиска"
                    : "Добавьте свой первый предмет, чтобы начать"}
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
