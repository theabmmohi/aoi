import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Outlet, useNavigate, useLocation } from "react-router"
import { useState, useEffect, useCallback } from "react"
import { Sun, Moon, Contrast } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOwner } from "@/stores/owner"
import { tabs } from "@/router/tabs"
import { Toaster } from "sonner"
import { Yozora } from "yozora"

type Appearance = "dark" | "light" | "system"

const appearances: Appearance[] = ["dark", "light", "system"]
const isAppearance = (value: string | null): value is Appearance => appearances.includes(value as Appearance)
const next: Record<Appearance, Appearance> = {
  light: "dark",
  dark: "system",
  system: "light"
}
const icon: Record<Appearance, React.ReactNode> = {
  light: <Sun />,
  dark: <Moon />,
  system: <Contrast />
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const owner = useOwner((s) => s.owner)

  if (!owner) throw new Error("User is not available in store.")

  const [sysDark, setSysDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches)
  const [appearance, setAppearanceState] = useState<Appearance>(() => {
    const stored = localStorage.getItem("appearance")
    return isAppearance(stored) ? stored : "system"
  })

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handle = (e: MediaQueryListEvent) => setSysDark(e.matches)
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
    (value: Appearance) => {
      if (appearance === value) return
      localStorage.setItem("appearance", value)
      setAppearanceState(value)
    },
    [appearance]
  )

  return (
    <>
      <header className="border-b p-2 sticky top-0 z-999 bg-background flex justify-between select-none">
        <div className="flex gap-2.5">
          <AvatarGroup>
            <Avatar size="lg">
              <AvatarImage src="/aoi.png" alt="Aoi" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src={owner.photo_url} alt="Owner" />
              <AvatarFallback>{[owner.first_name, owner.last_name].map((name) => name?.charAt(0).toUpperCase()).join("")}</AvatarFallback>
            </Avatar>
          </AvatarGroup>
          <h1 className="font-mono text-xl tracking-tight self-center">{[owner.first_name, owner.last_name].filter(Boolean).join(" ") || "Owner"}</h1>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="icon" className="self-center overflow-hidden" onClick={() => setAppearance(next[appearance])}>
            <span className="relative size-4">
              {appearances.map((key) => (
                <span key={key} className={`absolute inset-0 ${key === appearance ? "translate-y-0 transition-transform duration-300 ease-out" : key === next[appearance] ? "-translate-y-[200%]" : "translate-y-[200%] transition-transform duration-300 ease-out"}`}>
                  {icon[key]}
                </span>
              ))}
            </span>
          </Button>
        </div>
      </header>
      <main className="overflow-x-hidden p-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <Yozora theme={appearance} tabs={tabs} defaultValue={"/" + location.pathname.split("/")[1]} onValueChange={(path) => navigate(path)} />
      <Toaster theme={appearance} position="top-center" />
    </>
  )
}
