import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx"
import { Button } from "@/components/ui/button.tsx"

import { Sun, Moon } from "lucide-react"

import { useState } from "react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
          <Button variant="outline" size="icon" className="self-center">
            O
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
