"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useState } from "react"

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface MapSectionProps {
  latitude: number
  longitude: number
  popupText?: string
  zoom?: number
}

export function MapSection({ latitude, longitude, popupText, zoom = 13 }: MapSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="map-container flex items-center justify-center bg-gray-200 rounded-lg">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="map-container">
      <MapContainer center={[latitude, longitude]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>{popupText && <Popup>{popupText}</Popup>}</Marker>
      </MapContainer>
    </div>
  )
}
