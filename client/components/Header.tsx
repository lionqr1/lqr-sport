import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Radio, Users, Newspaper, Copyright, Phone, Play, Settings, Heart } from "lucide-react";

interface HeaderProps {
  onSectionChange: (section: string) => void;
  currentSection: string;
}

export default function Header({ onSectionChange, currentSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'streams', name: "Haitian Streams", icon: Play },
    { id: 'channels', name: "Channels", icon: Users },
    { id: 'matches', name: "Matches", icon: Trophy },
    { id: 'radio', name: "Radio", icon: Radio },
    { id: 'updates', name: "Updates", icon: Newspaper },
    { id: 'settings', name: "Settings", icon: Settings },
    { id: 'copyright', name: "Copyright Notice", icon: Copyright },
    { id: 'contact', name: "Contact", icon: Phone },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-black border-b border-gray-800">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Menu Button and Logo */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-gray-800"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
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
          </div>

          {/* Menu indicator for desktop */}
          <div className="hidden md:block text-sm text-gray-300">
            Menu
          </div>
        </div>
      </header>

      {/* Left Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
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
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentSection === item.id
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
          
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
