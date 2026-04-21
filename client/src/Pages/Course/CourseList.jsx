import React, { useCallback,useEffect, useState } from "react";
import { FaFilter, FaGraduationCap,FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import CourseCard from "../../Components/CourseCard";
import FloatingSearchPill from "../../Components/FloatingSearchPill";
import { getAllCourses } from "../../Redux/Slices/CourseSlice";

export default function CourseList() {
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
    <>
      {/* Floating Search Pill */}
      <FloatingSearchPill
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        showFilter={true}
        placeholder="Search courses..."
        anchorSelector="#course-search-anchor"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
                  <FaGraduationCap className="text-4xl text-white" />
                </div>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 xs:mb-6 leading-tight px-4 xs:px-0">
                Master New Skills with{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Expert-Led Courses
                </span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4 xs:px-0">
                Discover comprehensive courses crafted by industry professionals.
                Transform your career with cutting-edge knowledge and hands-on learning experiences.
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          </div>
        </section>

  {/* Search and Filter Section - Original */}
  <section id="course-search-anchor" className="py-8 xs:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl xs:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 xs:p-6 sm:p-8 mb-8 xs:mb-12">
              <div className="flex flex-col gap-4 xs:gap-6">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <FaSearch className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm xs:text-base" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 xs:pl-12 pr-4 py-3 xs:py-4 border border-gray-300 dark:border-gray-600 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm xs:text-base"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative w-full sm:w-auto">
                  <FaFilter className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm xs:text-base" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-48 pl-10 xs:pl-12 pr-4 py-3 xs:py-4 border border-gray-300 dark:border-gray-600 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200 text-sm xs:text-base"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-6 xs:mb-8 px-2 xs:px-0">
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 xs:mb-0">
                {selectedCategory === "All" ? "All Courses" : `${selectedCategory} Courses`}
                <span className="text-sm xs:text-lg font-normal text-gray-600 dark:text-gray-400 ml-2 block xs:inline">
                  ({filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'})
                </span>
              </h2>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-300 dark:bg-gray-700 animate-pulse" style={{ aspectRatio: '16/9' }}></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} data={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <FaGraduationCap className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    No courses found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
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
        </section>
      </div>
    </>
  );
}
