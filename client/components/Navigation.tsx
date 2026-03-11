import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings,
  LogOut,
  User,
  Menu,
  LogIn,
  Building2,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");

    setIsAuthenticated(!!auth);
    setUserRole(role || "");
    setCurrentUser(user || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserRole("");
    setCurrentUser("");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleHRDashboard = () => {
    navigate("/hr");
  };

  const handleMainDashboard = () => {
    navigate("/deshbord");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Brand - Infoseum */}
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-300 group"
              onClick={() => navigate("/")}
            >
              {/* Infoseum Cyan Dot */}
              <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse opacity-75 group-hover:opacity-100"></div>
                <div className="absolute inset-1 bg-cyan-500 rounded-full"></div>
              </div>
              {/* Infoseum Text */}
              <div className="hidden xs:block">
                <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight">
                  <span className="text-cyan-400">Infoseum</span>
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Admin Options - Show both dashboards */}
                  {userRole === "admin" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMainDashboard}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        IT Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleHRDashboard}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        HR Dashboard
                      </Button>
                    </>
                  )}

                  {/* IT User Options - Show only IT Dashboard */}
                  {userRole === "it" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMainDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      IT Dashboard
                    </Button>
                  )}

                  {/* HR User Options - Show only HR Dashboard */}
                  {userRole === "hr" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHRDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      HR Dashboard
                    </Button>
                  )}

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {currentUser}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-slate-800 border-slate-700 text-white"
                      align="end"
                    >
                      <DropdownMenuItem
                        key="profile"
                        className="focus:bg-slate-700 cursor-pointer"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        key="settings"
                        className="focus:bg-slate-700 cursor-pointer"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        key="change-password"
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="focus:bg-blue-700 cursor-pointer text-blue-400 focus:text-white"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator
                        key="separator"
                        className="bg-slate-700"
                      />
                      <DropdownMenuItem
                        key="logout"
                        onClick={handleLogout}
                        className="focus:bg-red-600 cursor-pointer text-red-400 focus:text-white"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                /* Login Button for non-authenticated users */
                <Button
                  onClick={handleLogin}
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 text-white">
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      {isAuthenticated ? `${currentUser}` : "Menu"}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-4">
                    {isAuthenticated ? (
                      <>
                        {/* Admin Mobile Options - Show both dashboards */}
                        {userRole === "admin" && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={() => {
                                handleMainDashboard();
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <LayoutDashboard className="h-4 w-4 mr-2" />
                              IT Dashboard
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={() => {
                                handleHRDashboard();
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <Building2 className="h-4 w-4 mr-2" />
                              HR Dashboard
                            </Button>
                          </>
                        )}

                        {/* IT User Mobile Options - Show only IT Dashboard */}
                        {userRole === "it" && (
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleMainDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            IT Dashboard
                          </Button>
                        )}

                        {/* HR User Mobile Options - Show only HR Dashboard */}
                        {userRole === "hr" && (
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleHRDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            HR Dashboard
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start border-blue-600 text-blue-400 hover:bg-blue-700 hover:text-white"
                          onClick={() => {
                            setIsChangePasswordOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          handleLogin();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        currentUser={currentUser}
      />
    </>
  );
}
