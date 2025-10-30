import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { getCurrentUser, saveDisasterReport, type DisasterReport } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";

interface ProblemReportModalProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const ProblemReportModal = ({ disasterType, onClose }: ProblemReportModalProps) => {
  const [formData, setFormData] = useState({
    location: "",
    severity: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentUser = getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !disasterType) return;

    setLoading(true);

    const report: DisasterReport = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: disasterType,
      location: formData.location,
      severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
      description: formData.description,
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    saveDisasterReport(report);
    setSubmitted(true);
    setLoading(false);

    // Auto close after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (submitted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <AlertTriangle className="w-5 h-5" />
              Report Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Alert className="border-success text-success bg-success/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your {disasterType} emergency report has been recorded. Emergency services and volunteers in your area have been notified.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4">
              This dialog will close automatically...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emergency" />
            Report {disasterType?.charAt(0).toUpperCase() + disasterType?.slice(1)} Emergency
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-emergency/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Information
              </CardTitle>
              <CardDescription>
                Provide your current location for emergency responders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  placeholder="Street address, landmark, or area description"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="severity">Emergency Severity Level</Label>
                <Select onValueChange={(value) => handleChange("severity", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Monitoring situation</SelectItem>
                    <SelectItem value="medium">Medium - Need assistance</SelectItem>
                    <SelectItem value="high">High - Urgent help required</SelectItem>
                    <SelectItem value="critical">Critical - Life threatening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Situation Description</CardTitle>
              <CardDescription>
                Describe the current situation in detail to help responders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">What's happening?</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the situation, number of people affected, immediate needs, etc."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Alert className="border-warning bg-warning/5">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>For immediate life-threatening emergencies, call your local emergency services directly.</strong>
              <br />
              This report will be shared with local volunteers and emergency coordinators.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              variant="emergency" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Submitting Report..." : "Submit Emergency Report"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemReportModal;