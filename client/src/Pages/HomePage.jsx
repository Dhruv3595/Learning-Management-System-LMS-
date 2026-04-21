import { ArrowRight, Award, BookOpen, Sparkles,Users } from "lucide-react";
import { useEffect,useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import heroPng from "../assets/images/hero.png";
import Layout from "../Layout/Layout";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { role, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    // Redirect admin to dashboard
    if (isLoggedIn && role === "ADMIN") {
      navigate("/admin/dashboard");
      return;
    }
    setIsVisible(true);
  }, [isLoggedIn, role, navigate]);

  return (
    <Layout>
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] overflow-x-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600">
        {/* Light Overlay for Better Readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Premium Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/18 to-pink-500/12 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/15 to-indigo-500/18 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

          {/* Medium floating shapes */}
          <div className="absolute top-1/3 right-1/5 w-64 h-64 bg-gradient-to-br from-yellow-400/12 to-orange-500/8 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-600/15 to-indigo-600/10 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-3000"></div>

          {/* Geometric elements */}
          <div className="absolute top-20 right-20 w-32 h-32 border border-white/10 rotate-45 animate-float"></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 border border-yellow-400/20 rotate-12 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-orange-400/15 to-pink-500/10 rounded-full animate-pulse"></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 lg:gap-16 px-6 lg:px-16 py-12 lg:py-20 min-h-[90vh]">
          {/* Left Content */}
          <div className={`lg:w-1/2 w-full space-y-8 transition-all ease-in-out duration-1000 transform ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            {/* Premium Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-white drop-shadow-lg">Find out best</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent animate-gradient-x font-black drop-shadow-lg">
                  Online Courses
                </span>
              </h1>

              {/* Animated underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg shadow-yellow-400/30"></div>
            </div>

            {/* Premium Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-2xl drop-shadow-md">
              We have a large library of courses taught by highly skilled and qualified faculties at a very affordable cost.
            </p>

            {/* Premium Stats */}
            <div className="flex flex-wrap gap-6 py-4">
              <div className="flex items-center space-x-2 text-gray-200">
                <BookOpen className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">1000+ Courses</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-200">
                <Users className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">50K+ Students</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-200">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">Expert Instructors</span>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/courses">
                <button className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all ease-in-out duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 opacity-0 group-hover:opacity-100 transition-all ease-in-out duration-300"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Explore Courses</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform ease-in-out duration-300" />
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform ease-in-out duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </button>
              </Link>

              <Link to="/contact">
                <button className="group relative border-2 border-white/30 hover:border-yellow-400/60 text-white hover:text-yellow-300 font-semibold px-8 py-4 rounded-xl transition-all ease-in-out duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10">
                  <span className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform ease-in-out duration-300" />
                    <span>Contact Us</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className={`lg:w-1/2 w-full flex items-center justify-center transition-all ease-in-out duration-1000 delay-300 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <div className="relative group">
              {/* Floating card container */}
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl hover:shadow-yellow-400/10 transition-all ease-in-out duration-500 hover:-translate-y-2 animate-float">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-500/5 rounded-3xl"></div>

                {/* Main illustration */}
                <div className="relative z-10 transform group-hover:scale-105 transition-transform ease-in-out duration-500">
                  <img
                    alt="LMS Learning Platform"
                    src={heroPng}
                    className="w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto drop-shadow-2xl"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 rounded-full animate-pulse opacity-80 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-pink-400/25 to-purple-500/20 rounded-full animate-bounce opacity-70 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-indigo-400/20 to-purple-500/15 rounded-full animate-ping opacity-60 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>

                {/* Floating particles */}
                <div className="absolute top-1/4 -left-8 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute bottom-1/3 -right-6 w-2 h-2 bg-orange-400 rounded-full animate-pulse opacity-70"></div>
                <div className="absolute top-1/2 right-8 w-4 h-4 bg-pink-400 rounded-full animate-float opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
