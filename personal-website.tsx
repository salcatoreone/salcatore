"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Section = "SEDONA" | "LIFE"

export default function PersonalWebsite() {
  const [activeSection, setActiveSection] = useState<Section>("SEDONA")

  const sedonaContent = [
    {
      title: "Arizona RP Server",
      description: "Мой опыт игры на сервере Arizona RP в городе Sedona",
      content: "Здесь будут записи о моих приключениях в мире ролевых игр...",
    },
    {
      title: "Достижения",
      description: "Основные достижения и моменты в игре",
      content: "Список важных событий и достижений на сервере...",
    },
    {
      title: "Гайды",
      description: "Полезные советы для новичков Arizona RP",
      content: "Собрание полезной информации для игроков...",
    },
  ]

  const lifeContent = [
    {
      title: "Мысли",
      description: "Личные размышления и заметки",
      content: "Здесь я делюсь своими мыслями о жизни, работе и увлечениях...",
    },
    {
      title: "Проекты",
      description: "Мои текущие и завершённые проекты",
      content: "Описание проектов, над которыми я работаю или работал...",
    },
    {
      title: "Обучение",
      description: "Заметки о новых знаниях и навыках",
      content: "Записи о том, что изучаю и какие навыки развиваю...",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-[#1E1E1E]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-8">
            <button
              onClick={() => setActiveSection("SEDONA")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 font-mono text-sm font-medium ${
                activeSection === "SEDONA"
                  ? "bg-[#8B0000] text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-[#3A3A3A]"
              }`}
            >
              <span className="text-lg">🎮</span>
              <span>SEDONA</span>
            </button>
            <button
              onClick={() => setActiveSection("LIFE")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 font-sans text-sm font-medium ${
                activeSection === "LIFE"
                  ? "bg-[#CC7722] text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-[#3A3A3A]"
              }`}
            >
              <span className="text-lg">📝</span>
              <span>LIFE</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Section Title */}
          <div className="text-center">
            <h1
              className={`text-4xl font-bold mb-4 ${
                activeSection === "SEDONA" ? "font-mono text-[#8B0000]" : "font-sans text-[#CC7722]"
              }`}
            >
              {activeSection}
            </h1>
            <p className="text-gray-400 text-lg">
              {activeSection === "SEDONA" ? "Arizona RP Server Experience" : "Personal Notes & Thoughts"}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeSection === "SEDONA" ? sedonaContent : lifeContent).map((item, index) => (
              <Card
                key={`${activeSection}-${index}`}
                className="bg-[#3A3A3A] border-0 relative overflow-hidden group animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    activeSection === "SEDONA"
                      ? "from-[#3A3A3A] via-[#8B0000]/20 to-[#3A3A3A]"
                      : "from-[#3A3A3A] via-[#CC7722]/20 to-[#3A3A3A]"
                  } p-[1px] rounded-lg`}
                >
                  <div className="bg-[#3A3A3A] rounded-lg h-full w-full">
                    <CardContent className="p-6 h-full">
                      <div className="space-y-4">
                        <h3
                          className={`text-xl font-semibold ${
                            activeSection === "SEDONA" ? "font-mono text-[#8B0000]" : "font-sans text-[#CC7722]"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                        <div className="pt-4 border-t border-gray-600">
                          <p
                            className={`text-gray-400 text-sm ${
                              activeSection === "SEDONA" ? "font-mono" : "font-sans"
                            }`}
                          >
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>

                {/* Hover Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    activeSection === "SEDONA"
                      ? "from-transparent via-[#8B0000]/5 to-transparent"
                      : "from-transparent via-[#CC7722]/5 to-transparent"
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />
              </Card>
            ))}
          </div>

          {/* Footer Section */}
          <div className="text-center pt-12 border-t border-gray-700">
            <p className="text-gray-500 text-sm font-mono">
              {activeSection === "SEDONA"
                ? "// Arizona RP - Sedona Server Experience"
                : "// Personal Life Documentation"}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
