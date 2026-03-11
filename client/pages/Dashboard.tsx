import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, ArrowRight, ServerCog, ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 self-start"
              title="Go back to previous page"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Dashboard
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1 sm:mt-2">
                Overview and quick actions
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors duration-300 flex-shrink-0">
                  <ServerCog className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                </div>
                <Button
                  onClick={() => navigate("/it-dashboard")}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm py-1 sm:py-2"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
                </Button>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Users
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">
                  User accounts and credentials management
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-green-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300 flex-shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <Button
                  onClick={() => navigate("/system-info")}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm py-1 sm:py-2"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
                </Button>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Hardware
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">
                  Hardware assets and inventory
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors duration-300 flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                </div>
                <Button
                  onClick={() => navigate("/pc-laptop-info")}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm py-1 sm:py-2"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
                </Button>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  Systems
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">
                  Track and manage system assets
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300 flex-shrink-0">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <Button
                  onClick={() => navigate("/hr")}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm py-1 sm:py-2"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
                </Button>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  HR
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm group-hover:text-slate-300 transition-colors duration-300">
                  Employee management and HR operations
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
