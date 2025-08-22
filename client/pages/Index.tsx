import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import MediaPlayer from "@/components/MediaPlayer";
import { 
  Play, 
  Radio, 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Headphones,
  Tv,
  Wifi
} from "lucide-react";

export default function Index() {
  const [channels, setChannels] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading channels and updates
    const timer = setTimeout(() => {
      setChannels([
        { id: 1, name: "Radio Caraibes", type: "Radio", status: "live", listeners: 1248 },
        { id: 2, name: "Radio Metropole", type: "Radio", status: "live", listeners: 892 },
        { id: 3, name: "Telemax", type: "TV", status: "live", viewers: 2156 },
        { id: 4, name: "Radio Vision 2000", type: "Radio", status: "offline", listeners: 0 },
        { id: 5, name: "Tele Eclair", type: "TV", status: "live", viewers: 734 },
        { id: 6, name: "Radio Kiskeya", type: "Radio", status: "live", listeners: 1567 },
      ]);
      setUpdates([
        { id: 1, title: "New Radio Station Added", time: "2 hours ago", content: "Radio Caraibes FM now available in HD quality" },
        { id: 2, title: "Server Maintenance Complete", time: "5 hours ago", content: "All streaming services are now running optimally" },
        { id: 3, title: "Weekend Programming Update", time: "1 day ago", content: "Special weekend shows added to the schedule" },
      ]);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              LQR SPORT V2
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Your Premium Haitian Media Hub - Streams, Radio & More
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Wifi className="w-4 h-4 mr-2" />
                Live Streaming
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Radio className="w-4 h-4 mr-2" />
                HD Radio
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Tv className="w-4 h-4 mr-2" />
                TV Channels
              </Badge>
            </div>
            
            {/* Featured Media Player */}
            <MediaPlayer title="Featured Live Stream - Radio Caraibes FM" />
          </div>
        </div>
      </section>

      {/* Haitian Streams Section */}
      <section id="streams" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Haitian Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="w-5 h-5 text-primary" />
                      <span>Stream {i}</span>
                    </CardTitle>
                    <Badge variant="default" className="bg-red-600 hover:bg-red-600">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">High quality Haitian content streaming 24/7</p>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Stream
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section id="channels" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Channels</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2 text-muted-foreground">
                <Headphones className="w-6 h-6 animate-bounce" />
                <span>Loading channels...</span>
              </div>
            </div>
          ) : error ? (
            <Alert className="max-w-2xl mx-auto border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center">
                ❌ Failed to load channels. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <Card key={channel.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {channel.type === "Radio" ? (
                          <Radio className="w-5 h-5 text-primary" />
                        ) : (
                          <Tv className="w-5 h-5 text-primary" />
                        )}
                        <span>{channel.name}</span>
                      </CardTitle>
                      <Badge variant={channel.status === "live" ? "default" : "secondary"}>
                        {channel.status === "live" ? "LIVE" : "OFFLINE"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">{channel.type}</span>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{channel.listeners || channel.viewers || 0}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={channel.status !== "live"}
                      variant={channel.status === "live" ? "default" : "secondary"}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {channel.status === "live" ? "Listen Now" : "Offline"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Radio Section */}
      <section id="radio" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Radio Stations</h2>
          <div className="max-w-4xl mx-auto">
            <MediaPlayer title="🎧 Live Radio - Now Playing: Haitian Konpa Music" isLive={true} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {channels.filter(c => c.type === "Radio").map((radio) => (
                <Card key={radio.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Radio className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{radio.name}</h3>
                          <p className="text-sm text-muted-foreground">{radio.listeners} listeners</p>
                        </div>
                      </div>
                      <Badge variant={radio.status === "live" ? "default" : "secondary"}>
                        {radio.status === "live" ? "LIVE" : "OFFLINE"}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={radio.status !== "live"}
                      variant={radio.status === "live" ? "default" : "secondary"}
                    >
                      <Headphones className="w-4 h-4 mr-2" />
                      {radio.status === "live" ? "Listen Live" : "Offline"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section id="updates" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Latest Updates</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-6 h-6 animate-spin" />
                <span>Loading updates...</span>
              </div>
            </div>
          ) : updates.length === 0 ? (
            <Alert className="max-w-2xl mx-auto border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center">
                ❌ Failed to load updates. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {updates.map((update) => (
                <Card key={update.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{update.time}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{update.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Copyright Section */}
      <section id="copyright" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Copyright Disclaimer</h2>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-8">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  All channels featured on LQR SPORT are publicly available from the internet. 
                  We do not host, own, or claim any rights over the content displayed. 
                  All content belongs to their respective owners and broadcasters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">+509 XXXX-XXXX</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">contact@lqrsport.ht</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">Port-au-Prince, Haiti</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-black fill-current" />
              </div>
              <div>
                <h3 className="font-bold">LQR SPORT</h3>
                <p className="text-xs text-muted-foreground">Haitian Media Hub</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 LQR SPORT. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by modern streaming technology
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
