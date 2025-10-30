import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  MapPin, 
  Users, 
  MessageCircle, 
  Shield, 
  Heart,
  LogOut,
  User,
  Flame,
  Waves,
  Mountain,
  Wind,
  Zap,
  TreePine
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/localStorage";
import ProblemReportModal from "@/components/ProblemReportModal";
import SafeZoneMaps from "@/components/SafeZoneMaps";
import VolunteerCoordination from "@/components/VolunteerCoordination";
import EmergencyComm from "@/components/EmergencyComm";
import EmergencyAlert from "@/components/EmergencyAlert";
import SafetyStatus from "@/components/SafetyStatus";
import ResourceDirectory from "@/components/ResourceDirectory";
import BecomeVolunteerModal from "@/components/BecomeVolunteerModal";

export type DisasterType = 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'tsunami' | null;

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showProblemReport, setShowProblemReport] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [refreshVolunteers, setRefreshVolunteers] = useState(0);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const disasterTypes = [
    { id: 'flood', name: 'Flood', icon: Waves, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100' },
    { id: 'earthquake', name: 'Earthquake', icon: Mountain, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100' },
    { id: 'cyclone', name: 'Cyclone', icon: Wind, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100' },
    { id: 'fire', name: 'Fire', icon: Flame, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100' },
    { id: 'landslide', name: 'Landslide', icon: TreePine, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100' },
    { id: 'tsunami', name: 'Tsunami', icon: Zap, color: 'text-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100' }
  ];

  const features = [
    {
      id: 'safe-zones',
      title: 'Safe Zone Maps',
      description: 'Find nearby evacuation centers and safe zones',
      icon: MapPin,
      component: SafeZoneMaps,
      available: !!selectedDisaster
    },
    {
      id: 'volunteers',
      title: 'Volunteer Coordination',
      description: 'Connect with available volunteers',
      icon: Users,
      component: VolunteerCoordination,
      available: !!selectedDisaster
    },
    {
      id: 'communication',
      title: 'Emergency Communication',
      description: 'Coordinate with others in real-time',
      icon: MessageCircle,
      component: EmergencyComm,
      available: true
    },
    {
      id: 'emergency-alert',
      title: 'Emergency Alert (SOS)',
      description: 'Send urgent help requests',
      icon: AlertTriangle,
      component: EmergencyAlert,
      available: !!selectedDisaster
    },
    {
      id: 'safety-status',
      title: 'Safety Status',
      description: 'Update your safety status',
      icon: Shield,
      component: SafetyStatus,
      available: true
    },
    {
      id: 'resources',
      title: 'Resource Directory',
      description: 'Find and share essential resources',
      icon: Heart,
      component: ResourceDirectory,
      available: true
    }
  ];

  const handleVolunteerModalClose = (examPassed?: boolean) => {
    setShowVolunteerModal(false);
    setRefreshVolunteers(prev => prev + 1);
    
    // If exam was passed, automatically show the Volunteer Coordination page
    if (examPassed) {
      // Ensure a disaster is selected
      if (!selectedDisaster) {
        setSelectedDisaster('earthquake');
      }
      setActiveFeature('volunteers');
    }
  };

  const renderActiveFeature = () => {
    const feature = features.find(f => f.id === activeFeature);
    if (!feature) return null;

    const Component = feature.component;
    const props: any = { disasterType: selectedDisaster, onClose: () => setActiveFeature(null) };
    if (feature.id === 'volunteers') {
      props.refreshTrigger = refreshVolunteers;
    }
    return <Component {...props} />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome, {currentUser.fullName}</h1>
                <p className="text-sm text-muted-foreground">Community Disaster Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={() => setShowVolunteerModal(true)}>
                <Heart className="w-4 h-4 mr-2" />
                Become Volunteer
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Active Feature View */}
        {activeFeature && (
          <div className="mb-8">
            {renderActiveFeature()}
          </div>
        )}

        {/* Main Dashboard */}
        {!activeFeature && (
          <>
            {/* Problem Report Section */}
            <Card className="mb-8 border-2 border-primary/20 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  Disaster Report & Selection
                </CardTitle>
                <CardDescription>
                  First, tell us what type of disaster you're affected by. This will activate relevant features and resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {disasterTypes.map((disaster) => {
                    const Icon = disaster.icon;
                    const isSelected = selectedDisaster === disaster.id;
                    return (
                      <Button
                        key={disaster.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-20 flex-col gap-2 ${disaster.bgColor} ${disaster.color} hover:scale-105 transition-all`}
                        onClick={() => setSelectedDisaster(disaster.id as DisasterType)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{disaster.name}</span>
                      </Button>
                    );
                  })}
                </div>

                {selectedDisaster && (
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowProblemReport(true)}
                      variant="emergency"
                      size="lg"
                    >
                      Report {disasterTypes.find(d => d.id === selectedDisaster)?.name} Emergency
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedDisaster(null)}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}

                {!selectedDisaster && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please select the type of disaster affecting your area to access relevant features and resources.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isAvailable = feature.available;
                
                return (
                  <Card 
                    key={feature.id} 
                    className={`transition-all duration-300 ${
                      isAvailable 
                        ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/30' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && setActiveFeature(feature.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isAvailable ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Icon className={`w-6 h-6 ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          {!isAvailable && selectedDisaster === null && (
                            <p className="text-xs text-muted-foreground">Select disaster type first</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Problem Report Modal */}
      {showProblemReport && selectedDisaster && (
        <ProblemReportModal 
          disasterType={selectedDisaster}
          onClose={() => setShowProblemReport(false)}
        />
      )}

      {/* Become Volunteer Modal */}
      <BecomeVolunteerModal 
        open={showVolunteerModal}
        onClose={handleVolunteerModalClose}
      />
    </div>
  );
};

export default Dashboard;