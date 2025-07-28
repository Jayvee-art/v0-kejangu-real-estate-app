import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="ml-3 text-lg text-gray-700">Loading...</p>
    </div>
  )
}
