import type { ReactNode } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button.tsx"
import { Sun, Moon, Contrast } from "lucide-react"
import toast, {Toaster} from "@/components/ui/toaster"


type appearances = "light" | "dark" | "system"
const isAppearance = (value: string | null): value is appearances => ["light", "dark", "system"].includes(value as appearances)
const next: Record<appearances, appearances> = {
  light: "dark",
  dark: "system",
  system: "light"
}
const icon: Record<appearances, ReactNode> = {
  light: <Sun/>,
  dark: <Moon/>,
  system: <Contrast/>
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<appearances>("system")
  const [sysDark, setSysDark] = useState<boolean>(false)
  useEffect(() => {
    const stored = localStorage.getItem("appearance")
    setAppearanceState(isAppearance(stored) ? stored : "system")
    setSysDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
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
  
  const setAppearance = useCallback((value: appearances) => {
    if (appearance === value) return
    localStorage.setItem("appearance", value)
    setAppearanceState(value)
    toast.success(`Appearance switched to ${value}.`)
  }, [appearance])
  
  return (
    <div className="max-w-md m-auto">
      <header className="border-b p-2 sticky top-0 z-999 bg-background flex justify-between">
        <div className="flex gap-2.5">
          <Avatar size="lg">
            <AvatarImage src="aoi.png" alt="Aoi" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <h1 className="font-mono text-xl tracking-tight self-center">Aoi</h1>
        </div>
        <div className="flex">
          <Button variant="outline" size="icon" className="self-center" onClick={() => setAppearance(next[appearance])}>
            {icon[appearance]}
          </Button>
        </div>
      </header>
      <main>{children}</main>
      <Toaster appearance={appearance} richColors={isDark}/>
    </div>
  )
}
