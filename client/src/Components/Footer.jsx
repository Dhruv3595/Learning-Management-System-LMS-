import React, { useEffect, useRef, useState } from "react";
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

export default function Footer() {
  const curDate = new Date();
  const year = curDate.getFullYear();
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentFooter = footerRef.current;
    if (currentFooter) {
      observer.observe(currentFooter);
    }

    return () => {
      if (currentFooter) {
        observer.unobserve(currentFooter);
      }
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-indigo-400/30 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* About Us */}
            <div className={`space-y-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h3 className="text-xl font-bold text-white mb-4 relative">
                About Us
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
                We provide high-quality online courses to help you upgrade your
                skills and reach your goals, anytime, anywhere.
              </p>
            </div>

            {/* Quick Links */}
            <div className={`space-y-4 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h3 className="text-xl font-bold text-white mb-4 relative">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/" 
                    className="text-gray-300 hover:text-white transition-all duration-300 text-sm lg:text-base relative group inline-block"
                  >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/courses" 
                    className="text-gray-300 hover:text-white transition-all duration-300 text-sm lg:text-base relative group inline-block"
                  >
                    Courses
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    className="text-gray-300 hover:text-white transition-all duration-300 text-sm lg:text-base relative group inline-block"
                  >
                    About
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    className="text-gray-300 hover:text-white transition-all duration-300 text-sm lg:text-base relative group inline-block"
                  >
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className={`space-y-4 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h3 className="text-xl font-bold text-white mb-4 relative">
                Contact Us
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-2 text-sm lg:text-base">
                  <span className="text-indigo-400">📧</span>
                  <span>Email: support@elearning.com</span>
                </li>
                <li className="flex items-center space-x-2 text-sm lg:text-base">
                  <span className="text-indigo-400">📞</span>
                  <span>Phone: +123 456 7890</span>
                </li>
                <li className="flex items-center space-x-2 text-sm lg:text-base">
                  <span className="text-indigo-400">📍</span>
                  <span>Address: 123 Learning Lane, Knowledge City</span>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className={`space-y-4 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h3 className="text-xl font-bold text-white mb-4 relative">
                Follow Us
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
              </h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="group relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <BsFacebook className="text-xl text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/20 group-hover:to-blue-600/20 rounded-full transition-all duration-300"></div>
                </a>
                <a 
                  href="#" 
                  className="group relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <BsTwitter className="text-xl text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-600/0 group-hover:from-sky-500/20 group-hover:to-sky-600/20 rounded-full transition-all duration-300"></div>
                </a>
                <a 
                  href="#" 
                  className="group relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <BsLinkedin className="text-xl text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-700/0 group-hover:from-blue-600/20 group-hover:to-blue-700/20 rounded-full transition-all duration-300"></div>
                </a>
                <a 
                  href="#" 
                  className="group relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <BsInstagram className="text-xl text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-600/0 group-hover:from-pink-500/20 group-hover:to-purple-600/20 rounded-full transition-all duration-300"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className={`text-center transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="text-gray-400 text-sm lg:text-base font-medium">
                ©️ {year} E-Learning Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
