// Fix for Leaflet default icon in Next.js
import L from 'leaflet'

// Delete default icon options to prevent errors
delete (L.Icon.Default.prototype as any)._getIconUrl

// Set default icon options
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})
