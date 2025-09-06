// Leaflet icon fix - only run on client side
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    // Delete default icon options to prevent errors
    delete (L.Icon.Default.prototype as any)._getIconUrl

    // Set default icon options
    L.Icon.Default.mergeOptions({
      iconUrl: '/leaflet-svg/marker.svg',
      shadowUrl: '/leaflet/marker-shadow.png',
    })
  })
}