import type { TransportMode } from '~/stores/filters'

const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  car: 50, // km/h average in mountains
  bike: 15, // km/h
  walk: 4, // km/h
}

export function useTransport() {
  function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  function calculateTimeMinutes(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    transport: TransportMode,
  ): number {
    const distance = calculateDistance(lat1, lng1, lat2, lng2)
    const speed = TRANSPORT_SPEEDS[transport]
    return Math.ceil((distance / speed) * 60) // Convert to minutes
  }

  function isWithinRadius(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    transport: TransportMode,
    maxMinutes: number,
  ): boolean {
    return (
      calculateTimeMinutes(lat1, lng1, lat2, lng2, transport) <= maxMinutes
    )
  }

  function getTransportLabel(transport: TransportMode): string {
    const { t } = useI18n()
    return t(`explorer.transport.${transport}`)
  }

  return {
    calculateDistance,
    calculateTimeMinutes,
    isWithinRadius,
    getTransportLabel,
  }
}
