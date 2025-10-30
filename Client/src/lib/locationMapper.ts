import { calculateDistance } from './geoUtils';

export interface Location {
  id: string;
  name: string;
  type: 'safe_zone' | 'hospital' | 'shelter' | 'police' | 'fire_station';
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  capacity?: number;
  services: string[];
  distance?: number;
}

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    'addr:full'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    phone?: string;
    'contact:phone'?: string;
    capacity?: string;
    emergency?: string;
    [key: string]: any;
  };
}

const getLocationType = (element: OverpassElement): Location['type'] | null => {
  const amenity = element.tags.amenity;
  const emergency = element.tags.emergency;

  if (amenity === 'hospital' || amenity === 'clinic' || emergency === 'hospital') {
    return 'hospital';
  }
  if (amenity === 'police') {
    return 'police';
  }
  if (amenity === 'fire_station') {
    return 'fire_station';
  }
  if (amenity === 'shelter' || emergency === 'shelter') {
    return 'shelter';
  }
  // Government buildings and police stations can serve as safe zones
  if (amenity === 'police' || amenity === 'townhall' || amenity === 'community_centre') {
    return 'safe_zone';
  }

  return null;
};

const getServices = (type: Location['type']): string[] => {
  switch (type) {
    case 'hospital':
      return ['Emergency Care', 'Medical Services', '24/7 Available'];
    case 'police':
      return ['Emergency Response', 'Security', 'Communication Hub'];
    case 'fire_station':
      return ['Fire Suppression', 'Rescue Operations', 'Emergency Response'];
    case 'shelter':
      return ['Temporary Housing', 'Food & Water', 'Emergency Aid'];
    case 'safe_zone':
      return ['Safe Assembly Point', 'Emergency Coordination', 'Security'];
    default:
      return ['Emergency Services'];
  }
};

const constructAddress = (tags: OverpassElement['tags']): string => {
  if (tags['addr:full']) {
    return tags['addr:full'];
  }

  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);

  return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

export const mapOverpassToLocation = (
  element: OverpassElement,
  userLat: number,
  userLng: number
): Location | null => {
  // Must have a name and coordinates
  if (!element.tags.name || !element.lat || !element.lon) {
    return null;
  }

  const type = getLocationType(element);
  if (!type) return null;

  const distance = calculateDistance(userLat, userLng, element.lat, element.lon);

  return {
    id: `osm-${element.id}`,
    name: element.tags.name,
    type,
    lat: element.lat,
    lng: element.lon,
    address: constructAddress(element.tags),
    phone: element.tags.phone || element.tags['contact:phone'],
    capacity: element.tags.capacity ? parseInt(element.tags.capacity) : undefined,
    services: getServices(type),
    distance,
  };
};

export const prioritizeByDisaster = (
  locations: Location[],
  disasterType: string
): Location[] => {
  const priorityMap: Record<string, Location['type'][]> = {
    flood: ['shelter', 'safe_zone', 'hospital', 'police', 'fire_station'],
    fire: ['fire_station', 'hospital', 'safe_zone', 'police', 'shelter'],
    earthquake: ['safe_zone', 'shelter', 'hospital', 'police', 'fire_station'],
    cyclone: ['shelter', 'safe_zone', 'hospital', 'police', 'fire_station'],
    landslide: ['safe_zone', 'hospital', 'police', 'fire_station', 'shelter'],
    tsunami: ['shelter', 'safe_zone', 'hospital', 'police', 'fire_station'],
  };

  const priorities = priorityMap[disasterType] || priorityMap.earthquake;

  return locations.sort((a, b) => {
    const aPriority = priorities.indexOf(a.type);
    const bPriority = priorities.indexOf(b.type);
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by distance
    return (a.distance || 0) - (b.distance || 0);
  });
};
