import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isLoading: boolean;
  text?: string;
}

export default function LoadingScreen({ isLoading, text = "Loading..." }: LoadingScreenProps) {
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 35);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-red-600/15 to-yellow-600/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-full blur-2xl animate-float"></div>
        
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-4">
        {/* Logo Container with Advanced Animation */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-40 h-40 mx-auto">
            <div className="w-full h-full border-2 border-orange-600/30 rounded-full animate-spin-slow"></div>
          </div>
          
          {/* Middle pulse ring */}
          <div className="absolute inset-4 w-32 h-32 mx-auto">
            <div className="w-full h-full border border-red-500/50 rounded-full animate-pulse-ring"></div>
          </div>
          
          {/* Logo container */}
          <div className="relative w-40 h-40 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-yellow-500 rounded-full animate-pulse-glow"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img 
                src="https://i.ibb.co/CsB7SJp0/best.png" 
                alt="LQR SPORT" 
                className="w-24 h-24 object-contain filter brightness-110 drop-shadow-lg animate-float-subtle"
              />
            </div>
          </div>
        </div>

        {/* Brand Text with Gradient Animation */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-red-500 via-yellow-500 to-orange-400 bg-clip-text text-transparent animate-gradient-x">
            LQR SPORT
          </h1>
          
          <div className="flex items-center justify-center space-x-2 text-xl md:text-2xl text-gray-300 mb-6">
            <span className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Haitian</span>
            <span className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>Media</span>
            <span className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>Hub</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          {/* Bouncing Dots */}
          <div className="flex items-center justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce-sequence"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* Loading Text */}
          <div className="text-lg text-gray-300 font-medium">
            <span className="animate-fade-in">{text}</span>
            <span className="text-orange-400 font-bold animate-pulse">{dots}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-80 max-w-full mx-auto">
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-full transition-all duration-100 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Initializing</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Status Messages */}
          <div className="text-sm text-gray-400 animate-fade-in-delayed">
            {progress < 30 && "Starting engines..."}
            {progress >= 30 && progress < 60 && "Loading content..."}
            {progress >= 60 && progress < 90 && "Preparing interface..."}
            {progress >= 90 && "Almost ready!"}
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
          75% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(-5deg); }
          50% { transform: translateY(-25px) rotate(-10deg); }
          75% { transform: translateY(-10px) rotate(-5deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 146, 60, 0.8), 0 0 60px rgba(239, 68, 68, 0.4); }
        }
        
        @keyframes bounce-sequence {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-8px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          70% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-subtle { animation: float-subtle 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-bounce-sequence { animation: bounce-sequence 1.4s ease-in-out infinite both; }
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 3s ease infinite; 
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-delayed { animation: fade-in-delayed 3s ease-out; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
