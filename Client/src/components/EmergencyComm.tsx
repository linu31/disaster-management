import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageCircle, Send, AlertTriangle, Info, HelpCircle, User, Clock, MapPin } from "lucide-react";
import { getCurrentUser, saveEmergencyMessage, getEmergencyMessages, getQualifiedVolunteers, type EmergencyMessage } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";

interface EmergencyCommProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const EmergencyComm = ({ disasterType, onClose }: EmergencyCommProps) => {
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"help" | "info" | "alert">("info");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [availableVolunteers, setAvailableVolunteers] = useState(0);

  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadVolunteers();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location" // In real app, reverse geocode this
          });
        },
        (error) => {
          console.log("Location access denied");
          // Fallback location
          setUserLocation({
            lat: 40.7128,
            lng: -74.0060,
            address: "Default Location"
          });
        }
      );
    }
  };

  const loadVolunteers = () => {
    const volunteers = getQualifiedVolunteers();
    setAvailableVolunteers(volunteers.length);
  };

  const loadMessages = () => {
    const allMessages = getEmergencyMessages();
    // Sort by timestamp, newest first
    const sortedMessages = allMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setMessages(sortedMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    setLoading(true);

    const message: EmergencyMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: messageType,
      location: userLocation || undefined,
      notifiedVolunteers: []
    };

    saveEmergencyMessage(message);
    
    // Show success message based on type
    if (messageType === "help" && userLocation) {
      toast({
        title: "Emergency Help Request Sent! 🚨",
        description: `Nearby volunteers have been notified. Help is on the way!`,
      });
    } else {
      toast({
        title: "Message Sent Successfully",
        description: "Your message has been shared with the community.",
      });
    }

    setNewMessage("");
    loadMessages();
    setLoading(false);
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

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "help":
        return <HelpCircle className="w-4 h-4 text-emergency" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getMessageBadgeVariant = (type: string) => {
    switch (type) {
      case "help":
        return "destructive";
      case "alert":
        return "secondary";
      default:
        return "outline";
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
          <h2 className="text-2xl font-bold">Emergency Communication</h2>
          <p className="text-muted-foreground">
            Coordinate with your community during emergencies
          </p>
        </div>
      </div>

      {/* Message Input */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Send Message to Community
          </CardTitle>
          <CardDescription>
            Share important information, request help, or coordinate with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Location Status */}
            {userLocation && (
              <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Location: {userLocation.address}</span>
                {messageType === "help" && (
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                    {availableVolunteers} volunteers nearby
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">📢 Info</SelectItem>
                  <SelectItem value="help">🆘 Help Request</SelectItem>
                  <SelectItem value="alert">⚠️ Alert</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={
                  messageType === "help" 
                    ? "Describe your emergency..." 
                    : "Type your message..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                maxLength={500}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || loading}
                variant={messageType === "help" ? "destructive" : "default"}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>
                {messageType === "help" 
                  ? "🚨 Help requests notify nearby volunteers automatically"
                  : "Use 'Help Request' for urgent assistance, 'Alert' for warnings"
                }
              </span>
              <span>{newMessage.length}/500</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Community Messages</CardTitle>
          <CardDescription>
            Real-time updates from your community ({messages.length} messages)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share information with your community
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{message.userName}</span>
                        <Badge variant={getMessageBadgeVariant(message.type)} className="text-xs">
                          {getMessageIcon(message.type)}
                          <span className="ml-1 capitalize">{message.type}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="border-emergency/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emergency">
            <AlertTriangle className="w-5 h-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            For life-threatening emergencies, contact these services directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emergency/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-emergency" />
              </div>
              <div>
                <p className="font-medium">Emergency Services</p>
                <p className="text-muted-foreground">911 / 112</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Disaster Hotline</p>
                <p className="text-muted-foreground">1-800-DISASTER</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Community Support</p>
                <p className="text-muted-foreground">emergency@local.gov</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyComm;