import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoading: boolean;
  text?: string;
}

export default function LoadingScreen({ isLoading, text = "Loading..." }: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-red-900/20"></div>
      
      {/* Pulsing Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-600/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-600/10 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-yellow-600/10 rounded-full animate-ping animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Container with Glow Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-orange-600/30 blur-xl rounded-full animate-pulse"></div>
          <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <img 
              src="https://i.ibb.co/CsB7SJp0/best.png" 
              alt="LQR SPORT" 
              className="w-20 h-20 object-contain filter brightness-110"
            />
          </div>
        </div>

        {/* Logo Text with Gradient */}
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-4 animate-pulse">
          LQR SPORT
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeIn">
          Haitian Media Hub
        </p>

        {/* Loading Text with Animated Dots */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce animation-delay-400"></div>
        </div>
        
        <p className="text-lg text-gray-400 mt-4 font-medium">
          {text}{dots}
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-600 to-red-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
