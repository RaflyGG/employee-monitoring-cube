/**
 * Geolocation & Anti-Fraud utilities for Attendance Geofencing
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1.latitude * Math.PI) / 180;
  const phi2 = (coord2.latitude * Math.PI) / 180;
  const deltaPhi = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLambda = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks if employee is within allowed office radius
 */
export function isWithinOfficeRadius(
  userCoord: Coordinates,
  officeCoord: Coordinates,
  radiusMeters: number = 100
): { isWithin: boolean; distanceMeters: number } {
  const distance = calculateDistanceMeters(userCoord, officeCoord);
  return {
    isWithin: distance <= radiusMeters,
    distanceMeters: distance,
  };
}

