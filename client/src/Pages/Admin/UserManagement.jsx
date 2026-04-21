import { Calendar, Eye, Mail, Search,Shield, Trash2, Users } from "lucide-react";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import FloatingSearchPill from "../../Components/FloatingSearchPill";
import AdminLayout from "../../Layout/AdminLayout";
import { deleteUser,getAllUsers } from "../../Redux/Slices/AdminSlice";

export default function UserManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const { users, loading } = useSelector((state) => state.admin || { users: [], loading: false });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [hasFetched, setHasFetched] = useState(false);

  // Scroll to top on component mount/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoggedIn || role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    
    // Fetch users data only once
    if (!hasFetched) {
      dispatch(getAllUsers());
      setHasFetched(true);
    }
  }, [dispatch, isLoggedIn, role, navigate, hasFetched]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await dispatch(deleteUser(userId));
      dispatch(getAllUsers()); // Refresh the list
    }
  };

  // Filter users based on search and role
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!isLoggedIn || role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Floating Search Pill */}
      <FloatingSearchPill
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={filterRole}
        onCategoryChange={setFilterRole}
        categories={["ALL", "USER", "ADMIN"]}
        showFilter={true}
        placeholder="Search users by name or email..."
        buttonText="Search Users"
        anchorSelector="#admin-users-search-anchor"
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all registered users in the system</p>
        </div>

  {/* Filters and Search */}
  <div id="admin-users-search-anchor" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="md:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 font-medium text-gray-700">
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Joined</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterRole !== "ALL" 
                        ? "Try adjusting your search or filter criteria."
                        : "No users have registered yet."
                      }
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* User Info */}
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500">ID: {user._id?.slice(-6)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-span-3">
                          <div className="flex items-center">
                            <Mail size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            <Shield size={12} className="mr-1" />
                            {user.role}
                          </span>
                        </div>

                        {/* Join Date */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Statistics Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.role === 'USER').length}
              </div>
              <div className="text-sm text-gray-600">Regular Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-gray-600">Administrators</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}