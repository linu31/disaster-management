import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, Clock, AlertCircle } from "lucide-react";
import { type DisasterType } from "@/pages/Dashboard";
import { fetchNearbyPlaces } from '@/lib/overpassApi';
import { type Location } from '@/lib/locationMapper';
import { formatDistance } from '@/lib/geoUtils';
import { toast } from '@/hooks/use-toast';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DefaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Enhanced custom icons for different types of locations
const createCustomIcon = (color: string, symbol: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <path fill="${color}" stroke="#fff" stroke-width="3" d="M20 4C15.58 4 12 7.58 12 12c0 7 8 20 8 20s8-13 8-20c0-4.42-3.58-8-8-8z"/>
      <circle cx="20" cy="12" r="6" fill="#fff"/>
      <text x="20" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="${color}">${symbol}</text>
    </svg>
  `;
  
  // Use encodeURIComponent to handle special characters instead of btoa
  const encodedSvg = encodeURIComponent(svgIcon);
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${encodedSvg}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [50, 50],
    shadowAnchor: [15, 50]
  });
};

const safeZoneIcon = createCustomIcon('#22c55e', 'S'); // Green with S for Safe Zone
const hospitalIcon = createCustomIcon('#ef4444', 'H'); // Red with H for Hospital
const shelterIcon = createCustomIcon('#3b82f6', 'SH'); // Blue with SH for Shelter
const policeIcon = createCustomIcon('#8b5cf6', 'P'); // Purple with P for Police
const fireStationIcon = createCustomIcon('#f97316', 'F'); // Orange with F for Fire Station

// Location interface now imported from locationMapper

interface RealMapProps {
  disasterType: DisasterType;
  onClose: () => void;
}

// Enhanced mock data based on user location (in a real app, this would come from an API)
const getMockLocations = (disasterType: DisasterType, userLocation?: [number, number]): Location[] => {
  // Base coordinates (NYC if no user location)
  const baseLat = userLocation ? userLocation[0] : 40.7128;
  const baseLng = userLocation ? userLocation[1] : -74.0060;
  
  // Generate locations within 5km radius of user
  const generateNearbyLocation = (baseType: string, offset: {lat: number, lng: number}) => {
    return {
      lat: baseLat + offset.lat,
      lng: baseLng + offset.lng
    };
  };

  const baseLocations: Location[] = [
    {
      id: '1',
      name: 'Central Police Station (Safe Zone)',
      type: 'safe_zone',
      ...generateNearbyLocation('safe_zone', {lat: 0.01, lng: 0.01}),
      address: '123 Main Street, Your Area',
      phone: '+1-555-0123',
      capacity: 500,
      services: ['Emergency Coordination', 'Safe Assembly Point', 'Communication Hub', 'Security']
    },
    {
      id: '2',
      name: 'Regional Medical Center',
      type: 'hospital',
      ...generateNearbyLocation('hospital', {lat: 0.02, lng: -0.01}),
      address: '456 Health Ave, Your Area',
      phone: '+1-555-0456',
      services: ['Emergency Care', 'Trauma Unit', '24/7 Service', 'Ambulance Available', 'ICU']
    },
    {
      id: '3',
      name: 'Community Emergency Shelter',
      type: 'shelter',
      ...generateNearbyLocation('shelter', {lat: -0.01, lng: 0.02}),
      address: '789 Relief Road, Your Area',
      phone: '+1-555-0789',
      capacity: 200,
      services: ['Temporary Housing', 'Meals', 'Clothing', 'Child Care', 'Pet Care']
    },
    {
      id: '4',
      name: 'Police Station Alpha',
      type: 'police',
      ...generateNearbyLocation('police', {lat: 0.015, lng: 0.005}),
      address: '321 Safety St, Your Area',
      phone: '+1-555-0321',
      services: ['Emergency Response', 'Search & Rescue', 'Security', 'Communication Hub']
    },
    {
      id: '5',
      name: 'Fire Station 12',
      type: 'fire_station',
      ...generateNearbyLocation('fire_station', {lat: -0.005, lng: -0.015}),
      address: '111 Firefighter Blvd, Your Area',
      phone: '+1-555-0111',
      services: ['Fire Suppression', 'Rescue Operations', 'Emergency Medical', 'Hazmat Response']
    },
    {
      id: '6',
      name: 'Food Distribution Hub',
      type: 'safe_zone',
      ...generateNearbyLocation('safe_zone', {lat: 0.008, lng: -0.008}),
      address: '555 Food Ave, Your Area',
      phone: '+1-555-0666',
      capacity: 1000,
      services: ['Food Distribution', 'Water Supply', 'Meal Preparation', 'Nutrition Support']
    },
    {
      id: '7',
      name: 'Urgent Care Center',
      type: 'hospital',
      ...generateNearbyLocation('hospital', {lat: -0.012, lng: 0.018}),
      address: '777 Medical Dr, Your Area',
      phone: '+1-555-0777',
      services: ['Emergency Care', 'Mobile Clinic', 'Medication Distribution', 'First Aid Training']
    },
    {
      id: '8',
      name: 'Family Emergency Shelter',
      type: 'shelter',
      ...generateNearbyLocation('shelter', {lat: 0.018, lng: 0.008}),
      address: '888 Family St, Your Area',
      phone: '+1-555-0888',
      capacity: 150,
      services: ['Family Housing', 'Educational Support', 'Counseling', 'Recreation', 'WiFi']
    },
    {
      id: '9',
      name: 'Police Station Beta',
      type: 'police',
      ...generateNearbyLocation('police', {lat: -0.008, lng: -0.012}),
      address: '999 Security Blvd, Your Area',
      phone: '+1-555-0999',
      services: ['Patrol Units', 'Emergency Response', 'Traffic Control', 'Investigation Unit']
    },
    {
      id: '10',
      name: 'Fire Station 8',
      type: 'fire_station',
      ...generateNearbyLocation('fire_station', {lat: 0.012, lng: -0.005}),
      address: '222 Rescue Ave, Your Area',
      phone: '+1-555-0222',
      services: ['Fire Prevention', 'Rescue Operations', 'Medical Emergency', 'Community Safety']
    }
  ];

  // Add disaster-specific locations
  if (disasterType === 'flood') {
    baseLocations.push({
      id: '11',
      name: 'High Ground Evacuation Center',
      type: 'safe_zone',
      ...generateNearbyLocation('safe_zone', {lat: 0.025, lng: 0.015}),
      address: '555 Highland Ave, Your Area',
      phone: '+1-555-0555',
      capacity: 300,
      services: ['Flood Evacuation', 'Dry Shelter', 'Emergency Supplies', 'Boat Rescue']
    });
  }

  if (disasterType === 'fire') {
    baseLocations.push({
      id: '12',
      name: 'Fire Command Center',
      type: 'fire_station',
      ...generateNearbyLocation('fire_station', {lat: -0.02, lng: 0.01}),
      address: '333 Fire Command, Your Area',
      phone: '+1-555-0333',
      services: ['Fire Suppression', 'Incident Command', 'Aerial Support', 'Evacuation Coordination']
    });
  }

  if (disasterType === 'earthquake') {
    baseLocations.push({
      id: '13',
      name: 'Seismic Safety Center',
      type: 'safe_zone',
      ...generateNearbyLocation('safe_zone', {lat: 0.005, lng: 0.025}),
      address: '444 Safety Center Dr, Your Area',
      phone: '+1-555-0444',
      capacity: 400,
      services: ['Structural Assessment', 'Search & Rescue', 'Medical Triage', 'Aftershock Monitoring']
    });
  }

  return baseLocations;
};

const getLocationIcon = (type: string) => {
  switch (type) {
    case 'safe_zone': return safeZoneIcon;
    case 'hospital': return hospitalIcon;
    case 'shelter': return shelterIcon;
    case 'police': return policeIcon;
    case 'fire_station': return fireStationIcon;
    default: return DefaultIcon;
  }
};

const RealMap = ({ disasterType, onClose }: RealMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to NYC coordinates
          setUserPosition([40.7128, -74.0060]);
          setLoading(false);
        }
      );
    } else {
      // Fallback to NYC coordinates
      setUserPosition([40.7128, -74.0060]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load real locations when user position is available
    const loadRealLocations = async () => {
      if (!userPosition) return;

      setIsLoadingPlaces(true);
      setUsingFallback(false);

      try {
        const realLocations = await fetchNearbyPlaces(
          userPosition[0],
          userPosition[1],
          disasterType
        );

        if (realLocations.length > 0) {
          setLocations(realLocations);
          toast({
            title: "Real locations loaded",
            description: `Found ${realLocations.length} emergency services nearby`,
          });
        } else {
          // No results from API, use fallback
          console.log('No locations found, using fallback data');
          setLocations(getMockLocations(disasterType, userPosition));
          setUsingFallback(true);
          toast({
            title: "Using approximate locations",
            description: "No nearby services found in database",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to fetch real locations:', error);
        // Fallback to mock data on error
        setLocations(getMockLocations(disasterType, userPosition));
        setUsingFallback(true);
        toast({
          title: "Using approximate locations",
          description: "Could not connect to location services",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    loadRealLocations();
  }, [disasterType, userPosition]);

  useEffect(() => {
    if (!loading && userPosition && mapRef.current && !mapInstanceRef.current) {
      // Initialize the map
      const map = L.map(mapRef.current).setView(userPosition, 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add user location marker
      L.marker(userPosition, { icon: DefaultIcon })
        .addTo(map)
        .bindPopup('Your current location')
        .openPopup();

      // Add location markers
      locations.forEach((location) => {
        const marker = L.marker([location.lat, location.lng], { 
          icon: getLocationIcon(location.type) 
        }).addTo(map);

        const distanceText = location.distance ? formatDistance(location.distance) : '';
        
        const popupContent = `
          <div style="min-width: 250px; padding: 12px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${location.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${location.address}</p>
            ${distanceText ? `
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <span style="font-size: 12px; background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">📍 ${distanceText}</span>
              </div>
            ` : ''}
            ${location.phone ? `
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <span style="font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">📞 ${location.phone}</span>
              </div>
            ` : ''}
            ${location.capacity ? `
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <span style="font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">👥 Capacity: ${location.capacity} people</span>
              </div>
            ` : ''}
            <div style="margin-bottom: 12px;">
              <p style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Available Services:</p>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${location.services.map(service => `<span style="font-size: 10px; background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px;">${service}</span>`).join('')}
              </div>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; justify-content: space-between; gap: 8px;">
              <button onclick="window.getDirections && window.getDirections(${location.lat}, ${location.lng})" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer;">📍 Get Directions</button>
              ${location.phone ? `<button onclick="window.callLocation && window.callLocation('${location.phone}')" style="flex: 1; background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer;">📞 Call Now</button>` : ''}
            </div>
            <div style="margin-top: 8px; display: flex; align-items: center; gap: 4px; font-size: 11px; color: #059669;">
              <span>⏰ Available 24/7 during emergency</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      mapInstanceRef.current = map;

      // Add global functions for popup interactions
      (window as any).getDirections = (lat: number, lng: number) => {
        if (userPosition) {
          const userLat = userPosition[0];
          const userLng = userPosition[1];
          // Use Google Maps with directions from user's current location to destination
          const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
          window.open(url, '_blank');
        } else {
          // Fallback: open destination location only
          toast({
            title: "Location Required",
            description: "Please allow location access to get directions from your current location.",
            variant: "destructive"
          });
          const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          window.open(url, '_blank');
        }
      };

      (window as any).callLocation = (phone: string) => {
        if (phone && phone !== '') {
          window.location.href = `tel:${phone}`;
        }
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Clean up global functions
      delete (window as any).getDirections;
      delete (window as any).callLocation;
    };
  }, [loading, userPosition, locations]);

  const getDisasterTitle = () => {
    switch (disasterType) {
      case 'flood': return 'Flood Safe Zones & Emergency Services';
      case 'fire': return 'Fire Evacuation Centers & Emergency Services';
      case 'earthquake': return 'Earthquake Safe Zones & Emergency Services';
      case 'cyclone': return 'Cyclone Shelters & Emergency Services';
      case 'landslide': return 'Landslide Safe Areas & Emergency Services';
      case 'tsunami': return 'Tsunami Evacuation Centers & Emergency Services';
      default: return 'Emergency Services Near You';
    }
  };

  if (loading || isLoadingPlaces) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {loading ? 'Loading Map...' : 'Fetching Real Locations...'}
          </CardTitle>
          <CardDescription>
            {loading 
              ? 'Getting your location and nearby emergency services' 
              : 'Finding real emergency services from OpenStreetMap'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {getDisasterTitle()}
            </CardTitle>
            <CardDescription>
              {usingFallback ? (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  Showing approximate locations (offline mode)
                </span>
              ) : (
                'Real emergency services from OpenStreetMap'
              )}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close Map
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-96 w-full" />
        
        <div className="p-4 border-t bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Safe Zones ({locations.filter(l => l.type === 'safe_zone').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Hospitals ({locations.filter(l => l.type === 'hospital').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Shelters ({locations.filter(l => l.type === 'shelter').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">Emergency Services ({locations.filter(l => l.type === 'police' || l.type === 'fire_station').length})</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Click on any marker for details and quick actions (directions, contact)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealMap;