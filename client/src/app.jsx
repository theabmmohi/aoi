import { Outlet, useNavigation, useNavigate, useLocation } from "react-router"
import { Avatar, AvatarImage, AvatarFallback } from "@ui/avatar"
import { useState, useEffect, useCallback } from "react"
import { Sun, Moon, Contrast } from "lucide-react"
import { Toaster, toast } from "@lib/toaster"
import { Button } from "@ui/button"
import { Yozora } from "yozora"
import { tabs } from "@/tabs"
import "@/app.css"

const isAppearance = (value) => ["light", "dark", "system"].includes(value)
const next = {
  light: "dark",
  dark: "system",
  system: "light"
}
const icon = {
  light: <Sun />,
  dark: <Moon />,
  system: <Contrast />
}

export function App() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const location = useLocation()

  const [appearance, setAppearanceState] = useState("system")
  const [sysDark, setSysDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("appearance")
    setAppearanceState(isAppearance(stored) ? stored : "system")
    setSysDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handle = (e) => setSysDark(e.matches)
    mql.addEventListener("change", handle)
    return () => mql.removeEventListener("change", handle)
  }, [])

  const isDark = appearance === "dark" || (appearance === "system" && sysDark)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", isDark ? "#09090b" : "#ffffff")
  }, [isDark])

  const setAppearance = useCallback(
    (value) => {
      if (appearance === value) return
      localStorage.setItem("appearance", value)
      setAppearanceState(value)
      toast.success(`Appearance switched to ${value}.`)
    },
    [appearance]
  )

  return (
    <div className="max-w-md m-auto">
      <header className="border-b p-2 sticky top-0 z-999 bg-background flex justify-between select-none">
        <div className="flex gap-2.5">
          <Avatar size="lg">
            <AvatarImage src="/aoi.png" alt="Aoi" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <h1 className="font-mono text-xl tracking-tight self-center">Aoi</h1>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="icon" className="self-center overflow-hidden" onClick={() => setAppearance(next[appearance])}>
            <span className="relative size-4">
              {Object.keys(icon).map((key) => (
                <span
                  key={key}
                  className={`absolute inset-0 ${key === appearance ? "translate-y-0 transition-transform duration-300 ease-out" : key === next[appearance] ? "-translate-y-[200%]" : "translate-y-[200%] transition-transform duration-300 ease-out"}`}
                >
                  {icon[key]}
                </span>
              ))}
            </span>
          </Button>
        </div>
      </header>
      <main className="overflow-x-auto">{navigation.state === "loading" ? <p>Loading...</p> : <Outlet />}</main>
      <Yozora theme={appearance} tabs={tabs} value={location.pathname} onValueChange={navigate} />
      <Toaster appearance={appearance} richColors={false} />
      {/* <Toaster appearance={appearance} richColors={isDark} /> */}
    </div>
  )
}
