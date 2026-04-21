import { useCallback,useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { FaFilter, FaGraduationCap,FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import AdminCourseCard from "../../Components/AdminCourseCard";
import AdminLayout from "../../Layout/AdminLayout";
import { getAllCourses } from "../../Redux/Slices/CourseSlice";

export default function AdminCourseList() {
  const dispatch = useDispatch();
  const { coursesData } = useSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    await dispatch(getAllCourses());
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    // Scroll to top on component mount/refresh
    window.scrollTo(0, 0);
    fetchCourses();
  }, [fetchCourses]);

  // Get unique categories
  const categories = ["All", ...new Set(coursesData?.map(course => course.category) || [])];

  // Filter courses based on search and category, and remove duplicates
  const filteredCourses = coursesData
    ?.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    // Remove duplicates based on _id
    ?.filter((course, index, self) => 
      index === self.findIndex(c => c._id === course._id)
    ) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              All Courses
            </h1>
            <p className="text-gray-600 mt-1">Manage and view all courses</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full sm:w-64">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 appearance-none cursor-pointer transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === "All" ? "All Courses" : `${selectedCategory} Courses`}
            <span className="text-base font-normal text-gray-600 ml-2">
              ({filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'})
            </span>
          </h2>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gray-300 animate-pulse" style={{ aspectRatio: '16/9' }}></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <AdminCourseCard key={course._id} data={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <FaGraduationCap className="text-6xl text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "No courses are available at the moment."}
              </p>
              {(searchTerm || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
