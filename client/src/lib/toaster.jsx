import { Toaster as Sonner, toast } from "sonner"

function Toaster({ appearance, richColors = false }) {
  return (
    <Sonner
      theme={appearance}
      richColors={richColors}
      swipeDirections={["top", "bottom"]}
      position="bottom-center"
      toastOptions={{
        duration: 5000
      }}
    />
  )
}

export { Toaster, toast }
