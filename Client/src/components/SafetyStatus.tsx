import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, HelpCircle, MapPin, Clock, Users } from "lucide-react";
import { getCurrentUser, updateSafetyStatus, getSafetyStatuses, getUserSafetyStatus, type SafetyStatus as SafetyStatusType } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";

interface SafetyStatusProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const SafetyStatus = ({ disasterType, onClose }: SafetyStatusProps) => {
  const [currentStatus, setCurrentStatus] = useState<SafetyStatusType | null>(null);
  const [communityStatuses, setCommunityStatuses] = useState<SafetyStatusType[]>([]);
  const [statusForm, setStatusForm] = useState({
    status: "unknown" as "safe" | "need-help" | "unknown",
    location: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const userStatus = getUserSafetyStatus(currentUser.id);
      setCurrentStatus(userStatus);
      if (userStatus) {
        setStatusForm({
          status: userStatus.status,
          location: userStatus.location,
          message: userStatus.message || ""
        });
      }
    }
    
    // Load community statuses
    const allStatuses = getSafetyStatuses();
    setCommunityStatuses(allStatuses.filter(status => status.userId !== currentUser?.id));
  }, [currentUser?.id]);

  const handleStatusUpdate = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your status",
        variant: "destructive"
      });
      return;
    }

    if (!statusForm.location) {
      toast({
        title: "Location Required",
        description: "Please enter your current location",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const status: SafetyStatusType = {
        userId: currentUser.id,
        status: statusForm.status,
        location: statusForm.location,
        timestamp: new Date().toISOString(),
        message: statusForm.message || undefined
      };

      updateSafetyStatus(status);
      
      // Update state immediately
      setCurrentStatus(status);
      
      // Reload community statuses
      const allStatuses = getSafetyStatuses();
      setCommunityStatuses(allStatuses.filter(s => s.userId !== currentUser.id));
      
      // Force re-render by updating the form as well
      setStatusForm({
        status: status.status,
        location: status.location,
        message: status.message || ""
      });
      
      toast({
        title: "Status Updated",
        description: `Your safety status has been updated to: ${
          statusForm.status === 'safe' ? 'Safe' : 
          statusForm.status === 'need-help' ? 'Need Help' : 
          'Unknown'
        }`,
        variant: statusForm.status === 'safe' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "need-help":
        return <AlertTriangle className="w-5 h-5 text-emergency" />;
      default:
        return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "safe":
        return <Badge className="bg-success text-success-foreground">Safe</Badge>;
      case "need-help":
        return <Badge variant="destructive">Need Help</Badge>;
      default:
        return <Badge variant="secondary">Status Unknown</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const safeCount = communityStatuses.filter(s => s.status === "safe").length;
  const helpCount = communityStatuses.filter(s => s.status === "need-help").length;
  const unknownCount = communityStatuses.filter(s => s.status === "unknown").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Safety Status Updates</h2>
          <p className="text-muted-foreground">
            Update your status and check on your community
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Card className={`border-2 ${
        currentStatus?.status === 'safe' ? 'border-success/30 bg-success/5' :
        currentStatus?.status === 'need-help' ? 'border-emergency/30 bg-emergency/5' :
        'border-muted'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Current Status
          </CardTitle>
          <CardDescription>
            Let others know if you're safe or need assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStatus && (
              <Alert className="mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentStatus.status)}
                  <AlertDescription>
                    Last updated: {formatTime(currentStatus.timestamp)} - {getStatusBadge(currentStatus.status)}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div>
              <Label className="text-base font-medium mb-3 block">Safety Status</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={statusForm.status === "safe" ? "success" : "outline"}
                  onClick={() => setStatusForm(prev => ({ ...prev, status: "safe" }))}
                  className="h-16 flex-col gap-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  I'm Safe
                </Button>
                <Button
                  variant={statusForm.status === "need-help" ? "emergency" : "outline"}
                  onClick={() => setStatusForm(prev => ({ ...prev, status: "need-help" }))}
                  className="h-16 flex-col gap-2"
                >
                  <AlertTriangle className="w-6 h-6" />
                  Need Help
                </Button>
                <Button
                  variant={statusForm.status === "unknown" ? "default" : "outline"}
                  onClick={() => setStatusForm(prev => ({ ...prev, status: "unknown" }))}
                  className="h-16 flex-col gap-2"
                >
                  <HelpCircle className="w-6 h-6" />
                  Unknown
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                placeholder="Your current location or address"
                value={statusForm.location}
                onChange={(e) => setStatusForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Any additional information about your situation"
                value={statusForm.message}
                onChange={(e) => setStatusForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleStatusUpdate}
              className="w-full"
              size="lg"
              disabled={loading || !statusForm.location}
            >
              {loading ? "Updating..." : "Update Safety Status"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Safety Overview
          </CardTitle>
          <CardDescription>
            Safety status of people in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{safeCount}</div>
              <div className="text-sm text-muted-foreground">Safe</div>
            </div>
            <div className="text-center p-4 bg-emergency/10 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-emergency mx-auto mb-2" />
              <div className="text-2xl font-bold text-emergency">{helpCount}</div>
              <div className="text-sm text-muted-foreground">Need Help</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-muted-foreground">{unknownCount}</div>
              <div className="text-sm text-muted-foreground">Unknown</div>
            </div>
          </div>

          {/* Recent Status Updates */}
          <div className="space-y-3">
            <h4 className="font-medium">Recent Updates</h4>
            {communityStatuses.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No community status updates available yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {communityStatuses
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 10)
                  .map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status.status)}
                        <div>
                          <div className="font-medium text-sm">Anonymous User</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {status.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(status.status)}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(status.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyStatus;