import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import AppNav from "@/components/Navigation";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });
  const [successDialog, setSuccessDialog] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", result.data.role);
        localStorage.setItem("currentUser", result.data.username);

        // Show success dialog
        setSuccessDialog(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        // Determine specific error message
        if (!username || !password) {
          setErrorDialog({
            isOpen: true,
            message: "Please enter both username and password to continue.",
          });
        } else {
          setErrorDialog({
            isOpen: true,
            message:
              result.error || "Invalid username or password. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorDialog({
        isOpen: true,
        message: "A network error occurred. Please try again later.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Login Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Login Card */}
        <div className="relative w-full max-w-md">
          <div className="glass-dark rounded-2xl p-8 shadow-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 hover:bg-slate-800/60 group">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 transition-all duration-300 group-hover:bg-blue-500/30 group-hover:border-blue-400/50 group-hover:scale-110">
                <div className="w-6 h-6 bg-blue-500 rounded-full transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-lg group-hover:shadow-blue-400/50"></div>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-400 text-sm">
                Please enter your details to sign in
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-slate-300 text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 h-12 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 h-12 rounded-xl pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 group/checkbox">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-all duration-300 hover:border-slate-500 hover:bg-slate-700/30"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-slate-400 cursor-pointer transition-colors duration-300 group-hover/checkbox:text-slate-300"
                >
                  Remember me
                </Label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 group hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isLoading ? "Signing in..." : "Sign in"}</span>
                {!isLoading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setErrorDialog({ isOpen: false, message: "" });
            }
          }}
        >
          <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-red-500/30 text-white">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <DialogTitle className="text-xl">Login Failed</DialogTitle>
              </div>
              <DialogDescription className="text-slate-400 mt-4">
                {errorDialog.message}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-200 flex items-start space-x-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    Default credentials are available if you need to test
                  </span>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setErrorDialog({ isOpen: false, message: "" })}
                className="bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-green-500/30 text-white">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 animate-pulse">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <DialogTitle className="text-xl">Welcome back!</DialogTitle>
              </div>
              <DialogDescription className="text-slate-400 mt-4">
                You're being redirected to your dashboard...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-200 flex items-center space-x-2">
                  <span>✓</span>
                  <span>Login successful</span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
