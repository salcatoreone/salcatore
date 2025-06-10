"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"

interface AccountPageProps {
  accountName: string
  onBack: () => void
  onNavigate: (section: string) => void
}

interface FinanceData {
  cash: number
  bank_account: number
  deposit: number
  dirty_money: number
  org_account: number
  territory_account: number
}

interface Currency {
  id: string
  name: string
  symbol: string
  icon: string
  amount: number
  rate: number
  isApiRate: boolean
}

// Функция для получения аккаунт-специфичных ключей
const getStorageKeys = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return {
    FINANCES: `${accountKey}_finances`,
    CURRENCIES: `${accountKey}_currencies`,
  }
}

export default function AccountPage({ accountName, onBack, onNavigate }: AccountPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [totalMoney, setTotalMoney] = useState(0)

  const STORAGE_KEYS = getStorageKeys(accountName)

  // Загрузка финансовых данных из localStorage
  useEffect(() => {
    try {
      let total = 0

      // Загрузка основных финансов
      const savedFinances = localStorage.getItem(STORAGE_KEYS.FINANCES)
      if (savedFinances) {
        const finances: FinanceData = JSON.parse(savedFinances)
        const whiteTotal = finances.cash + finances.bank_account + finances.deposit
        const blackTotal = finances.dirty_money + finances.org_account + finances.territory_account
        total += whiteTotal + blackTotal
      }

      // Загрузка валют
      const savedCurrencies = localStorage.getItem(STORAGE_KEYS.CURRENCIES)
      if (savedCurrencies) {
        const currencies: Currency[] = JSON.parse(savedCurrencies)
        const currencyTotal = currencies.reduce((sum, currency) => sum + currency.amount * currency.rate, 0)
        total += currencyTotal
      }

      setTotalMoney(total)
    } catch (error) {
      console.error("Ошибка при загрузке финансовых данных:", error)
    }
  }, [STORAGE_KEYS])

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const menuItems = [
    { id: "finances", label: "Финансы", icon: "💵", color: "text-green-400" },
    { id: "items", label: "Предметы", icon: "🎒", color: "text-blue-400" },
    { id: "property", label: "Имущество", icon: "🏠", color: "text-yellow-400" },
    { id: "notes", label: "Заметки", icon: "📄", color: "text-purple-400" },
    { id: "binders", label: "Биндеры", icon: "📁", color: "text-orange-400" },
    { id: "converter", label: "Конвертер", icon: "🔄", color: "text-cyan-400" },
  ]

  const navigateToSection = (section: string) => {
    onNavigate(section)
    setIsMenuOpen(false)
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
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-[#1A1A1A] border border-gray-700 rounded-lg hover:border-red-500 transition-colors duration-300"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Back Button */}
          <Button
            onClick={onBack}
            className="px-6 py-2 bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white transition-all duration-300"
          >
            ← Назад
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="relative z-10 text-center py-12">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-wider font-rajdhani">
          {accountName.toUpperCase()}
        </h1>
        <div className="text-4xl md:text-6xl font-bold text-red-500 font-mono">
          <span className="drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">{formatCurrency(totalMoney)}</span>
        </div>
        <p className="text-gray-400 mt-4 font-inter">Arizona RP • Sedona Server</p>
      </div>

      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#1A1A1A]/95 backdrop-blur-sm border-r border-gray-700 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white font-rajdhani">МЕНЮ</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <nav className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToSection(item.id)}
                className={`w-full flex items-center space-x-4 p-4 bg-[#252525] hover:bg-[#2A2A2A] rounded-lg transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-gray-500`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-rajdhani font-semibold ${item.color}`}>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsMenuOpen(false)}></div>}
    </div>
  )
}
