import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUserQualifications, type VolunteerQualification, type VolunteerData } from "@/lib/localStorage";
import { Heart, User, Truck, Briefcase, Home, Utensils, X, ArrowRight } from "lucide-react";
import VolunteerExam from "./VolunteerExam";

interface BecomeVolunteerModalProps {
  open: boolean;
  onClose: (examPassed?: boolean) => void;
}

const BecomeVolunteerModal = ({ open, onClose }: BecomeVolunteerModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'exam'>('details');
  const [qualifications, setQualifications] = useState<VolunteerQualification>({
    hasFirstAid: false,
    hasTransportation: false,
    hasDisasterExperience: false,
    canProvideFood: false,
    canProvideAccommodation: false,
  });
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");

  const handleDetailsSubmit = () => {
    const user = getCurrentUser();
    if (!user) return;

    if (!name || !phoneNumber || !location) {
      toast({
        title: "Missing Information",
        description: "Please provide your name, phone number and location",
        variant: "destructive"
      });
      return;
    }

    // Save qualifications immediately
    console.log("Saving qualifications for user:", user.id, qualifications);
    updateUserQualifications(user.id, qualifications);
    setStep('exam');
  };

  const handleExamComplete = (passed: boolean, score: number) => {
    if (passed) {
      toast({
        title: "Congratulations! 🎉",
        description: `You've passed the exam with ${score}% and are now a qualified volunteer! You can now see all available volunteers including yourself.`,
        duration: 6000,
      });
    }
    onClose(passed);
  };

  // Get user's current location
  const [userLat, setUserLat] = useState(0);
  const [userLng, setUserLng] = useState(0);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const volunteerData: VolunteerData = {
    isVolunteer: false,
    examPassed: false,
    examScore: 0,
    name: name,
    location: {
      lat: userLat,
      lng: userLng,
      address: location
    },
    phoneNumber: phoneNumber,
    skills: skills,
    availability: availability,
    dateRegistered: new Date().toISOString(),
    isAvailable: true
  };

  const qualificationItems = [
    {
      key: 'hasFirstAid',
      label: 'First Aid Training',
      description: 'Do you have first aid or medical training?',
      icon: Heart
    },
    {
      key: 'hasTransportation',
      label: 'Transportation',
      description: 'Can you provide transportation assistance?',
      icon: Truck
    },
    {
      key: 'hasDisasterExperience',
      label: 'Disaster Response Experience',
      description: 'Do you have experience in disaster relief or emergency response?',
      icon: Briefcase
    },
    {
      key: 'canProvideAccommodation',
      label: 'Accommodation',
      description: 'Can you provide temporary shelter or accommodation?',
      icon: Home
    },
    {
      key: 'canProvideFood',
      label: 'Food Support',
      description: 'Can you help with food preparation or distribution?',
      icon: Utensils
    }
  ];

  if (step === 'exam') {
    return (
      <Dialog open={open} onOpenChange={() => onClose(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <VolunteerExam 
            volunteerData={volunteerData}
            onExamComplete={handleExamComplete}
            onClose={() => onClose(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-primary" />
            Become a Volunteer - Step 1: Your Details
          </DialogTitle>
          <DialogDescription className="text-base">
            Join our community of volunteers helping during disasters. First, tell us about your skills and availability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Qualifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Skills & Resources</CardTitle>
              <CardDescription>
                Select all that apply to help us match you with appropriate volunteer opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualificationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <Checkbox
                      id={item.key}
                      checked={qualifications[item.key as keyof VolunteerQualification]}
                      onCheckedChange={(checked) =>
                        setQualifications(prev => ({
                          ...prev,
                          [item.key]: checked
                        }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">
                          {item.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Contact Information - Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal & Contact Information</CardTitle>
              <CardDescription>
                Required for emergency coordination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-base font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., +1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  Location/Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., City, State or full address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="skills" className="text-base font-medium">
                Additional Skills (Optional)
              </Label>
              <Textarea
                id="skills"
                placeholder="e.g., Language skills, technical expertise, specialized training..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="availability" className="text-base font-medium">
                Availability (Optional)
              </Label>
              <Input
                id="availability"
                placeholder="e.g., Weekends, evenings, 24/7 emergency response..."
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleDetailsSubmit} className="flex-1" size="lg">
              Continue to Qualification Exam
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => onClose(false)} size="lg">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeVolunteerModal;