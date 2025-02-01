"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Moon, Sun, Calculator, Send, ChevronRight, X, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatMessage {
  type: "input" | "output"
  content: string | ResultadoOperacion
}

interface ResultadoOperacion {
  operacion: string
  resultado: string
  explicacion: string
  polinomios: string[]
}

export default function Home() {
  const [currentInput, setCurrentInput] = useState("")
  const [polinomios, setPolinomios] = useState<string[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [modoOscuro, setModoOscuro] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedChat = sessionStorage.getItem("chatHistory")
    if (storedChat) {
      setChatHistory(JSON.parse(storedChat))
    }

    if (modoOscuro) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [modoOscuro])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatEndRef]) // Corrected dependency

  const calcular = async (tipoOperacion: string) => {
    if (polinomios.length < 2) {
      alert("Se necesitan al menos 2 polinomios para realizar operaciones")
      return
    }

    try {
      setIsTyping(true)

      // Agregar mensaje de entrada al chat
      const inputMessage: ChatMessage = {
        type: "input",
        content: `${tipoOperacion.toUpperCase()}: ${polinomios.join(", ")}`,
      }
      setChatHistory((prev) => [...prev, inputMessage])

      const response = await fetch(`https://polinomios-api.vercel.app/api/polinomios/${tipoOperacion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polinomios }),
      })

      const data: { resultado: string; explicacion: string } = await response.json()

      if (data.resultado && data.explicacion) {
        const explicacionFormateada = data.explicacion
          .split("➡")
          .map((paso) => paso.trim())
          .join("\n")

        const newResultado: ResultadoOperacion = {
          operacion: tipoOperacion,
          resultado: data.resultado,
          explicacion: explicacionFormateada,
          polinomios: [...polinomios],
        }

        // Agregar mensaje de salida al chat
        const outputMessage: ChatMessage = {
          type: "output",
          content: newResultado,
        }
        setChatHistory((prev) => [...prev, outputMessage])

        // Actualizar sessionStorage
        sessionStorage.setItem("chatHistory", JSON.stringify([...chatHistory, inputMessage, outputMessage]))
      }
    } catch (error) {
      console.error("Error al calcular la operación:", error)
    } finally {
      setIsTyping(false)
      setPolinomios([]) // Limpiar polinomios después de la operación
    }
  }

  const agregarPolinomio = () => {
    if (currentInput.trim()) {
      setPolinomios((prev) => [...prev, currentInput.trim()])
      setCurrentInput("") // Limpiar el input después de agregar
    }
  }

  const removePolinomio = (index: number) => {
    setPolinomios((prev) => prev.filter((_, i) => i !== index))
  }

  const clearHistory = () => {
    setChatHistory([])
    sessionStorage.removeItem("chatHistory")
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${modoOscuro ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <header className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Calculadora de Polinomios</h1>
        </div>
        <Button variant="outline" size="icon" onClick={() => setModoOscuro(!modoOscuro)}>
          {modoOscuro ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        <Card className="lg:w-1/3 w-full">
          <CardHeader>
            <CardTitle>Entrada de Polinomios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de polinomios ingresados */}
            <div className="space-y-2 mb-4">
              <AnimatePresence>
                {polinomios.map((pol, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-primary/10 p-2 rounded-md flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium mr-2">P{index + 1}:</span>
                      {pol}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removePolinomio(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input actual y teclado */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="text-lg flex-1"
                  placeholder="Ej: (2x^2) + 3x - 5"
                  disabled 
                />
                <Button onClick={agregarPolinomio} variant="outline" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                {[
                  "(",
                  ")",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "0",
                  "x",
                  "^",
                  "+",
                  "-",
                  "/",
                  "*",
                  "DEL",
                  "CLR",
                  ..."abcdefghijklmnopqrstuvwyz".split(""),
                ].map((char) => (
                  <Button
                    key={char}
                    variant={char === "DEL" || char === "CLR" ? "destructive" : "outline"}
                    size="sm"
                    className="text-sm h-8"
                    onClick={() => {
                      if (char === "DEL") {
                        setCurrentInput((prev) => prev.slice(0, -1))
                      } else if (char === "CLR") {
                        setCurrentInput("")
                      } else {
                        setCurrentInput((prev) => prev + char)
                      }
                    }}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:flex-1 w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat de Resultados</CardTitle>
            {chatHistory.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <AnimatePresence>
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`mb-4 ${message.type === "input" ? "text-right" : "text-left"}`}
                  >
                    <Card className={message.type === "input" ? "bg-primary/10" : "bg-secondary/10"}>
                      <CardContent className="p-3">
                        {message.type === "input" ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="bg-primary/20 px-2 py-1 rounded text-sm">
                              {(message.content as string).split(":")[0]}
                            </span>
                            <p>{(message.content as string).split(":")[1]}</p>
                          </div>
                        ) : (
                          <ResultadoCard resultado={message.content as ResultadoOperacion} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </ScrollArea>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
              {["suma", "resta", "multiplicacion", "division"].map((op) => (
                <Button
                  key={op}
                  onClick={() => calcular(op)}
                  disabled={isTyping || polinomios.length < 2}
                  variant="outline"
                  className="w-full"
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ResultadoCard({ resultado }: { resultado: ResultadoOperacion }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="bg-primary/20 px-3 py-1.5 rounded-full text-sm font-medium">
          {resultado.operacion.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-sm bg-background/40 rounded-lg p-3">
        {resultado.polinomios?.map((pol, idx) => (
          <div key={idx} className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">P{idx + 1}:</span>
            <code className="bg-primary/5 px-2 py-0.5 rounded">{pol}</code>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="font-bold text-lg flex items-center gap-2">
          <ChevronRight className="h-5 w-5 text-primary" />
          <code>{resultado.resultado}</code>
        </p>
      </div>

      <div className="space-y-2">
        {(resultado.explicacion ?? "")
          .split("\n")
          .filter((paso) => paso.trim() !== "")
          .map((paso, idx) => {
            const isMainStep = paso.includes("◆")
            const isSubStep = paso.includes("▶")

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`
                  relative pl-10 pr-4 py-3 rounded-lg
                  ${isMainStep ? "bg-primary/10 shadow-sm" : "bg-background/50"}
                  ${isSubStep ? "ml-6 border-l-2 border-primary/20" : ""}
                `}
              >
                <div
                  className={`
                  absolute left-3 top-1/2 -translate-y-1/2
                  w-5 h-5 flex items-center justify-center
                  ${isMainStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                  rounded-full text-xs font-medium
                `}
                >
                  {isMainStep ? "◆" : isSubStep ? "▶" : "•"}
                </div>
                <p className="text-sm leading-relaxed">{paso.replace(/◆|▶/g, "").trim()}</p>
              </motion.div>
            )
          })}
      </div>
    </div>
  )
}

