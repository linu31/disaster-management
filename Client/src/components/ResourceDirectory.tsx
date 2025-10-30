import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Plus, MapPin, Phone, Clock, Utensils, Home, Pill, Shirt, Droplets, Car, User } from "lucide-react";
import { getCurrentUser, saveResource, getResources, type Resource } from "@/lib/localStorage";
import { DisasterType } from "@/pages/Dashboard";

interface ResourceDirectoryProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const ResourceDirectory = ({ disasterType, onClose }: ResourceDirectoryProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    type: "food" as Resource["type"],
    title: "",
    description: "",
    location: "",
    contact: ""
  });

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(resource => resource.type === filterType);
    }

    // Sort by timestamp, newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType]);

  const loadResources = () => {
    const allResources = getResources();
    setResources(allResources);
  };

  const handleAddResource = () => {
    if (!currentUser || !newResource.title || !newResource.location || !newResource.contact) return;

    const resource: Resource = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: newResource.type,
      title: newResource.title,
      description: newResource.description,
      location: newResource.location,
      contact: newResource.contact,
      available: true,
      timestamp: new Date().toISOString()
    };

    saveResource(resource);
    loadResources();
    setShowAddDialog(false);
    setNewResource({
      type: "food",
      title: "",
      description: "",
      location: "",
      contact: ""
    });
  };

  const resourceTypes = [
    { id: "food", name: "Food", icon: Utensils, color: "text-orange-600" },
    { id: "shelter", name: "Shelter", icon: Home, color: "text-blue-600" },
    { id: "medicine", name: "Medicine", icon: Pill, color: "text-red-600" },
    { id: "clothing", name: "Clothing", icon: Shirt, color: "text-purple-600" },
    { id: "water", name: "Water", icon: Droplets, color: "text-cyan-600" },
    { id: "transportation", name: "Transport", icon: Car, color: "text-green-600" }
  ];

  const getResourceIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.id === type);
    if (!resourceType) return Utensils;
    return resourceType.icon;
  };

  const getResourceColor = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.id === type);
    return resourceType?.color || "text-muted-foreground";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Resource Directory</h2>
          <p className="text-muted-foreground">
            Find and share essential resources in your community
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Resource
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resourceType">Resource Type</Label>
                <Select value={newResource.type} onValueChange={(value: any) => setNewResource(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your resource"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're offering"
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where can people find this resource?"
                  value={newResource.location}
                  onChange={(e) => setNewResource(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={newResource.contact}
                  onChange={(e) => setNewResource(prev => ({ ...prev, contact: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAddResource}
                  className="flex-1"
                  disabled={!newResource.title || !newResource.location || !newResource.contact}
                >
                  Add Resource
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Find Resources
          </CardTitle>
          <CardDescription>
            Search for available resources or filter by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {resourceTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resource Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Categories</CardTitle>
          <CardDescription>
            Quick access to different types of resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {resourceTypes.map(type => {
              const Icon = type.icon;
              const count = resources.filter(r => r.type === type.id && r.available).length;
              return (
                <Button
                  key={type.id}
                  variant={filterType === type.id ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setFilterType(filterType === type.id ? "all" : type.id)}
                >
                  <Icon className={`w-6 h-6 ${type.color}`} />
                  <div className="text-center">
                    <div className="text-xs font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">({count})</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            Available Resources ({filteredResources.length})
          </h3>
          {filteredResources.length === 0 && resources.length > 0 && (
            <p className="text-muted-foreground">No resources match your criteria</p>
          )}
        </div>

        {filteredResources.length === 0 && resources.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Resources Available</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share resources with your community
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              const isOwner = resource.userId === currentUser?.id;

              return (
                <Card key={resource.id} className="border-l-4 border-l-secondary">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${getResourceColor(resource.type)}`} />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold">{resource.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {resourceTypes.find(rt => rt.id === resource.type)?.name}
                                </Badge>
                                {isOwner && (
                                  <Badge variant="secondary" className="text-xs">
                                    Your Resource
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={resource.available ? "default" : "secondary"}>
                            {resource.available ? "Available" : "Not Available"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {resource.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{resource.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{resource.contact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{isOwner ? "You" : "Community Member"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Posted {formatTime(resource.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!isOwner && resource.available && (
                          <>
                            <Button size="sm" className="w-full">
                              <Phone className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <MapPin className="w-4 h-4 mr-2" />
                              Directions
                            </Button>
                          </>
                        )}
                        {isOwner && (
                          <Button variant="outline" size="sm" className="w-full">
                            Edit Resource
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ResourceDirectory;