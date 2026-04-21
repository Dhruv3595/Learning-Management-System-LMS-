import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { BsArrowUpRight, BsGraphUp,BsTrash } from "react-icons/bs";
import { FaChartLine, FaCrown, FaEye,FaGraduationCap, FaPlus, FaUsers } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc";
import { GiMoneyStack } from "react-icons/gi";
import { HiOutlineSparkles, HiOutlineTrendingUp } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../Layout/AdminLayout";
import { deleteCourse,getAllCourses } from "../../Redux/Slices/CourseSlice";
import { getPaymentRecord } from "../../Redux/Slices/RazorpaySlice";
import { getRevenueStats,getStatsData } from "../../Redux/Slices/StatSlice";
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allUsersCount, subscribedCount, totalRevenue } = useSelector((state) => state.stat);
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const monthlySalesRecord = [1, 3, 7, 8, 10, 0, 5]

  const userData = {
    labels: ["Total Users", "Premium Students"],
    datasets: [
      {
        label: "User Analytics",
        data: [allUsersCount || 0, subscribedCount || 0],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const salesData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlySalesRecord,
        backgroundColor: "rgba(139, 92, 246, 0.8)",
        borderColor: "rgb(139, 92, 246)",
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // const chartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: 'bottom',
  //       labels: {
  //         usePointStyle: true,
  //         padding: 20,
  //         font: {
  //           size: 12,
  //           weight: '500',
  //         },
  //       },
  //     },
  //   },
  // };

  const myCourses = useSelector((state) => 
    state.course.coursesData?.filter((course, index, self) => 
      index === self.findIndex(c => c._id === course._id)
    ) || []
  );

  async function onCourseDelete(id) {
    if (window.confirm("Are you sure you want to delete the course ? ")) {
      const res = await dispatch(deleteCourse(id));
      if (res?.payload?.success) {
        await dispatch(getAllCourses());
      }
    }
  }

  useEffect(() => {
    // Only make API calls if user is logged in and is admin
    if (!isLoggedIn || role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        await dispatch(getAllCourses());
        await dispatch(getStatsData());
        await dispatch(getRevenueStats()); // Get actual revenue data
        // Try to get payment records, but don't fail if it doesn't work
        try {
          await dispatch(getPaymentRecord());
        } catch (paymentError) {
          console.warn("Failed to load payment records:", paymentError);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    })();
  }, [dispatch, isLoggedIn, role, navigate]);

  // Show loading if not authenticated or data not loaded
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
      {/* Premium Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden w-full">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
                <FaCrown className="text-yellow-400 text-sm sm:text-base" />
                <span className="text-xs sm:text-sm font-medium">Administrator Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Premium Dashboard
              </h1>
              <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
                Monitor your learning platform with advanced analytics and insights
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-none mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 relative z-10">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Total Users Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-2xl">
                  <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <BsArrowUpRight className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {allUsersCount || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Total Users</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-green-500 font-medium">+12% this month</span>
              </div>
            </div>
          </div>

          {/* Premium Students Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-2xl">
                  <FaGraduationCap className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <HiOutlineTrendingUp className="text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {subscribedCount || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Premium Students</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-green-500 font-medium">+8% this month</span>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                  <GiMoneyStack className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <BsGraphUp className="text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ₹{(totalRevenue || 0).toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Total Revenue</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-1 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-green-500 font-medium">+25% this month</span>
              </div>
            </div>
          </div>

          {/* Courses Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-2xl">
                  <FaChartLine className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
                <HiOutlineSparkles className="text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {myCourses?.length || 0}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Total Courses</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-1 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-green-500 font-medium">+3 new courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* User Analytics Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">User Analytics</h3>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FaUsers className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-64 sm:h-72 lg:h-80 w-full">
              <Pie
                data={userData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: window.innerWidth < 640 ? 11 : 14,
                          weight: '500',
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Revenue Analytics Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <FcSalesPerformance className="text-xl sm:text-2xl" />
              </div>
            </div>
            <div className="h-64 sm:h-72 lg:h-80 w-full">
              <Bar
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)',
                      },
                      ticks: {
                        color: '#6B7280',
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#6B7280',
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Premium Course Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Course Management</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Manage your courses and educational content</p>
              </div>
              <button
                onClick={() => navigate("/course/create")}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <FaPlus className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Create New Course</span>
                <span className="sm:hidden">Create Course</span>
              </button>
            </div>
          </div>

          {/* Mobile-friendly course cards for small screens */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {myCourses?.map((course, idx) => (
                <div key={course._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaGraduationCap className="text-white text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {course?.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                        {course?.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          {course?.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {course?.numberOfLectures || 0} lectures
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => navigate("/admin/course/displaylectures", { state: { ...course } })}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 text-xs font-medium"
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                        <button
                          onClick={() => onCourseDelete(course?._id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 text-xs font-medium"
                        >
                          <BsTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="min-w-full">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200">#</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200 min-w-[200px]">Course</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200">Category</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200 min-w-[120px]">Instructor</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200">Lectures</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-200 min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {myCourses?.map((course, idx) => (
                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs lg:text-sm font-semibold">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                            <FaGraduationCap className="text-white text-sm lg:text-lg" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-xs lg:text-sm truncate max-w-[150px] lg:max-w-xs">
                              {course?.title}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-[150px] lg:max-w-xs">
                              {course?.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          {course?.category}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {course?.createdBy?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 font-medium truncate max-w-[80px] lg:max-w-none">
                            {course?.createdBy}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <span className="text-xs lg:text-sm font-bold text-blue-600 dark:text-blue-400">
                              {course?.numberOfLectures || 0}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">lectures</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <button
                            onClick={() => navigate("/admin/course/displaylectures", { state: { ...course } })}
                            className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg lg:rounded-xl hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 text-xs lg:text-sm font-medium"
                            title="View Lectures"
                          >
                            <FaEye className="text-xs" />
                            <span className="hidden lg:inline">View</span>
                          </button>
                          <button
                            onClick={() => onCourseDelete(course?._id)}
                            className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg lg:rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 text-xs lg:text-sm font-medium"
                            title="Delete Course"
                          >
                            <BsTrash className="text-xs" />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            
          {(!myCourses || myCourses.length === 0) && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-2xl sm:text-4xl text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No courses yet</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">Start by creating your first course</p>
              <button
                onClick={() => navigate("/course/create")}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaPlus className="text-xs sm:text-sm" />
                Create First Course
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
