import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, MessageCircle, AlertTriangle, Heart, MapPin } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Safe Zone Maps",
      description: "Find nearby evacuation centers, relief camps, and safe zones based on your location and disaster type."
    },
    {
      icon: Users,
      title: "Volunteer Coordination",
      description: "Connect with qualified volunteers who can provide immediate assistance during emergencies."
    },
    {
      icon: MessageCircle,
      title: "Emergency Communication",
      description: "Real-time messaging system for coordinating help and sharing critical information."
    },
    {
      icon: AlertTriangle,
      title: "Emergency Alerts",
      description: "Instant SOS alerts to notify your network and emergency services when you need help."
    },
    {
      icon: Shield,
      title: "Safety Status Updates",
      description: "Let others know you're safe or request help with location-based status updates."
    },
    {
      icon: Heart,
      title: "Resource Directory",
      description: "Find and share essential resources like food, shelter, medicine, and transportation."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Community Disaster Management App
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Connecting communities in times of crisis. Get help, offer support, and stay safe together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/signup')}
                className="text-lg px-8 py-3"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/login')}
                className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering Communities During Crisis
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When disasters strike, every second counts. Our platform connects disaster-affected 
              individuals with volunteers and resources, creating a network of support when it's 
              needed most. Whether you need help or want to offer assistance, we're here to 
              strengthen community resilience.
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Essential Crisis Management Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed to help communities prepare for, respond to, 
              and recover from disasters.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-secondary to-secondary-hover text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg mb-8 text-secondary-foreground/90">
              Join our community of helpers and build a more resilient future together.
            </p>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/signup')}
              className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Join the Community
            </Button>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Support Disaster Relief Efforts
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your donation helps us provide essential resources, coordinate volunteers, and support communities during their most challenging times.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">Emergency Fund</CardTitle>
                  <CardDescription>Immediate disaster response and relief supplies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">$25</div>
                  <Button className="w-full" size="lg">Donate Now</Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-primary/50 hover:border-primary transition-colors transform hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-xl">Community Support</CardTitle>
                  <CardDescription>Long-term recovery and rebuilding efforts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">$100</div>
                  <Button className="w-full" size="lg">Donate Now</Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">Volunteer Training</CardTitle>
                  <CardDescription>Equipment and training for community volunteers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">$250</div>
                  <Button className="w-full" size="lg">Donate Now</Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="outline" className="min-w-48">
                Custom Amount
              </Button>
              <Button size="lg" className="min-w-48">
                Monthly Donation
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              All donations are secure and tax-deductible. 100% of funds go directly to disaster relief efforts.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Details */}
      <footer className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-4 text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                emergency@communitydisaster.org
              </p>
              <p className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                24/7 Emergency Hotline: 1-800-DISASTER
              </p>
              <p className="flex items-center justify-center gap-2">
                © All Rights Reserved | 2025 Community Disaster Management App
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;