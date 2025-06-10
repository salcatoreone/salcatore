"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Edit3, X } from "lucide-react"

interface ConverterPageProps {
  accountName: string
  onBack: () => void
}

interface ExchangeRate {
  id: string
  name: string
  symbol: string
  icon: string
  buyRate: number
  sellRate: number
  isEditable: boolean
  lastUpdated: Date
}

// Функция для получения аккаунт-специфичного ключа
const getStorageKey = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return `${accountKey}_exchange_rates`
}

export default function ConverterPage({ accountName, onBack }: ConverterPageProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null)
  const [editBuyRate, setEditBuyRate] = useState("")
  const [editSellRate, setEditSellRate] = useState("")

  const STORAGE_KEY = getStorageKey(accountName)

  // Инициализация курсов валют
  useEffect(() => {
    const initializeRates = () => {
      const savedRates = localStorage.getItem(STORAGE_KEY)
      if (savedRates) {
        const parsedRates = JSON.parse(savedRates, (key, value) => {
          if (key === "lastUpdated") {
            return new Date(value)
          }
          return value
        })
        setExchangeRates(parsedRates)
      } else {
        // Инициализация с дефолтными значениями
        const defaultRates: ExchangeRate[] = [
          {
            id: "btc",
            name: "Bitcoin",
            symbol: "BTC",
            icon: "₿",
            buyRate: 95000,
            sellRate: 93000,
            isEditable: false,
            lastUpdated: new Date(),
          },
          {
            id: "eur",
            name: "Euro",
            symbol: "EUR",
            icon: "€",
            buyRate: 1.08,
            sellRate: 1.06,
            isEditable: false,
            lastUpdated: new Date(),
          },
          {
            id: "vc",
            name: "VC-coin",
            symbol: "VC",
            icon: "⚡",
            buyRate: 95,
            sellRate: 90,
            isEditable: true,
            lastUpdated: new Date(),
          },
        ]
        setExchangeRates(defaultRates)
      }
    }

    initializeRates()
    fetchExchangeRates()
  }, [STORAGE_KEY])

  // Сохранение курсов в localStorage
  useEffect(() => {
    if (exchangeRates.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exchangeRates))
    }
  }, [exchangeRates, STORAGE_KEY])

  // Получение актуальных курсов BTC и EUR
  const fetchExchangeRates = async () => {
    setIsLoading(true)
    try {
      // Получение курса BTC
      const btcResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      const btcData = await btcResponse.json()
      const btcPrice = btcData.bitcoin.usd

      // Получение курса EUR
      const eurResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
      const eurData = await eurResponse.json()
      const eurRate = 1 / eurData.rates.EUR

      setExchangeRates((prev) =>
        prev.map((rate) => {
          if (rate.id === "btc") {
            return {
              ...rate,
              buyRate: Math.round(btcPrice * 1.02), // +2% для покупки
              sellRate: Math.round(btcPrice * 0.98), // -2% для продажи
              lastUpdated: new Date(),
            }
          }
          if (rate.id === "eur") {
            return {
              ...rate,
              buyRate: Number((eurRate * 1.015).toFixed(4)), // +1.5% для покупки
              sellRate: Number((eurRate * 0.985).toFixed(4)), // -1.5% для продажи
              lastUpdated: new Date(),
            }
          }
          return rate
        }),
      )
    } catch (error) {
      console.error("Ошибка при получении курсов валют:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "BTC") {
      return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
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

  const getDaysUntilUpdate = (lastUpdated: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - lastUpdated.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, 3 - diffDays)
  }

  const openEditModal = (rate: ExchangeRate) => {
    setEditingRate(rate)
    setEditBuyRate(rate.buyRate.toString())
    setEditSellRate(rate.sellRate.toString())
  }

  const closeEditModal = () => {
    setEditingRate(null)
    setEditBuyRate("")
    setEditSellRate("")
  }

  const saveEditedRate = () => {
    if (!editingRate) return

    const buyRate = Number.parseFloat(editBuyRate)
    const sellRate = Number.parseFloat(editSellRate)

    if (isNaN(buyRate) || isNaN(sellRate) || buyRate <= 0 || sellRate <= 0 || sellRate >= buyRate) {
      alert("Некорректные значения курсов. Курс продажи должен быть меньше курса покупки.")
      return
    }

    setExchangeRates((prev) =>
      prev.map((rate) =>
        rate.id === editingRate.id
          ? {
              ...rate,
              buyRate,
              sellRate,
              lastUpdated: new Date(),
            }
          : rate,
      ),
    )

    closeEditModal()
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
          <div className="flex items-center space-x-4">
            <Button
              onClick={fetchExchangeRates}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Обновить курсы</span>
            </Button>
            <div className="text-right">
              <p className="text-gray-400 text-sm">{accountName}</p>
              <p className="text-cyan-500 font-mono font-bold">Конвертер валют</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">
              🔄 КОНВЕРТЕР
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Курсы валют для обмена</p>
          </div>

          {/* Exchange Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exchangeRates.map((rate) => {
              const daysUntilUpdate = getDaysUntilUpdate(rate.lastUpdated)
              const isOutdated = daysUntilUpdate === 0 && !rate.isEditable

              return (
                <div
                  key={rate.id}
                  className={`group relative bg-[#1A1A1A] p-8 rounded-lg border-2 transition-all duration-300 ${
                    rate.id === "btc"
                      ? "border-orange-500/30 hover:border-orange-500/50"
                      : rate.id === "eur"
                        ? "border-blue-500/30 hover:border-blue-500/50"
                        : "border-purple-500/30 hover:border-purple-500/50"
                  }`}
                >
                  {/* Currency Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{rate.icon}</span>
                      <div>
                        <h3 className="text-white font-bold text-xl font-rajdhani">{rate.name}</h3>
                        <p className="text-gray-400 text-sm">{rate.symbol}</p>
                      </div>
                    </div>
                    {rate.isEditable && (
                      <button
                        onClick={() => openEditModal(rate)}
                        className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Редактировать курс"
                      >
                        <Edit3 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Exchange Rates */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-[#252525] p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Покупка:</span>
                        <span className="text-green-400 font-mono font-bold text-lg">
                          {formatCurrency(rate.buyRate, rate.symbol)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#252525] p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Продажа:</span>
                        <span className="text-red-400 font-mono font-bold text-lg">
                          {formatCurrency(rate.sellRate, rate.symbol)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Info */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-xs text-gray-500">
                      <div>Обновлено: {formatDateTime(rate.lastUpdated)}</div>
                      {!rate.isEditable && (
                        <div className={`mt-1 ${isOutdated ? "text-red-400" : "text-yellow-400"}`}>
                          {isOutdated ? "Требует обновления" : `Следующее обновление через ${daysUntilUpdate} дн.`}
                        </div>
                      )}
                      {rate.isEditable && <div className="mt-1 text-purple-400">Редактируемый курс</div>}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isOutdated && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-[#1A1A1A] p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 font-rajdhani flex items-center">
              <span className="mr-3">ℹ️</span>
              Информация о курсах
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-[#252525] p-4 rounded-lg">
                <h3 className="text-orange-400 font-semibold mb-2">Bitcoin (BTC)</h3>
                <p className="text-gray-300">
                  Курс обновляется автоматически каждые 3 дня через API CoinGecko. Спред составляет ±2% от рыночной
                  цены.
                </p>
              </div>
              <div className="bg-[#252525] p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">Euro (EUR)</h3>
                <p className="text-gray-300">
                  Курс обновляется автоматически каждые 3 дня через API ExchangeRate. Спред составляет ±1.5% от рыночной
                  цены.
                </p>
              </div>
              <div className="bg-[#252525] p-4 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-2">VC-coin (VC)</h3>
                <p className="text-gray-300">
                  Внутриигровая валюта с фиксированным курсом. Может быть изменена вручную администратором сервера.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-purple-400 font-rajdhani">Редактировать курс {editingRate.name}</h3>
              <button onClick={closeEditModal} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Курс покупки</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editBuyRate}
                  onChange={(e) => setEditBuyRate(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Курс продажи</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editSellRate}
                  onChange={(e) => setEditSellRate(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="text-xs text-gray-500">
                <p>Курс продажи должен быть меньше курса покупки</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={closeEditModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button
                  onClick={saveEditedRate}
                  disabled={!editBuyRate || !editSellRate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
