import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowRight, MapPin, Phone } from "lucide-react";
import { getCurrentUser, updateUserQualifications, updateUserVolunteerData, type VolunteerQualification, type VolunteerData } from "@/lib/localStorage";
import VolunteerExam from "@/components/VolunteerExam";

const VolunteerQualification = () => {
  const navigate = useNavigate();
  const [qualifications, setQualifications] = useState<VolunteerQualification>({
    hasFirstAid: false,
    hasTransportation: false,
    hasDisasterExperience: false,
    canProvideFood: false,
    canProvideAccommodation: false
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: qualifications, 2: location/contact, 3: exam
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showExam, setShowExam] = useState(false);

  const currentUser = getCurrentUser();

  // Redirect if not logged in
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Could not get location:", error);
        }
      );
    }
  }, []);

  const questions = [
    {
      key: "hasFirstAid" as keyof VolunteerQualification,
      question: "Do you have first aid training or medical experience?",
      description: "This helps us match you with medical emergency situations"
    },
    {
      key: "hasTransportation" as keyof VolunteerQualification,
      question: "Can you provide transportation assistance?",
      description: "Helping evacuate people or transport supplies"
    },
    {
      key: "hasDisasterExperience" as keyof VolunteerQualification,
      question: "Do you have experience in disaster relief operations?",
      description: "Previous experience with emergency response or crisis management"
    },
    {
      key: "canProvideFood" as keyof VolunteerQualification,
      question: "Can you provide food or cooking assistance?",
      description: "Helping prepare meals or donating food supplies"
    },
    {
      key: "canProvideAccommodation" as keyof VolunteerQualification,
      question: "Can you offer temporary shelter or accommodation?",
      description: "Providing temporary housing for displaced individuals"
    }
  ];

  const handleAnswer = (key: keyof VolunteerQualification, value: boolean) => {
    setQualifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      updateUserQualifications(currentUser.id, qualifications);
      setStep(2);
    } else if (step === 2) {
      if (!phoneNumber || !address) {
        alert("Please fill in all required fields");
        return;
      }
      setStep(3);
    }
  };

  const handleStartExam = () => {
    const volunteerData: VolunteerData = {
      isVolunteer: false,
      examPassed: false,
      name: currentUser.fullName,
      location: {
        lat: userLocation?.lat || 40.7128,
        lng: userLocation?.lng || -74.0060,
        address: address
      },
      phoneNumber: phoneNumber,
      dateRegistered: new Date().toISOString(),
      isAvailable: true
    };
    
    updateUserVolunteerData(currentUser.id, volunteerData);
    setShowExam(true);
  };

  const handleExamComplete = (passed: boolean, score: number) => {
    setShowExam(false);
    if (passed) {
      navigate("/dashboard");
    }
  };

  const handleCloseExam = () => {
    setShowExam(false);
    navigate("/dashboard");
  };

  if (showExam) {
    const volunteerData: VolunteerData = {
      isVolunteer: false,
      examPassed: false,
      name: currentUser.fullName,
      location: {
        lat: userLocation?.lat || 40.7128,
        lng: userLocation?.lng || -74.0060,
        address: address
      },
      phoneNumber: phoneNumber,
      dateRegistered: new Date().toISOString(),
      isAvailable: true
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/5 to-primary/5 p-4 flex items-center justify-center">
        <VolunteerExam
          volunteerData={volunteerData}
          onExamComplete={handleExamComplete}
          onClose={handleCloseExam}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl">
              {step === 1 && "Volunteer Qualifications"}
              {step === 2 && "Location & Contact Info"}
              {step === 3 && "Ready for Exam"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1 && "Help us understand how you can best contribute during emergencies."}
              {step === 2 && "We need your location and contact details to connect you with nearby emergencies."}
              {step === 3 && "Take a 10-question exam to become a qualified volunteer."}
            </CardDescription>
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                {questions.map((item, index) => (
                  <Card key={item.key} className="border-2 hover:border-primary/20 transition-colors">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {index + 1}. {item.question}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        </div>
                        
                        <div className="flex gap-4">
                          <Button
                            variant={qualifications[item.key] === true ? "success" : "outline"}
                            onClick={() => handleAnswer(item.key, true)}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                          <Button
                            variant={qualifications[item.key] === false ? "default" : "outline"}
                            onClick={() => handleAnswer(item.key, false)}
                            className="flex-1"
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Alert className="border-secondary text-secondary bg-secondary/5">
                  <Heart className="h-4 w-4" />
                  <AlertDescription>
                    Don't worry if you answered "No" to some questions. Every form of help is valuable, 
                    and we'll match you with appropriate volunteer opportunities based on your availability and skills.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This will be used to notify you of nearby emergencies via SMS
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        Your Address *
                      </Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State, ZIP"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll use this to match you with emergencies in your area
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="border-blue-500 bg-blue-50">
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    {userLocation 
                      ? "✓ Location detected automatically. You can still edit your address above."
                      : "We couldn't detect your location automatically. Please enter your address manually."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-center">
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Ready to Become a Volunteer?</h3>
                    <p className="text-muted-foreground">
                      Take our 10-question disaster management exam. You need 70% to pass and become a qualified volunteer.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="font-medium">📱 Phone</p>
                        <p className="text-muted-foreground">{phoneNumber}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded">
                        <p className="font-medium">📍 Location</p>
                        <p className="text-muted-foreground">{address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              
              <Button 
                onClick={step === 3 ? handleStartExam : handleNext}
                className="flex-1"
                size="lg"
                disabled={loading}
              >
                {step === 1 && "Continue"}
                {step === 2 && "Continue"}
                {step === 3 && "Start Exam"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerQualification;