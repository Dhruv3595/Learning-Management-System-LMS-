import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  User,
  Users,
  X} from "lucide-react";
import { useEffect,useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { Link, useLocation,useNavigate } from "react-router-dom";

import { logout } from "../Redux/Slices/AuthSlice";

// eslint-disable-next-line react/prop-types
export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData } = useSelector((state) => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Auto-expand Course Management dropdown if on related pages
  useEffect(() => {
    const courseManagementPaths = ["/admin/courses", "/course/create", "/admin/select-course-for-lecture", "/course/addlecture"];
    if (courseManagementPaths.some(path => location.pathname.startsWith(path))) {
      setActiveDropdown(1); // Course Management is at index 1
    }
  }, [location.pathname]);

  const adminMenuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: location.pathname === "/admin/dashboard"
    },
    {
      name: "Course Management",
      icon: BookOpen,
      isActive: ["/admin/courses", "/course/create", "/admin/select-course-for-lecture", "/course/addlecture"].some(path => 
        location.pathname.startsWith(path)
      ),
      dropdown: [
        { name: "All Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Create Course", href: "/course/create", icon: Plus },
        { name: "Add Lecture", href: "/admin/select-course-for-lecture", icon: GraduationCap }
      ]
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      isActive: location.pathname === "/admin/users"
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      isActive: location.pathname === "/admin/analytics"
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      isActive: location.pathname === "/admin/payments"
    }
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    // Don't reset activeDropdown to maintain navigation state
  };

  const handleLinkClick = () => {
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Admin Header - Fixed Top Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex items-center justify-between px-4 lg:px-6 h-full">
          {/* Left side - Menu button and branding */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 lg:pl-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0 border border-gray-300"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X size={22} className="text-gray-700 font-bold" strokeWidth={2.5} />
              ) : (
                <Menu size={22} className="text-gray-700 font-bold" strokeWidth={2.5} />
              )}
            </button>
            
            <Link to="/admin/dashboard" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 truncate hidden sm:block">Admin Panel</h1>
            </Link>
          </div>

          {/* Right side - Quick actions and profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 sm:px-3 py-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                {userData?.avatar?.secure_url ? (
                  <img 
                    src={userData.avatar.secure_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{userData?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-screen pt-16">
        {/* Sidebar - Fixed Position - Hidden on small/medium, visible on large screens */}
        <aside className={`
          fixed top-16 left-0 bottom-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="flex flex-col h-full">
            {/* Navigation - Scrollable */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {adminMenuItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(index)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          item.isActive 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon size={20} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={`transform transition-transform duration-200 ${
                            activeDropdown === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {activeDropdown === index && (
                        <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {item.dropdown.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.href}
                              onClick={handleLinkClick}
                              className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                location.pathname === subItem.href
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <subItem.icon size={16} />
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        item.isActive 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick Actions - Fixed at Bottom */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Quick Actions</p>
              <div className="space-y-1">
                <Link
                  to="/course/create"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm"
                >
                  <Plus size={16} />
                  <span>New Course</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - No left margin on small/medium screens */}
        <main className="flex-1 w-full lg:ml-64 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

