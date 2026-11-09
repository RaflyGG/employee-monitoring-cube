/**
 * Geofencing Utility using Haversine formula
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OfficeConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

// Dummy office location (Lat: -6.9740, Long: 107.6305, Radius: 100 meters)
export const DEFAULT_OFFICE: OfficeConfig = {
  latitude: -6.970380128456204,
  longitude: 107.63020567666241,
  radiusMeters: 500,
};


/**
 * Calculates great-circle distance between two coordinates in meters
 * using the Haversine formula.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verifies if user coordinates fall inside the office geofence.
 */
export function checkGeofence(
  userLat: number,
  userLon: number,
  office: OfficeConfig = DEFAULT_OFFICE
): {
  isInside: boolean;
  distance: number;
  radius: number;
} {
  const distance = calculateDistance(
    userLat,
    userLon,
    office.latitude,
    office.longitude
  );

  return {
    isInside: distance <= office.radiusMeters,
    distance,
    radius: office.radiusMeters,
  };
}

