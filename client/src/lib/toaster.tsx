import { Toaster as Sonner } from "sonner"
export { toast as default } from "sonner"

export function Toaster({ appearance, richColors = false }: { appearance: "light" | "dark" | "system"; richColors: boolean }) {
  return (
    <Sonner
      theme={appearance}
      richColors={richColors}
      swipeDirections={["top"]}
      position="bottom-center"
      toastOptions={{
        duration: 5000
      }}
    />
  )
}
