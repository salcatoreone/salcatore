"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AccountSelectionProps {
  onBack: () => void
  onAccountSelect: (account: string) => void
}

export default function AccountSelection({ onBack, onAccountSelect }: AccountSelectionProps) {
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleAccountSelect = (account: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      onAccountSelect(account)
    }, 500)
  }

  const accounts = [
    {
      id: "seiji",
      name: "Seiji Ogata",
      flag: "🇷🇺",
      icon: "🐺",
      flagColors: "from-white via-blue-500 to-red-500",
      borderColor: "border-blue-500/50",
      hoverBorder: "hover:border-blue-500",
      glowColor: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      description: "Волк из Сибири",
    },
    {
      id: "diego",
      name: "Diego Salcatore",
      flag: "🇲🇽",
      icon: "🎩",
      flagColors: "from-green-500 via-white to-red-500",
      borderColor: "border-green-500/50",
      hoverBorder: "hover:border-green-500",
      glowColor: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]",
      description: "El Jefe del Sur",
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.01) 50%, transparent 60%)
            `,
            backgroundSize: "50px 50px, 50px 50px, 100px 100px",
          }}
        ></div>
      </div>

      {/* Transition Overlay */}
      <div
        className={`absolute inset-0 bg-black z-50 transition-opacity duration-500 pointer-events-none ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Background Dimming */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          hoveredAccount ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-600 mb-2 font-mono">#salcatore</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider font-rajdhani">
            ВЫБОР АККАУНТА
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#8B0000] to-[#4682B4] mx-auto"></div>
          <p className="text-gray-400 mt-4 font-inter">Arizona RP • Sedona Server</p>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-5xl">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`relative group transition-all duration-300 ${
                hoveredAccount && hoveredAccount !== account.id ? "opacity-30 scale-95" : "opacity-100 scale-100"
              } ${hoveredAccount === account.id ? "scale-103 z-20" : ""}`}
              onMouseEnter={() => setHoveredAccount(account.id)}
              onMouseLeave={() => setHoveredAccount(null)}
            >
              <div
                className={`relative bg-[#1A1A1A] border-2 ${account.borderColor} ${account.hoverBorder} 
                           ${account.glowColor} rounded-lg p-8 lg:p-12 min-h-[400px] lg:min-h-[500px] 
                           flex flex-col items-center justify-between transition-all duration-300 overflow-hidden`}
              >
                {/* Flag Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${account.flagColors} opacity-5 
                             group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {/* Flag Pattern Overlay */}
                <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  {account.flag}
                </div>

                {/* Content */}
                <div className="relative z-10 text-center flex-1 flex flex-col justify-center">
                  {/* Character Icon */}
                  <div className="text-6xl lg:text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {account.icon}
                  </div>

                  {/* Name */}
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 font-rajdhani tracking-wider">
                    {account.name}
                  </h2>
                </div>

                {/* Select Button */}
                <Button
                  onClick={() => handleAccountSelect(account.id)}
                  className={`w-full py-4 text-lg font-rajdhani tracking-wider font-semibold
                           bg-gradient-to-r ${account.flagColors} text-white border-0
                           hover:scale-105 hover:shadow-lg transition-all duration-300
                           relative overflow-hidden group/btn`}
                >
                  <span className="relative z-10">ВЫБРАТЬ ПЕРСОНАЖА</span>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </Button>

                {/* Corner Decorations */}
                <div
                  className={`absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 ${account.borderColor} opacity-50`}
                ></div>
                <div
                  className={`absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 ${account.borderColor} opacity-50`}
                ></div>
                <div
                  className={`absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 ${account.borderColor} opacity-50`}
                ></div>
                <div
                  className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 ${account.borderColor} opacity-50`}
                ></div>

                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${account.flagColors} opacity-0 
                             group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Button
            onClick={onBack}
            className="px-8 py-3 text-lg font-rajdhani tracking-wider
                     bg-transparent border-2 border-gray-600 text-gray-400
                     hover:border-white hover:text-white hover:scale-105 
                     transition-all duration-300"
          >
            ← НАЗАД В МЕНЮ
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm font-mono">{"// SELECT_CHARACTER_TO_CONTINUE"}</p>
        </div>
      </div>
    </div>
  )
}
