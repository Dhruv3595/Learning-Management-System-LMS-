import { Loader2,Mail, MessageCircle, Send, User } from "lucide-react";
import React, { useEffect,useState } from "react";
import { toast } from "react-hot-toast";

import { axiosInstance } from "../Helpers/axiosInstance";
import { isEmail } from "../Helpers/regexMatcher";
import Layout from "../Layout/Layout";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setUserInput({
      ...userInput,
      [name]: value,
    });
  }

  async function onFormSubmit(e) {
    e.preventDefault();
    if (!userInput.email || !userInput.name || !userInput.message) {
      toast.error("All fields are mandatory");
      return;
    }

    if (!isEmail(userInput.email)) {
      toast.error("Invalid email");
      return;
    }

    setIsLoading(true);
    const loadingMessage = toast.loading("Sending message...");
    try {
      const res = await axiosInstance.post(
        "/contact",
        userInput
      );
      toast.success(res?.data?.message, { id: loadingMessage });
      setUserInput({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Message sending failed! Try again",
        { id: loadingMessage }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      {/* Premium LMS Gradient Background */}
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600">
        {/* Light Overlay for Better Readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Premium Abstract Shapes & Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/25 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-indigo-500/25 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

          {/* Medium floating shapes */}
          <div className="absolute top-1/3 right-1/5 w-64 h-64 bg-gradient-to-br from-yellow-400/15 to-orange-500/10 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-600/20 to-indigo-600/15 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-3000"></div>

          {/* Small accent shapes */}
          <div className="absolute top-16 right-16 w-32 h-32 bg-gradient-to-br from-pink-400/25 to-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-500"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-blue-500/15 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2500"></div>
        </div>

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 sm:px-6 lg:px-8">
          <div
            className={`w-full max-w-md sm:max-w-lg lg:max-w-xl transition-all ease-in-out duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Premium Glassmorphism Card */}
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 hover:shadow-3xl hover:shadow-yellow-400/10 transition-all ease-in-out duration-500 hover:-translate-y-2 hover:scale-[1.02] group">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent mb-4 animate-gradient-x drop-shadow-lg">
                  Get In Touch
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full animate-pulse shadow-lg shadow-yellow-400/30"></div>
                <p className="text-white/90 mt-4 text-sm sm:text-base leading-relaxed">
                  Have questions or feedback? We&apos;d love to hear from you!
                </p>
              </div>

              {/* Contact Form */}
              <form onSubmit={onFormSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-yellow-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-focus-within:text-yellow-400 transition-all ease-in-out duration-300" />
                    <input
                      type="text"
                      name="name"
                      value={userInput.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all ease-in-out duration-300 hover:bg-white/15 hover:border-white/30 focus:bg-white/15"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-yellow-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-focus-within:text-yellow-400 transition-all ease-in-out duration-300" />
                    <input
                      type="email"
                      name="email"
                      value={userInput.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all ease-in-out duration-300 hover:bg-white/15 hover:border-white/30 focus:bg-white/15"
                      required
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="group">
                  <label className="block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-yellow-300">
                    Message
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-4 text-white/60 h-5 w-5 group-focus-within:text-yellow-400 transition-all ease-in-out duration-300" />
                    <textarea
                      name="message"
                      value={userInput.message}
                      onChange={handleInputChange}
                      placeholder="Write your message here..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all ease-in-out duration-300 hover:bg-white/15 hover:border-white/30 focus:bg-white/15 resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Premium Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all ease-in-out duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2 group mt-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-gray-900" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Send Message</span>
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform ease-in-out duration-300" />
                    </>
                  )}
                </button>
              </form>

              {/* Premium Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 rounded-full animate-pulse opacity-80 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-pink-400/25 to-purple-500/20 rounded-full animate-bounce opacity-70 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>
              <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-indigo-400/20 to-purple-500/15 rounded-full animate-ping opacity-60 group-hover:opacity-100 transition-opacity ease-in-out duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
