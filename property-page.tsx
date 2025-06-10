"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { Plus, X, Edit3, Trash2 } from "lucide-react"

type PropertyCategory = "movable" | "immovable"
type ModalType = "add" | "edit" | null

interface Property {
  id: string
  name: string
  category: PropertyCategory
  priceFrom: number
  priceTo: number
  createdAt: Date
}

// Функция для получения аккаунт-специфичного ключа
const getStorageKey = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return `${accountKey}_property`
}

const CATEGORIES = {
  movable: {
    label: "Движимое имущество",
    icon: "🚗",
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-500/50",
  },
  immovable: {
    label: "Недвижимое имущество",
    icon: "🏢",
    color: "text-orange-400",
    bgColor: "bg-orange-600/20",
    borderColor: "border-orange-500/50",
  },
}

interface PropertyPageProps {
  accountName: string
  onBack: () => void
}

export default function PropertyPage({ accountName, onBack }: PropertyPageProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const STORAGE_KEY = getStorageKey(accountName)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "movable" as PropertyCategory,
    priceFrom: "",
    priceTo: "",
  })

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedProperties = localStorage.getItem(STORAGE_KEY)
      if (savedProperties) {
        const parsedProperties = JSON.parse(savedProperties, (key, value) => {
          if (key === "createdAt") {
            return new Date(value)
          }
          return value
        })
        setProperties(parsedProperties)
      }
    } catch (error) {
      console.error("Ошибка при загрузке имущества:", error)
    }
  }, [STORAGE_KEY])

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
  }, [properties, STORAGE_KEY])

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const openModal = (type: ModalType, property?: Property) => {
    setActiveModal(type)
    if (type === "edit" && property) {
      setEditingProperty(property)
      setFormData({
        name: property.name,
        category: property.category,
        priceFrom: property.priceFrom.toString(),
        priceTo: property.priceTo.toString(),
      })
    } else {
      setEditingProperty(null)
      setFormData({
        name: "",
        category: "movable",
        priceFrom: "",
        priceTo: "",
      })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingProperty(null)
    setFormData({
      name: "",
      category: "movable",
      priceFrom: "",
      priceTo: "",
    })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.priceFrom || !formData.priceTo) return

    const priceFrom = Number.parseFloat(formData.priceFrom)
    const priceTo = Number.parseFloat(formData.priceTo)

    if (isNaN(priceFrom) || isNaN(priceTo) || priceFrom < 0 || priceTo < priceFrom) return

    if (activeModal === "edit" && editingProperty) {
      // Редактирование существующего имущества
      setProperties((prev) =>
        prev.map((property) =>
          property.id === editingProperty.id
            ? {
                ...property,
                name: formData.name,
                category: formData.category,
                priceFrom,
                priceTo,
              }
            : property,
        ),
      )
    } else {
      // Добавление нового имущества
      const newProperty: Property = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        priceFrom,
        priceTo,
        createdAt: new Date(),
      }
      setProperties((prev) => [newProperty, ...prev])
    }

    closeModal()
  }

  const handleDelete = (propertyId: string) => {
    setProperties((prev) => prev.filter((property) => property.id !== propertyId))
  }

  const renderModal = () => {
    if (!activeModal) return null

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-orange-400 font-rajdhani">
              {activeModal === "edit" ? "Редактировать имущество" : "Добавить имущество"}
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
                placeholder="Введите название имущества"
              />
            </div>

            {/* Категория */}
            <div>
              <label className="block text-gray-300 mb-2">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as PropertyCategory }))}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Стоимость */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Стоимость от</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceFrom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceFrom: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Стоимость до</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceTo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceTo: e.target.value }))}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
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
                disabled={!formData.name || !formData.priceFrom || !formData.priceTo}
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
            <p className="text-red-500 font-mono font-bold">$0</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">
              🏠 ИМУЩЕСТВО
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto"></div>
          </div>

          {/* Add Property Button */}
          <div className="mb-8 text-center">
            <Button
              onClick={() => openModal("add")}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-rajdhani tracking-wider transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить имущество
            </Button>
          </div>

          {/* Property Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicles */}
            <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-rajdhani flex items-center">
                <span className="mr-3">🚗</span>
                Движимое имущество
              </h2>
              <div className="space-y-4">
                {properties.filter((p) => p.category === "movable").length > 0 ? (
                  properties
                    .filter((p) => p.category === "movable")
                    .map((property) => (
                      <div
                        key={property.id}
                        className="group relative bg-[#252525] p-4 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold mb-2">{property.name}</h3>
                            <div className="text-yellow-400 font-mono text-sm">
                              {formatCurrency(property.priceFrom)} - {formatCurrency(property.priceTo)}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                            <button
                              onClick={() => openModal("edit", property)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                              title="Редактировать"
                            >
                              <Edit3 className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Движимое имущество отсутствует</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Здесь будут отображаться ваши автомобили, мотоциклы и другой транспорт
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Real Estate */}
            <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-orange-500/30 hover:border-orange-500/50 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-orange-400 mb-6 font-rajdhani flex items-center">
                <span className="mr-3">🏢</span>
                Недвижимое имущество
              </h2>
              <div className="space-y-4">
                {properties.filter((p) => p.category === "immovable").length > 0 ? (
                  properties
                    .filter((p) => p.category === "immovable")
                    .map((property) => (
                      <div
                        key={property.id}
                        className="group relative bg-[#252525] p-4 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold mb-2">{property.name}</h3>
                            <div className="text-orange-400 font-mono text-sm">
                              {formatCurrency(property.priceFrom)} - {formatCurrency(property.priceTo)}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                            <button
                              onClick={() => openModal("edit", property)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                              title="Редактировать"
                            >
                              <Edit3 className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Недвижимость отсутствует</p>
                    <p className="text-gray-600 text-sm mt-2">Здесь будут отображаться ваши дома, квартиры и бизнесы</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {renderModal()}
    </div>
  )
}
