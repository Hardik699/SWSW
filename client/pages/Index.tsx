import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import AppNav from "@/components/Navigation";

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [displayText, setDisplayText] = useState("");

  // Check authentication status
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");
    const lastUser = localStorage.getItem("lastAuthenticatedUser");

    setIsAuthenticated(!!auth);
    setUserRole(role || "");
    setCurrentUser(user || "");
  }, []);

  // Typing effect for welcome message
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const welcomeText = `Welcome Back, ${currentUser}!`;
    let index = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (index <= welcomeText.length) {
        setDisplayText(welcomeText.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isAuthenticated, currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Animated Grid Background */}
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml;utf8,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h60v60H0z" fill="none"/><path d="M0 0h60v1H0z" stroke="rgba(100,116,139,0.1)" stroke-width="1"/><path d="M0 0v60h1V0z" stroke="rgba(100,116,139,0.1)" stroke-width="1"/><circle cx="30" cy="30" r="1" fill="rgba(100,116,139,0.1)"/></svg>\')] opacity-30'
          }
        ></div>
      </div>

      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          {isAuthenticated && currentUser ? (
            // Welcome Section for Authenticated Users
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-spin" />
                  <span className="text-sm sm:text-lg text-blue-400 font-semibold">
                    Welcome
                  </span>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-spin" />
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent min-h-16 sm:min-h-20 flex items-center justify-center leading-tight">
                  {displayText}
                  {displayText.length <
                    `Welcome Back, ${currentUser}!`.length && (
                    <span className="ml-1 animate-pulse">|</span>
                  )}
                </h1>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  You're logged in as{" "}
                  <span className="text-blue-400 font-semibold">
                    {currentUser}
                  </span>
                  {userRole && (
                    <span className="block text-base text-slate-400 mt-2">
                      Role:{" "}
                      <span className="text-cyan-400 capitalize">
                        {userRole}
                      </span>
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  {userRole === "admin" && (
                    <Button
                      onClick={() => navigate("/admin")}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Admin Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {userRole === "hr" && (
                    <Button
                      onClick={() => navigate("/hr")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      HR Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {userRole === "it" && (
                    <Button
                      onClick={() => navigate("/it-dashboard")}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Users Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Original Content for Non-Authenticated Users
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                User Management
                <span className="block text-blue-400">System</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                A modern solution for user authentication and management.
                Secure, simple, and efficient.
              </p>
              <p className="text-slate-400 text-lg">
                Use the navigation above to login or contact an administrator
                for access.
              </p>
            </>
          )}
        </div>

        {/* Instructions - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="bg-slate-900/30 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Getting Started
              </h3>
              <div className="space-y-3 text-slate-400 max-w-3xl mx-auto">
                <p className="flex items-center justify-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>Click "Login" in the navigation above to sign in</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>
                    Default credentials: admin / 123, hr / 123, it / 123
                  </span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                  <span>
                    Contact an administrator to create your user account
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
