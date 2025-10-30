import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";

interface EmergencyAlertProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const EmergencyAlert = ({ disasterType, onClose }: EmergencyAlertProps) => {
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sosData, setSosData] = useState({
    location: "",
    situation: "",
    peopleCount: "1",
    urgency: "high"
  });

  const currentUser = getCurrentUser();

  const handleSOSSubmit = () => {
    // In a real app, this would send alerts to emergency services and nearby volunteers
    setAlertSent(true);
    
    // Auto close after showing success
    setTimeout(() => {
      setShowSOSDialog(false);
      setAlertSent(false);
      setSosData({ location: "", situation: "", peopleCount: "1", urgency: "high" });
    }, 3000);
  };

  const handleQuickSOS = () => {
    // Quick SOS without additional details
    setAlertSent(true);
    setTimeout(() => {
      setAlertSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Emergency Alert System</h2>
          <p className="text-muted-foreground">
            Send urgent alerts when you need immediate assistance
          </p>
        </div>
      </div>

      {/* Quick SOS Section */}
      <Card className="border-emergency/30 bg-emergency/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emergency">
            <AlertTriangle className="w-6 h-6" />
            EMERGENCY SOS
          </CardTitle>
          <CardDescription>
            For immediate life-threatening situations requiring urgent help
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-emergency bg-emergency/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                Only use SOS for real emergencies. False alarms can divert resources from genuine emergencies.
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="emergency" 
                size="lg" 
                className="h-16 text-lg font-bold"
                onClick={handleQuickSOS}
              >
                <AlertTriangle className="w-6 h-6 mr-2" />
                SEND IMMEDIATE SOS
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 border-emergency text-emergency hover:bg-emergency/10"
                onClick={() => setShowSOSDialog(true)}
              >
                <AlertTriangle className="w-6 h-6 mr-2" />
                SOS WITH DETAILS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Status */}
      {alertSent && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Emergency Alert Sent Successfully</h3>
                <p className="text-sm">Emergency services and nearby volunteers have been notified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              When to Use SOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-emergency mt-0.5" />
                <span>Immediate physical danger or injury</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-emergency mt-0.5" />
                <span>Medical emergency requiring urgent care</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-emergency mt-0.5" />
                <span>Trapped or stranded in dangerous conditions</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-emergency mt-0.5" />
                <span>Witnessing someone in immediate danger</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <span>Emergency services are notified immediately</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <span>Nearby volunteers receive your alert</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <span>Your location is shared with responders</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <span>Community members are alerted to help</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Alternative Emergency Contacts
          </CardTitle>
          <CardDescription>
            If you cannot use the SOS system, contact these numbers directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emergency/5 rounded-lg">
              <Phone className="w-8 h-8 text-emergency mx-auto mb-2" />
              <h3 className="font-semibold">Emergency Services</h3>
              <p className="text-2xl font-bold text-emergency">911</p>
              <p className="text-xs text-muted-foreground">Fire, Police, Medical</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Disaster Hotline</h3>
              <p className="text-lg font-bold text-primary">1-800-DISASTER</p>
              <p className="text-xs text-muted-foreground">24/7 Disaster Support</p>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <Phone className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold">Local Emergency</h3>
              <p className="text-lg font-bold text-secondary">(555) 123-HELP</p>
              <p className="text-xs text-muted-foreground">Community Response</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOS Details Dialog */}
      <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emergency">
              <AlertTriangle className="w-5 h-5" />
              Emergency SOS Details
            </DialogTitle>
          </DialogHeader>
          
          {alertSent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-success mb-2">SOS Alert Sent</h3>
              <p className="text-muted-foreground">
                Emergency responders have been notified and are on their way.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  placeholder="Describe your exact location"
                  value={sosData.location}
                  onChange={(e) => setSosData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="situation">Emergency Situation</Label>
                <Textarea
                  id="situation"
                  placeholder="Briefly describe what's happening"
                  value={sosData.situation}
                  onChange={(e) => setSosData(prev => ({ ...prev, situation: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="peopleCount">Number of People Affected</Label>
                <Input
                  id="peopleCount"
                  type="number"
                  min="1"
                  value={sosData.peopleCount}
                  onChange={(e) => setSosData(prev => ({ ...prev, peopleCount: e.target.value }))}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="emergency" 
                  onClick={handleSOSSubmit}
                  className="flex-1"
                >
                  Send SOS Alert
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSOSDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyAlert;