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
    { name: "Contact", href: "mailto:kinglionqr@gmail.com", icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Mobile First */}
        <div className="flex items-center space-x-3">
          <img 
            src="https://i.ibb.co/CsB7SJp0/best.png" 
            alt="LQR SPORT" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-white">LQR SPORT</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Haitian Media Hub</p>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-gray-900 border-gray-800">
            <div className="flex flex-col space-y-1 mt-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-800">
                <img 
                  src="https://i.ibb.co/CsB7SJp0/best.png" 
                  alt="LQR SPORT" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h2 className="font-bold text-white">LQR SPORT</h2>
                  <p className="text-xs text-gray-400">Haitian Media Hub</p>
                </div>
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors py-3 px-2 rounded-md"
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
