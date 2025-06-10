"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AccountSelection from "./account-selection"
import AccountPage from "./account-page"
import FinancesPage from "./finances-page"
import ItemsPage from "./items-page"
import PropertyPage from "./property-page"
import NotesPage from "./notes-page"
import BindersPage from "./binders-page"
import ConverterPage from "./converter-page"

type Page =
  | "menu"
  | "sedona"
  | "account-selection"
  | "account-page"
  | "finances"
  | "items"
  | "property"
  | "notes"
  | "binders"
  | "converter"
  | "life"

export default function GTALanding() {
  const [currentPage, setCurrentPage] = useState<Page>("menu")
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")

  const navigateToPage = (page: Page) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage(page)
      setIsTransitioning(false)
      if (page !== "menu" && page !== "account-selection" && page !== "account-page") {
        setTypewriterText("")
      }
    }, 500)
  }

  const goBackToMenu = () => {
    navigateToPage("menu")
  }

  const goBackToAccountSelection = () => {
    navigateToPage("account-selection")
  }

  const handleSedonaClick = () => {
    navigateToPage("account-selection")
  }

  const handleAccountSelect = (account: string) => {
    setSelectedAccount(account)
    navigateToPage("account-page")
  }

  const handleSectionNavigate = (section: string) => {
    navigateToPage(section as Page)
  }

  const goBackToAccountPage = () => {
    navigateToPage("account-page")
  }

  // Typewriter effect
  useEffect(() => {
    if (currentPage === "sedona" || currentPage === "life") {
      const text = "В РАЗРАБОТКЕ..."
      let index = 0
      const timer = setInterval(() => {
        if (index < text.length) {
          setTypewriterText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(timer)
        }
      }, 100)
      return () => clearInterval(timer)
    }
  }, [currentPage])

  const getAccountName = (accountId: string) => {
    switch (accountId) {
      case "seiji":
        return "Seiji Ogata"
      case "diego":
        return "Diego Salcatore"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="relative min-h-screen bg-[#121212] overflow-hidden">
      {/* Transition Overlay */}
      <div
        className={`absolute inset-0 bg-black z-50 transition-opacity duration-500 pointer-events-none ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Account Page */}
      {currentPage === "account-page" && (
        <AccountPage
          accountName={getAccountName(selectedAccount)}
          onBack={goBackToAccountSelection}
          onNavigate={handleSectionNavigate}
        />
      )}

      {/* Account Selection Page */}
      {currentPage === "account-selection" && (
        <AccountSelection onBack={goBackToMenu} onAccountSelect={handleAccountSelect} />
      )}

      {/* Main Menu Page */}
      {currentPage === "menu" && (
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-600/10 to-transparent"></div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.02) 20px,
                  rgba(255,255,255,0.02) 40px
                )`,
              }}
            ></div>
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
              {/* Title */}
              <div className="text-center mb-16">
                <p className="text-sm text-gray-600 mb-2 font-mono">#salcatore</p>
                <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider font-rajdhani">
                  MAIN MENU
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-[#8B0000] to-[#4682B4] mx-auto"></div>
              </div>

              {/* Menu Buttons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* SEDONA Button */}
                <button
                  onClick={handleSedonaClick}
                  className="group relative bg-[#252525] border-2 border-[#8B0000]/30 rounded-lg p-12 lg:p-16 
                           hover:border-[#8B0000] hover:shadow-[0_0_30px_rgba(139,0,0,0.3)] 
                           hover:scale-105 transition-all duration-300 ease-out
                           min-h-[300px] lg:min-h-[400px] flex flex-col items-center justify-center"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-[#8B0000]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 text-center">
                    <div className="text-6xl lg:text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      🎮
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-bold text-[#8B0000] mb-4 font-rajdhani tracking-wider">
                      SEDONA
                    </h2>
                    <p className="text-gray-400 text-lg lg:text-xl font-inter">Arizona RP Server</p>
                    <div className="mt-6 w-16 h-1 bg-[#8B0000] mx-auto group-hover:w-24 transition-all duration-300"></div>
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#8B0000]/50"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#8B0000]/50"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[#8B0000]/50"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[#8B0000]/50"></div>
                </button>

                {/* LIFE Button */}
                <button
                  onClick={() => navigateToPage("life")}
                  className="group relative bg-[#252525] border-2 border-[#4682B4]/30 rounded-lg p-12 lg:p-16 
                           hover:border-[#4682B4] hover:shadow-[0_0_30px_rgba(70,130,180,0.3)] 
                           hover:scale-105 transition-all duration-300 ease-out
                           min-h-[300px] lg:min-h-[400px] flex flex-col items-center justify-center"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-[#4682B4]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 text-center">
                    <div className="text-6xl lg:text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      📓
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-bold text-[#4682B4] mb-4 font-rajdhani tracking-wider">
                      LIFE
                    </h2>
                    <p className="text-gray-400 text-lg lg:text-xl font-inter">Personal Notes</p>
                    <div className="mt-6 w-16 h-1 bg-[#4682B4] mx-auto group-hover:w-24 transition-all duration-300"></div>
                  </div>

                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#4682B4]/50"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#4682B4]/50"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[#4682B4]/50"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[#4682B4]/50"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder Pages */}
      {(currentPage === "sedona" || currentPage === "life") && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 bg-[#121212]">
          <div className="text-center">
            {/* Typewriter Text */}
            <div className="mb-12">
              <h1
                className={`text-4xl lg:text-6xl font-bold mb-8 font-mono ${
                  currentPage === "sedona" ? "text-[#8B0000]" : "text-[#4682B4]"
                }`}
              >
                {typewriterText}
                <span className="animate-pulse">|</span>
              </h1>

              <div className="text-gray-400 text-lg lg:text-xl font-inter mb-8">
                <p>Этот раздел находится в стадии разработки.</p>
                <p className="text-sm mt-2 font-mono opacity-60">{"// TODO: Implement content"}</p>
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={goBackToMenu}
              className={`px-8 py-4 text-lg font-rajdhani tracking-wider
                       bg-transparent border-2 hover:scale-105 transition-all duration-300
                       ${
                         currentPage === "sedona"
                           ? "border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white hover:shadow-[0_0_20px_rgba(139,0,0,0.3)]"
                           : "border-[#4682B4] text-[#4682B4] hover:bg-[#4682B4] hover:text-white hover:shadow-[0_0_20px_rgba(70,130,180,0.3)]"
                       }`}
            >
              ← НАЗАД В МЕНЮ
            </Button>

            {/* Loading Animation */}
            <div className="mt-12 flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    currentPage === "sedona" ? "bg-[#8B0000]" : "bg-[#4682B4]"
                  }`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Pages */}
      {currentPage === "finances" && (
        <FinancesPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
      {currentPage === "items" && (
        <ItemsPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
      {currentPage === "property" && (
        <PropertyPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
      {currentPage === "notes" && (
        <NotesPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
      {currentPage === "binders" && (
        <BindersPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
      {currentPage === "converter" && (
        <ConverterPage accountName={getAccountName(selectedAccount)} onBack={goBackToAccountPage} />
      )}
    </div>
  )
}
