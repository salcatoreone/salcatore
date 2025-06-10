"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRightLeft, Plus, Minus, Edit3, X, Settings } from "lucide-react"

interface FinancesPageProps {
  accountName: string
  onBack: () => void
}

type ModalType = "add" | "subtract" | "edit" | "editPercent" | "editCurrency" | null
type AccountField = "cash" | "bank_account" | "deposit" | "dirty_money" | "org_account" | "territory_account"

interface Transaction {
  id: string
  type: "white" | "black" | "laundering"
  operation: "add" | "subtract" | "edit"
  field: AccountField
  amount: number
  reason: string
  balanceBefore: number
  balanceAfter: number
  timestamp: Date
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

interface CurrencyRates {
  btc: number
  euro: number
  vccoin: number
}

// Функция для получения аккаунт-специфичных ключей
const getStorageKeys = (accountName: string) => {
  const accountKey = accountName.toLowerCase().replace(/\s+/g, "_")
  return {
    FINANCES: `${accountKey}_finances`,
    TRANSACTIONS: `${accountKey}_transactions`,
    LAUNDERING_PERCENTAGE: `${accountKey}_laundering_percentage`,
    CURRENCIES: `${accountKey}_currencies`,
    CURRENCY_RATES: `${accountKey}_currency_rates`,
  }
}

export default function FinancesPage({ accountName, onBack }: FinancesPageProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedField, setSelectedField] = useState<AccountField | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [newPercentage, setNewPercentage] = useState("75")
  const [newRate, setNewRate] = useState("")
  const [launderingPercentage, setLaunderingPercentage] = useState(75)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeFilter, setActiveFilter] = useState<"all" | "white" | "black" | "laundering">("all")
  const [btcPrice, setBtcPrice] = useState<number>(0)

  const STORAGE_KEYS = getStorageKeys(accountName)

  // Финансовые данные
  const [finances, setFinances] = useState<FinanceData>({
    cash: 0,
    bank_account: 0,
    deposit: 0,
    dirty_money: 0,
    org_account: 0,
    territory_account: 0,
  })

  // Валюты
  const [currencies, setCurrencies] = useState<Currency[]>([
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      icon: "₿",
      amount: 0,
      rate: 0,
      isApiRate: true,
    },
    {
      id: "euro",
      name: "Euro",
      symbol: "EUR",
      icon: "€",
      amount: 0,
      rate: 4.818,
      isApiRate: false,
    },
    {
      id: "vccoin",
      name: "VC-coin",
      symbol: "VC",
      icon: "⚡",
      amount: 0,
      rate: 95,
      isApiRate: false,
    },
  ])

  // Загрузка курса BTC
  const fetchBTCPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      const data = await response.json()
      const btcRate = data.bitcoin.usd
      setBtcPrice(btcRate)

      setCurrencies((prev) =>
        prev.map((currency) => (currency.id === "btc" ? { ...currency, rate: btcRate } : currency)),
      )
    } catch (error) {
      console.error("Ошибка при получении курса BTC:", error)
    }
  }

  // Загрузка данных из localStorage при монтировании компонента
  useEffect(() => {
    const loadData = () => {
      try {
        // Загрузка финансовых данных
        const savedFinances = localStorage.getItem(STORAGE_KEYS.FINANCES)
        if (savedFinances) {
          setFinances(JSON.parse(savedFinances))
        }

        // Загрузка процента отмыва
        const savedPercentage = localStorage.getItem(STORAGE_KEYS.LAUNDERING_PERCENTAGE)
        if (savedPercentage) {
          const percentage = Number.parseInt(savedPercentage)
          setLaunderingPercentage(percentage)
          setNewPercentage(percentage.toString())
        }

        // Загрузка истории транзакций
        const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions, (key, value) => {
            if (key === "timestamp") {
              return new Date(value)
            }
            return value
          })
          setTransactions(parsedTransactions)
        }

        // Загрузка валют
        const savedCurrencies = localStorage.getItem(STORAGE_KEYS.CURRENCIES)
        if (savedCurrencies) {
          const parsedCurrencies = JSON.parse(savedCurrencies)
          setCurrencies((prev) =>
            prev.map((currency) => {
              const saved = parsedCurrencies.find((c: Currency) => c.id === currency.id)
              return saved
                ? { ...currency, amount: saved.amount, rate: saved.isApiRate ? currency.rate : saved.rate }
                : currency
            }),
          )
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных из localStorage:", error)
      }
    }

    loadData()
    fetchBTCPrice()

    // Обновление курса BTC каждые 5 минут
    const interval = setInterval(fetchBTCPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [accountName])

  // Сохранение финансовых данных при их изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(finances))
  }, [finances])

  // Сохранение процента отмыва при его изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAUNDERING_PERCENTAGE, launderingPercentage.toString())
  }, [launderingPercentage])

  // Сохранение истории транзакций при её изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  // Сохранение валют при их изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies))
  }, [currencies])

  const openModal = (type: ModalType, field?: AccountField, currency?: Currency) => {
    setActiveModal(type)
    setSelectedField(field || null)
    setSelectedCurrency(currency || null)
    setAmount("")
    setReason("")
    if (currency && type === "editCurrency") {
      setNewRate(currency.rate.toString())
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setSelectedField(null)
    setSelectedCurrency(null)
    setAmount("")
    setReason("")
    setNewRate("")
  }

  const getFieldDisplayName = (field: AccountField) => {
    const names = {
      cash: "Наличные",
      bank_account: "Банковский счёт",
      deposit: "Депозит",
      dirty_money: "Грязные деньги",
      org_account: "Счёт ОРГ",
      territory_account: "Счёт Тер",
    }
    return names[field]
  }

  const getTransactionType = (field: AccountField): "white" | "black" => {
    return ["cash", "bank_account", "deposit"].includes(field) ? "white" : "black"
  }

  const handleFinancialOperation = () => {
    if (!selectedField || !amount || !reason) return

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const currentBalance = finances[selectedField]
    let newBalance = currentBalance

    switch (activeModal) {
      case "add":
        newBalance = currentBalance + numAmount
        break
      case "subtract":
        newBalance = Math.max(0, currentBalance - numAmount)
        break
      case "edit":
        newBalance = numAmount
        break
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: getTransactionType(selectedField),
      operation: activeModal as "add" | "subtract" | "edit",
      field: selectedField,
      amount: activeModal === "edit" ? newBalance : numAmount,
      reason,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: new Date(),
    }

    setFinances((prev) => ({
      ...prev,
      [selectedField]: newBalance,
    }))

    setTransactions((prev) => [newTransaction, ...prev])
    closeModal()
  }

  const handleCurrencyOperation = () => {
    if (!selectedCurrency || !amount || !reason) return

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    setCurrencies((prev) =>
      prev.map((currency) => {
        if (currency.id === selectedCurrency.id) {
          let newAmount = currency.amount
          switch (activeModal) {
            case "add":
              newAmount = currency.amount + numAmount
              break
            case "subtract":
              newAmount = Math.max(0, currency.amount - numAmount)
              break
            case "edit":
              newAmount = numAmount
              break
          }
          return { ...currency, amount: newAmount }
        }
        return currency
      }),
    )

    closeModal()
  }

  const handlePercentageChange = () => {
    const newPercent = Number.parseFloat(newPercentage)
    if (isNaN(newPercent) || newPercent < 1 || newPercent > 100) return

    setLaunderingPercentage(newPercent)
    closeModal()
  }

  const handleCurrencyRateChange = () => {
    if (!selectedCurrency || !newRate) return

    const rate = Number.parseFloat(newRate)
    if (isNaN(rate) || rate <= 0) return

    setCurrencies((prev) =>
      prev.map((currency) => (currency.id === selectedCurrency.id ? { ...currency, rate } : currency)),
    )

    closeModal()
  }

  const handleMoneyLaundering = () => {
    if (availableToLaunder <= 0) return

    const launderedAmount = Math.floor(availableToLaunder * (launderingPercentage / 100))

    const launderingTransaction: Transaction = {
      id: Date.now().toString(),
      type: "laundering",
      operation: "add",
      field: "dirty_money",
      amount: availableToLaunder,
      reason: `Отмыв денег (${launderingPercentage}% от ${formatCurrency(availableToLaunder)})`,
      balanceBefore: finances.dirty_money,
      balanceAfter: 0,
      timestamp: new Date(),
    }

    setFinances((prev) => ({
      ...prev,
      dirty_money: 0,
      cash: prev.cash + launderedAmount,
    }))

    setTransactions((prev) => [launderingTransaction, ...prev])
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  const getOperationText = (transaction: Transaction) => {
    const fieldName = getFieldDisplayName(transaction.field)

    if (transaction.type === "laundering") {
      return "Отмыв грязных денег"
    }

    switch (transaction.operation) {
      case "add":
        return `Пополнение: ${fieldName}`
      case "subtract":
        return `Списание: ${fieldName}`
      case "edit":
        return `Изменение: ${fieldName}`
      default:
        return `Операция: ${fieldName}`
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeFilter === "all") return true
    return transaction.type === activeFilter
  })

  const renderModal = () => {
    if (!activeModal) return null

    if (activeModal === "editPercent") {
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-orange-400 font-rajdhani">Изменить процент отмыва</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Новый процент (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newPercentage}
                  onChange={(e) => setNewPercentage(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="75"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button onClick={handlePercentageChange} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activeModal === "editCurrency") {
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-400 font-rajdhani">Изменить курс {selectedCurrency?.name}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Новый курс (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="0.000"
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                  Отмена
                </Button>
                <Button onClick={handleCurrencyRateChange} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const isCurrencyModal = selectedCurrency !== null
    const handleSubmit = isCurrencyModal ? handleCurrencyOperation : handleFinancialOperation
    const title = isCurrencyModal
      ? `${activeModal === "add" ? "Добавить" : activeModal === "subtract" ? "Убавить" : "Изменить"} - ${selectedCurrency?.name}`
      : `${activeModal === "add" ? "Добавить" : activeModal === "subtract" ? "Убавить" : "Изменить"} - ${selectedField && getFieldDisplayName(selectedField)}`

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white font-rajdhani">{title}</h3>
            <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">
                {activeModal === "edit" ? "Новое количество" : "Количество"}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Причина</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-[#252525] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Укажите причину операции..."
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={closeModal} className="flex-1 bg-gray-600 hover:bg-gray-700">
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!amount || !reason}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activeModal === "add" ? "Добавить" : activeModal === "subtract" ? "Убавить" : "Изменить"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const FinanceItem = ({
    label,
    amount,
    field,
    type,
  }: { label: string; amount: number; field: AccountField; type: "white" | "black" }) => (
    <div className="group relative flex justify-between items-center p-4 bg-[#252525] rounded-lg hover:bg-[#2A2A2A] transition-all duration-300">
      <span className="text-gray-300">{label}:</span>
      <span className={`font-mono text-xl font-bold ${type === "white" ? "text-green-400" : "text-red-400"}`}>
        {formatCurrency(amount)}
      </span>

      <div className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
        <button
          onClick={() => openModal("add", field)}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
          title="Добавить"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => openModal("subtract", field)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
          title="Убавить"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => openModal("edit", field)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          title="Изменить"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )

  const CurrencyItem = ({ currency }: { currency: Currency }) => {
    const totalValue = currency.amount * currency.rate

    return (
      <div className="group relative bg-[#252525] p-6 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{currency.icon}</span>
            <div>
              <h3 className="text-white font-semibold">{currency.name}</h3>
              <p className="text-gray-400 text-sm">{currency.symbol}</p>
            </div>
          </div>
          {!currency.isApiRate && (
            <button
              onClick={() => openModal("editCurrency", undefined, currency)}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Изменить курс"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Количество:</span>
            <span className="text-white font-mono">{currency.amount.toFixed(8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Курс:</span>
            <span className="text-white font-mono">{formatCurrency(currency.rate)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-600 pt-2">
            <span className="text-gray-400">Стоимость:</span>
            <span className="text-green-400 font-mono font-bold">{formatCurrency(totalValue)}</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
          <button
            onClick={() => openModal("add", undefined, currency)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
            title="Добавить"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => openModal("subtract", undefined, currency)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
            title="Убавить"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => openModal("edit", undefined, currency)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            title="Изменить"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    )
  }

  const totalWhiteMoney = finances.cash + finances.bank_account + finances.deposit
  const totalBlackMoney = finances.dirty_money + finances.org_account + finances.territory_account
  const totalCurrencyValue = currencies.reduce((sum, currency) => sum + currency.amount * currency.rate, 0)
  const grandTotal = totalWhiteMoney + totalBlackMoney + totalCurrencyValue
  const availableToLaunder = finances.dirty_money
  const willReceiveClean = Math.floor(availableToLaunder * (launderingPercentage / 100))

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
            <p className="text-red-500 font-mono font-bold">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">💵 ФИНАНСЫ</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-red-500 mx-auto"></div>
          </div>

          {/* Finance Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* White Money */}
            <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-green-500/30 hover:border-green-500/50 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-green-400 mb-6 font-rajdhani flex items-center">
                <span className="mr-3">💰</span>
                Белая бухгалтерия
              </h2>
              <div className="space-y-4">
                <FinanceItem label="Наличные" amount={finances.cash} field="cash" type="white" />
                <FinanceItem label="Банковский счёт" amount={finances.bank_account} field="bank_account" type="white" />
                <FinanceItem label="Депозит" amount={finances.deposit} field="deposit" type="white" />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Общий баланс:</span>
                  <span className="text-green-400 font-mono text-xl font-bold">{formatCurrency(totalWhiteMoney)}</span>
                </div>
              </div>
            </div>

            {/* Black Money */}
            <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-red-500/30 hover:border-red-500/50 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-red-400 mb-6 font-rajdhani flex items-center">
                <span className="mr-3">🩸</span>
                Тёмная бухгалтерия
              </h2>
              <div className="space-y-4">
                <FinanceItem label="Грязные деньги" amount={finances.dirty_money} field="dirty_money" type="black" />
                <FinanceItem label="Счёт ОРГ" amount={finances.org_account} field="org_account" type="black" />
                <FinanceItem
                  label="Счёт Тер"
                  amount={finances.territory_account}
                  field="territory_account"
                  type="black"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-semibold">Общий баланс:</span>
                  <span className="text-red-400 font-mono text-xl font-bold">{formatCurrency(totalBlackMoney)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Currencies Section */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors duration-300 mb-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 font-rajdhani flex items-center">
              <span className="mr-3">💎</span>
              Валюты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currencies.map((currency) => (
                <CurrencyItem key={currency.id} currency={currency} />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-semibold">Общая стоимость валют:</span>
                <span className="text-blue-400 font-mono text-xl font-bold">{formatCurrency(totalCurrencyValue)}</span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-[#1A1A1A] p-6 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-colors duration-300 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-yellow-400 font-rajdhani">💰 ОБЩИЙ БАЛАНС:</span>
              <span className="text-yellow-400 font-mono text-3xl font-bold">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Money Laundering Section */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border-2 border-orange-500/30 hover:border-orange-500/50 transition-colors duration-300 mb-8">
            <h2 className="text-2xl font-bold text-orange-400 mb-6 font-rajdhani flex items-center">
              <ArrowRightLeft className="mr-3 w-6 h-6" />
              Отмыв денег
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative bg-[#252525] p-6 rounded-lg text-center hover:bg-[#2A2A2A] transition-colors duration-300">
                <p className="text-gray-300 mb-2">Процент перевода</p>
                <p className="text-orange-400 font-mono text-2xl font-bold">{launderingPercentage}%</p>
                <p className="text-gray-500 text-sm mt-2">За каждый $1 грязных денег</p>

                <button
                  onClick={() => openModal("editPercent")}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
                  title="Изменить процент"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="bg-[#252525] p-6 rounded-lg text-center">
                <p className="text-gray-300 mb-2">Доступно к отмыву</p>
                <p className="text-red-400 font-mono text-2xl font-bold">{formatCurrency(availableToLaunder)}</p>
                <p className="text-gray-500 text-sm mt-2">Грязные деньги</p>
              </div>
              <div className="bg-[#252525] p-6 rounded-lg text-center">
                <p className="text-gray-300 mb-2">Получите чистых</p>
                <p className="text-green-400 font-mono text-2xl font-bold">{formatCurrency(willReceiveClean)}</p>
                <p className="text-gray-500 text-sm mt-2">После отмыва</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button
                onClick={handleMoneyLaundering}
                disabled={availableToLaunder <= 0}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-rajdhani tracking-wider transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмыть деньги
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-[#1A1A1A] p-8 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 font-rajdhani flex items-center">
              <span className="mr-3">📊</span>
              История транзакций
            </h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeFilter === "all"
                    ? "bg-gray-600 border border-gray-500 text-white"
                    : "bg-gray-600/20 border border-gray-500/50 text-gray-400 hover:bg-gray-600/30"
                }`}
              >
                Все операции
              </Button>
              <Button
                onClick={() => setActiveFilter("white")}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeFilter === "white"
                    ? "bg-green-600 border border-green-500 text-white"
                    : "bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30"
                }`}
              >
                Белая бухгалтерия
              </Button>
              <Button
                onClick={() => setActiveFilter("black")}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeFilter === "black"
                    ? "bg-red-600 border border-red-500 text-white"
                    : "bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30"
                }`}
              >
                Тёмная бухгалтерия
              </Button>
              <Button
                onClick={() => setActiveFilter("laundering")}
                className={`px-4 py-2 transition-all duration-300 ${
                  activeFilter === "laundering"
                    ? "bg-orange-600 border border-orange-500 text-white"
                    : "bg-orange-600/20 border border-orange-500/50 text-orange-400 hover:bg-orange-600/30"
                }`}
              >
                Отмыв денег
              </Button>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 bg-[#252525] rounded-lg border-l-4 ${
                      transaction.type === "white"
                        ? "border-green-500"
                        : transaction.type === "black"
                          ? "border-red-500"
                          : "border-orange-500"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          transaction.type === "white"
                            ? "text-green-400"
                            : transaction.type === "black"
                              ? "text-red-400"
                              : "text-orange-400"
                        }`}
                      >
                        {getOperationText(transaction)}
                      </p>
                      <p className="text-gray-500 text-sm">{formatDateTime(transaction.timestamp)}</p>
                      <p className="text-gray-400 text-sm mt-1">{transaction.reason}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          transaction.operation === "add"
                            ? transaction.type === "white"
                              ? "text-green-400"
                              : "text-red-400"
                            : transaction.operation === "subtract"
                              ? "text-red-400"
                              : transaction.type === "white"
                                ? "text-green-400"
                                : "text-red-400"
                        }`}
                      >
                        {transaction.operation === "add"
                          ? `+${formatCurrency(transaction.amount)}`
                          : transaction.operation === "subtract"
                            ? `-${formatCurrency(transaction.amount)}`
                            : formatCurrency(transaction.amount)}
                      </span>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatCurrency(transaction.balanceBefore)} → {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">
                    {activeFilter === "all" ? "Транзакции отсутствуют" : `Нет транзакций типа "${activeFilter}"`}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">Выполните финансовые операции, чтобы увидеть историю</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  )
}
