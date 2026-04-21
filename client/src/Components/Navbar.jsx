import {
  BookOpen,
  Home,
  Info,
  LogIn,
  LogOut,
  Mail,
  Menu,
  ShoppingBag,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../Redux/Slices/AuthSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { isLoggedIn, data: userData, role } = useSelector((state) => state.auth);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "All Courses", href: "/courses", icon: BookOpen },
    { name: "My Courses", href: "/my-courses", icon: BookOpen, authOnly: true },
    { name: "My Orders", href: "/orders", icon: ShoppingBag, authOnly: true },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact Us", href: "/contact", icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMobileMenuOpen(false);
    window.location.href = "/";
  };

  const handleLinkClick = () => setIsMobileMenuOpen(false);
  
  // Filter links based on auth status and role
  const filteredLinks = role === "ADMIN" 
    ? navigationLinks.filter((link) => link.name === "All Courses") // Only show All Courses for admins
    : navigationLinks.filter((link) => link.authOnly ? isLoggedIn : true);

  return (
    <>
      {/* ✅ Fixed Navbar - stays at top */}
      <nav
        className="main-navbar fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-300"
        style={{
          transform: "none",
        }}
      >
        <div
          className={`transition-colors duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md shadow-lg"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isScrolled
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                      : "bg-white/20"
                  }`}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-xl font-bold ${
                    isScrolled ? "text-gray-900" : "text-white"
                  }`}
                >
                  LMS Pro
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {filteredLinks.map((link) => {
                  const IconComponent = link.icon;
                  // For admins, redirect All Courses to admin courses page
                  const href = role === "ADMIN" && link.name === "All Courses" ? "/admin/courses" : link.href;
                  return (
                    <Link
                      key={link.name}
                      to={href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        isScrolled
                          ? "text-gray-700 hover:bg-gray-100"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      to="/user/profile"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        isScrolled
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {userData?.fullName?.split(" ")[0]}
                      </span>
                    </Link>

                    {role === "ADMIN" && (
                      <Link
                        to="/admin/dashboard"
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          isScrolled
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isScrolled
                          ? "text-red-600 hover:bg-red-50"
                          : "text-white hover:bg-white/20"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      to="/login"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                        isScrolled
                          ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                          : "border-white/30 text-white hover:bg-white/20"
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:shadow-lg transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`md:hidden p-2 rounded-lg ${
                    isScrolled
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[9998] md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-20 left-4 right-4 bottom-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-8 opacity-0"
          }`}
        >
          <div className="h-full flex flex-col p-6 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              {filteredLinks.map((link) => {
                const IconComponent = link.icon;
                // For admins, redirect All Courses to admin courses page
                const href = role === "ADMIN" && link.name === "All Courses" ? "/admin/courses" : link.href;
                return (
                  <Link
                    key={link.name}
                    to={href}
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/user/profile"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl"
                  >
                    {userData?.avatar?.secure_url ? (
                      <img
                        src={userData.avatar.secure_url}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {userData?.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{userData?.email}</p>
                    </div>
                  </Link>

                  {role === "ADMIN" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={handleLinkClick}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium"
                    >
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      handleLinkClick();
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
