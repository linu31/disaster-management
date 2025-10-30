import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Heart, Car, UserCheck, MapPin, Phone, Star, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";
import axios from "axios";

interface VolunteerCoordinationProps {
  disasterType: DisasterType;
  onClose: () => void;
  refreshTrigger?: number;
}

const VolunteerCoordination = ({ disasterType, onClose, refreshTrigger }: VolunteerCoordinationProps) => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("available");

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        if (!currentUser?.token) return;
        const res = await axios.get("http://localhost:5000/api/volunteers/recent", {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const fetchedVolunteers = res.data.volunteers.map((user: any) => ({
          ...user,
          availability: user.volunteerStatus === 'active' ? 'Available' : 'Busy',
          rating: (Math.random() * 2 + 3).toFixed(1),
          lastActive: Math.floor(Math.random() * 60) + ' mins ago'
        }));
        setVolunteers(fetchedVolunteers);
        setFilteredVolunteers(fetchedVolunteers);
      } catch (error) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const volunteersWithQualifications = users
          .filter((user: any) => user.qualifications && user.volunteerData?.examPassed && user.volunteerData?.isVolunteer)
          .map((user: any) => ({
            ...user,
            availability: user.volunteerData?.isAvailable ? 'Available' : 'Busy',
            rating: (Math.random() * 2 + 3).toFixed(1),
            lastActive: Math.floor(Math.random() * 60) + ' mins ago'
          }));
        setVolunteers(volunteersWithQualifications);
        setFilteredVolunteers(volunteersWithQualifications);
      }
    };
    fetchVolunteers();
  }, [currentUser, refreshTrigger]);

  useEffect(() => {
    let filtered = volunteers;

    if (availabilityFilter === "available") {
      filtered = filtered.filter(volunteer => volunteer.availability === 'Available');
    }
    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (skillFilter !== "all") {
      filtered = filtered.filter(volunteer => {
        const quals = volunteer.qualifications || {};
        switch (skillFilter) {
          case "medical": return quals.hasFirstAid;
          case "transport": return quals.hasTransportation;
          case "experience": return quals.hasDisasterExperience;
          case "food": return quals.canProvideFood;
          case "shelter": return quals.canProvideAccommodation;
          default: return true;
        }
      });
    }
    setFilteredVolunteers(filtered);
  }, [volunteers, searchTerm, skillFilter, availabilityFilter]);

  const getVolunteerSkills = (qualifications: any) => {
    const skills = [];
    if (qualifications?.hasFirstAid) skills.push("First Aid");
    if (qualifications?.hasTransportation) skills.push("Transportation");
    if (qualifications?.hasDisasterExperience) skills.push("Disaster Experience");
    if (qualifications?.canProvideFood) skills.push("Food Supply");
    if (qualifications?.canProvideAccommodation) skills.push("Accommodation");
    return skills;
  };

  const getDisasterSpecificTitle = () => {
    switch (disasterType) {
      case 'flood': return 'Flood Response Volunteers';
      case 'earthquake': return 'Earthquake Relief Volunteers';
      case 'fire': return 'Fire Emergency Volunteers';
      case 'cyclone': return 'Cyclone Response Team';
      case 'landslide': return 'Landslide Rescue Volunteers';
      case 'tsunami': return 'Tsunami Emergency Volunteers';
      default: return 'Emergency Response Volunteers';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{getDisasterSpecificTitle()}</h2>
          <p className="text-muted-foreground">Connect with volunteers ready to help in your area</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Find Volunteers
          </CardTitle>
          <CardDescription>
            Search for volunteers by name or filter by specific skills needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search volunteers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="all">All Volunteers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                <SelectItem value="medical">Medical/First Aid</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="experience">Disaster Experience</SelectItem>
                <SelectItem value="food">Food & Supplies</SelectItem>
                <SelectItem value="shelter">Accommodation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers List */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Available Volunteers ({filteredVolunteers.length})
          </h3>
          {filteredVolunteers.length === 0 && volunteers.length > 0 && (
            <p className="text-muted-foreground">No volunteers match your search criteria</p>
          )}
        </div>

        {filteredVolunteers.length === 0 && volunteers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Volunteers Available</h3>
                <p className="text-muted-foreground">
                  No volunteers have registered in your area yet. You can help by sharing this platform with others.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredVolunteers.map((volunteer) => {
            const skills = getVolunteerSkills(volunteer.qualifications);
            const isAvailable = volunteer.availability === 'Available';

            return (
              <Card key={volunteer.id || volunteer._id} className={`border-l-4 ${isAvailable ? 'border-l-success bg-success/5' : 'border-l-warning bg-warning/5'}`}>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xl font-bold flex items-center gap-2 mb-2">
                            {volunteer.volunteerData?.name || volunteer.fullName}
                            {isAvailable && (
                              <Badge className="bg-success text-success-foreground">
                                ● Available Now
                              </Badge>
                            )}
                            {!isAvailable && (
                              <Badge variant="secondary">
                                Busy
                              </Badge>
                            )}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-4 h-4" />
                              {volunteer.volunteerData?.location?.address || 'Location not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {volunteer.volunteerData?.phoneNumber || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-2">Available Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {volunteer.qualifications?.hasFirstAid && (
                          <span className="flex items-center gap-2 font-medium">
                            <Heart className="w-4 h-4 text-red-500" />
                            Medical Training
                          </span>
                        )}
                        {volunteer.qualifications?.hasTransportation && (
                          <span className="flex items-center gap-2 font-medium">
                            <Car className="w-4 h-4 text-blue-500" />
                            Vehicle Available
                          </span>
                        )}
                        {volunteer.qualifications?.hasDisasterExperience && (
                          <span className="flex items-center gap-2 font-medium">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            Experienced
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button 
                        size="sm" 
                        className="w-full"
                        disabled={!isAvailable}
                        onClick={() => {
                          if (volunteer.volunteerData?.phoneNumber) {
                            window.open(`tel:${volunteer.volunteerData.phoneNumber}`);
                          }
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Volunteer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      {volunteer.qualifications?.hasTransportation && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          disabled={!isAvailable}
                        >
                          <Car className="w-4 h-4 mr-2" />
                          Request Transport
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VolunteerCoordination;
