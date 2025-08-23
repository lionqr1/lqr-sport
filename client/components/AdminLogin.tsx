import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Shield } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === "lionqr") {
      onLogin();
    } else {
      setError("Invalid password. Access denied.");
      setPassword("");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,165,0,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <img 
                src="https://i.ibb.co/CsB7SJp0/best.png" 
                alt="LQR SPORT" 
                className="w-10 h-10 object-contain"
              />
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Admin Access
              </CardTitle>
              <p className="text-gray-400">LQR SPORT Management Panel</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-orange-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure Area</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Administrator Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <div className="border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-500">
                  Unauthorized access is prohibited
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  All activities are logged and monitored
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            LQR SPORT Administrative Interface • Secure Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
