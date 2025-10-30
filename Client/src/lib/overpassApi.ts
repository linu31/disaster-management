import { locationCache } from './locationCache';
import { mapOverpassToLocation, prioritizeByDisaster, type Location } from './locationMapper';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS = 5000; // 5km in meters
const REQUEST_TIMEOUT = 25000; // 25 seconds

interface OverpassResponse {
  elements: Array<{
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: Record<string, any>;
  }>;
}

const buildOverpassQuery = (lat: number, lng: number, radius: number): string => {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="police"](around:${radius},${lat},${lng});
      node["amenity"="fire_station"](around:${radius},${lat},${lng});
      node["amenity"="shelter"](around:${radius},${lat},${lng});
      node["emergency"="shelter"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["amenity"="townhall"](around:${radius},${lat},${lng});
    );
    out body;
  `;
};

export const fetchNearbyPlaces = async (
  lat: number,
  lng: number,
  disasterType: string,
  radius: number = SEARCH_RADIUS
): Promise<Location[]> => {
  // Check cache first
  const cacheKey = locationCache.generateKey(lat, lng, radius);
  const cached = locationCache.get<Location[]>(cacheKey);
  if (cached) {
    console.log('Returning cached location data');
    return prioritizeByDisaster(cached, disasterType);
  }

  try {
    const query = buildOverpassQuery(lat, lng, radius);
    
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    
    // Map Overpass elements to our Location interface
    const locations: Location[] = data.elements
      .map((element) => mapOverpassToLocation(element, lat, lng))
      .filter((location): location is Location => location !== null);

    console.log(`Fetched ${locations.length} real locations from OpenStreetMap`);

    // Cache the results for 5 minutes
    locationCache.set(cacheKey, locations, 5 * 60 * 1000);

    // Prioritize and limit to top 15 locations
    const prioritized = prioritizeByDisaster(locations, disasterType);
    return prioritized.slice(0, 15);
  } catch (error) {
    console.error('Error fetching from Overpass API:', error);
    throw error;
  }
};
