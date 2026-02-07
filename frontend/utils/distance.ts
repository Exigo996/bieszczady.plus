export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function formatDistance(km: number, locale = 'pl'): string {
  if (km < 1) {
    const meters = Math.round(km * 1000)
    return locale === 'pl' ? `${meters} m` : `${meters} m`
  }
  return locale === 'pl' ? `${km.toFixed(1)} km` : `${km.toFixed(1)} km`
}
