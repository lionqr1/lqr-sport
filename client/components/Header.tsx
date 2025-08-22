import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Radio, Users, Newspaper, Copyright, Phone, Play } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "Haitian Streams", href: "#streams", icon: Play },
    { name: "Channels", href: "#channels", icon: Users },
    { name: "Radio", href: "#radio", icon: Radio },
    { name: "Updates", href: "#updates", icon: Newspaper },
    { name: "Copyright Notice", href: "#copyright", icon: Copyright },
    { name: "Contact", href: "#contact", icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">LQR SPORT</h1>
            <p className="text-xs text-muted-foreground">Haitian Media Hub</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-6">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-black fill-current" />
                </div>
                <div>
                  <h2 className="font-bold">LQR SPORT</h2>
                  <p className="text-xs text-muted-foreground">Haitian Media Hub</p>
                </div>
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
