/**
 * Coordinates utility for Hyderabad neighborhoods and property mapping.
 * Provides verified neighborhood-level coordinates for Hyderabad real estate.
 */

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  name: string;
}

// Verified coordinates for major Hyderabad real estate hubs
export const HYDERABAD_NEIGHBORHOOD_COORDS: Record<string, LocationCoordinate> = {
  'madhapur': {
    latitude: 17.4483,
    longitude: 78.3915,
    name: 'Madhapur',
  },
  'gachibowli': {
    latitude: 17.4401,
    longitude: 78.3489,
    name: 'Gachibowli',
  },
  'kondapur': {
    latitude: 17.4699,
    longitude: 78.3578,
    name: 'Kondapur',
  },
  'banjara hills': {
    latitude: 17.4156,
    longitude: 78.4357,
    name: 'Banjara Hills',
  },
  'jubilee hills': {
    latitude: 17.4319,
    longitude: 78.4073,
    name: 'Jubilee Hills',
  },
  'kukatpally': {
    latitude: 17.4938,
    longitude: 78.3996,
    name: 'Kukatpally',
  },
  'miyapur': {
    latitude: 17.4968,
    longitude: 78.3546,
    name: 'Miyapur',
  },
  'hitec city': {
    latitude: 17.4435,
    longitude: 78.3772,
    name: 'Hitec City',
  },
  'financial district': {
    latitude: 17.4172,
    longitude: 78.3448,
    name: 'Financial District',
  },
  'manikonda': {
    latitude: 17.4005,
    longitude: 78.3840,
    name: 'Manikonda',
  },
  'nallagandla': {
    latitude: 17.4728,
    longitude: 78.3182,
    name: 'Nallagandla',
  },
  'kokapet': {
    latitude: 17.3892,
    longitude: 78.3248,
    name: 'Kokapet',
  },
  'tellapur': {
    latitude: 17.4660,
    longitude: 78.2930,
    name: 'Tellapur',
  },
  'begumpet': {
    latitude: 17.4447,
    longitude: 78.4664,
    name: 'Begumpet',
  },
  'secunderabad': {
    latitude: 17.4399,
    longitude: 78.4983,
    name: 'Secunderabad',
  },
  'uppal': {
    latitude: 17.4018,
    longitude: 78.5602,
    name: 'Uppal',
  },
};

// Default center coordinates for Hyderabad city
export const HYDERABAD_DEFAULT_CENTER = {
  latitude: 17.4401,
  longitude: 78.3820,
  zoom: 12,
};

/**
 * Resolves coordinates for a property location string.
 * Priority:
 * 1. Explicit lat/lng passed in database record
 * 2. Matched Hyderabad neighborhood from verified dictionary (approximate)
 * 3. Null if location is outside known areas or unspecified
 */
export function getCoordinatesForLocation(
  locationStr: string,
  explicitLat?: number | null,
  explicitLng?: number | null
): { latitude: number; longitude: number; isApproximate: boolean } | null {
  if (
    explicitLat !== undefined &&
    explicitLat !== null &&
    !isNaN(explicitLat) &&
    explicitLng !== undefined &&
    explicitLng !== null &&
    !isNaN(explicitLng) &&
    explicitLat !== 0 &&
    explicitLng !== 0
  ) {
    return {
      latitude: explicitLat,
      longitude: explicitLng,
      isApproximate: false,
    };
  }

  if (!locationStr || typeof locationStr !== 'string') {
    return null;
  }

  const normalized = locationStr.toLowerCase().trim();

  // Look for neighborhood match in location string
  for (const [key, coords] of Object.entries(HYDERABAD_NEIGHBORHOOD_COORDS)) {
    if (normalized.includes(key)) {
      // Add slight micro-offset based on string hash so two properties in the same neighborhood don't overlap completely
      const hash = locationStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset = ((hash % 11) - 5) * 0.0015;
      const lngOffset = (((hash * 7) % 11) - 5) * 0.0015;

      return {
        latitude: Number((coords.latitude + latOffset).toFixed(6)),
        longitude: Number((coords.longitude + lngOffset).toFixed(6)),
        isApproximate: true,
      };
    }
  }

  return null;
}

/**
 * Formats property price into standard Indian compact notation for map markers.
 * Examples: ₹38K, ₹65K, ₹1.15Cr, ₹3.85Cr
 */
export function formatMarkerPrice(price: number): string {
  if (!price || isNaN(price)) return '₹0';

  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr}Cr`;
  }

  if (price >= 100000) {
    const l = (price / 100000).toFixed(1).replace(/\.0$/, '');
    return `₹${l}L`;
  }

  if (price >= 1000) {
    const k = Math.round(price / 1000);
    return `₹${k}K`;
  }

  return `₹${price}`;
}
