import { useCallback,useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBook,
  FaCertificate,
  FaCheck,
  FaClock,
  FaCrown,
  FaInfinity,
  FaPlay,
  FaShoppingCart,
  FaSpinner,
  FaStar,
  FaUser,
  FaUsers,
  FaVideo} from "react-icons/fa";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineSparkles} from "react-icons/hi";
import { useDispatch,useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { checkCourseAccess } from "../../Redux/Slices/AuthSlice";

export default function CourseDescription() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { role, isLoggedIn } = useSelector((state) => state.auth);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

    // Memoize the access check function to prevent unnecessary re-renders
  const checkAccess = useCallback(async () => {
    if (!state) {
      console.error("No course state available");
      setLoading(false);
      return;
    }
    
    if (!state._id) {
      console.error("No course ID available in state");
      setLoading(false);
      return;
    }
    
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }    try {
      setLoading(true);
      const response = await dispatch(checkCourseAccess(state._id));
      if (response.payload) {
        setHasAccess(response.payload.hasAccess);
        setAccessType(response.payload.accessType);
      }
    } catch (error) {
      console.error("Error checking course access:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [state, dispatch, isLoggedIn]);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!state) {
      navigate("/courses");
      return;
    }

    if (role === "ADMIN") {
      // Admin has access to all courses
      setHasAccess(true);
      setAccessType("admin");
      setLoading(false);
    } else if (isLoggedIn) {
      checkAccess();
    } else {
      setLoading(false);
    }
  }, [state, navigate, role, isLoggedIn, checkAccess]);

  // Handle course purchase with Razorpay
  const handlePurchase = async () => {
    if (purchasing) return; // Prevent multiple clicks
    
    try {
      setPurchasing(true);
      const loadingToast = toast.loading("Loading payment gateway...");
      
      // Get Razorpay key
      const keyResponse = await fetch('http://localhost:5001/api/v1/payments/razorpay-key', {
        credentials: 'include'
      });
      const keyData = await keyResponse.json();
      
      if (!keyData.success) {
        toast.error("Failed to load payment gateway", { id: loadingToast });
        return;
      }

      // Log the courseId for debugging
      console.log("Course ID being sent:", state._id, typeof state._id);
      
      // Create order for individual course
      const orderResponse = await fetch('http://localhost:5001/api/v1/payments/course-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: typeof state._id === 'object' && state._id !== null ? state._id.toString() : state._id
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        toast.error(orderData.message || "Failed to create order", { id: loadingToast });
        return;
      }

      toast.dismiss(loadingToast);

      // Configure Razorpay options
      const options = {
        key: keyData.key,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LMS Course Purchase",
        description: `Purchase: ${state.title}`,
        image: state?.thumbnail ? `http://localhost:5001${state.thumbnail}` : undefined,
        handler: async function (response) {
          try {
            const verifyToast = toast.loading("Verifying payment...");
            
            // Verify payment and create enrollment
            const verifyResponse = await fetch('http://localhost:5001/api/v1/payments/purchase-course', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                courseId: state._id,
                paymentDetails: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              toast.success("Course purchased successfully!", { id: verifyToast });
              // Refresh access check
              await checkAccess();
            } else {
              toast.error(verifyData.message || "Payment verification failed", { id: verifyToast });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Please try again.");
      });

    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };
  return (
    <Layout>
      {/* Hero Section with Course Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10 lg:py-12 z-10">
          {/* Back to All Courses Button */}
          <div className="flex items-center gap-2 xs:gap-4 mb-4 xs:mb-6 relative z-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔥 Back to All Courses button clicked!");
                console.log("📍 Current location:", window.location.pathname);
                try {
                  navigate("/courses");
                  console.log("✅ Navigation to /courses attempted");
                } catch (error) {
                  console.error("❌ Navigation error:", error);
                  // Fallback to direct navigation
                  window.location.href = "/courses";
                }
              }}
              className="group inline-flex items-center gap-2 px-3 xs:px-6 py-2 xs:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 hover:border-white/30 cursor-pointer relative z-50 pointer-events-auto text-sm xs:text-base"
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              <FaArrowLeft className="text-sm xs:text-lg group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold hidden xs:inline">Back to All Courses</span>
              <span className="font-semibold xs:hidden">Back</span>
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 items-center">
            {/* Course Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 xs:px-4 py-1 xs:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-3 xs:mb-4">
                <FaCrown className="text-yellow-400 text-sm xs:text-base" />
                <span className="text-white font-medium text-xs xs:text-sm">Premium Course</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 xs:mb-4 leading-tight">
                {state?.title}
              </h1>
              <p className="text-base xs:text-lg text-blue-100 mb-3 xs:mb-4 leading-relaxed">
                {state?.description?.slice(0, 150)}...
              </p>
              
              {/* Course Stats */}
              <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 xs:gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-300" />
                  <span className="font-medium">{state?.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBook className="text-green-300" />
                  <span className="font-medium">{state?.numberOfLectures || 0} Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-purple-300" />
                  <span className="font-medium">1000+ Students</span>
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="relative mt-4 lg:mt-0">
              <div className="relative rounded-xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 aspect-video bg-gray-200 dark:bg-gray-700">
                <img
                  className="w-full h-full object-cover object-center"
                  alt="Course thumbnail"
                  src={state?.thumbnail ? `http://localhost:5001${state.thumbnail}` : '/placeholder-course.jpg'}
                  onError={(e) => {
                    console.error('Thumbnail failed to load:', state?.thumbnail);
                    e.target.src = '/placeholder-course.jpg';
                  }}
                />
                {state?.video?.secure_url && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 transform hover:scale-110">
                      <FaPlay className="text-white text-xl ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 py-8 xs:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 xs:gap-8">
            
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-6 xs:space-y-8">
              
              {/* Course Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl xs:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 xs:p-6 sm:p-8">
                <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                  <div className="p-2 xs:p-3 bg-blue-100 dark:bg-blue-900 rounded-xl xs:rounded-2xl">
                    <FaBook className="text-lg xs:text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Course Description</h2>
                    <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300">What you&apos;ll learn</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {state?.description}
                </p>
              </div>

              {/* Course Preview Video */}
              {state?.video?.secure_url && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-2xl">
                      <FaVideo className="text-2xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Course Preview</h3>
                      <p className="text-gray-600 dark:text-gray-300">Get a glimpse of what&apos;s inside</p>
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden">
                    <video
                      className="w-full h-64 lg:h-80 object-cover"
                      controls
                      poster={state?.thumbnail ? `http://localhost:5001${state.thumbnail}` : '/placeholder-course.jpg'}
                    >
                      <source src={state.video.secure_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Course Features */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-2xl">
                    <HiOutlineSparkles className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What&apos;s Included</h3>
                    <p className="text-gray-600 dark:text-gray-300">Premium course features</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  <div className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg xs:rounded-xl">
                    <FaInfinity className="text-emerald-500 text-lg xs:text-xl" />
                    <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg xs:rounded-xl">
                    <FaCertificate className="text-blue-500 text-lg xs:text-xl" />
                    <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg xs:rounded-xl">
                    <FaVideo className="text-purple-500 text-lg xs:text-xl" />
                    <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">HD Videos</span>
                  </div>
                  <div className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg xs:rounded-xl">
                    <FaUsers className="text-orange-500 text-lg xs:text-xl" />
                    <span className="font-semibold text-gray-800 dark:text-white text-sm xs:text-base">Community Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  
                  {/* Price Section */}
                  <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800/50 dark:to-purple-800/50 rounded-full mb-4">
                        <FaCrown className="text-yellow-500" />
                        <span className="font-semibold text-gray-800 dark:text-white">Premium Course</span>
                      </div>
                      <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                        ₹{state?.price}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">One-time payment</p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Instructor</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{state?.createdBy}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaBook className="text-emerald-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Lectures</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{state?.numberOfLectures || 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-purple-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Duration</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">Self-paced</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HiOutlineBadgeCheck className="text-orange-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Certificate</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">Included</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-6">
                    {loading ? (
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white text-xl rounded-xl font-bold px-6 py-4 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <FaSpinner className="animate-spin" />
                        Checking access...
                      </button>
                    ) : role === "ADMIN" || hasAccess ? (
                      <button
                        onClick={() =>
                          navigate("/course/displaylectures", { state: { ...state } })
                        }
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl rounded-xl font-bold px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <FaPlay />
                        {accessType === "admin" ? "View Lectures (Admin)" : "Watch Lectures"}
                      </button>
                    ) : (
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className={`w-full text-white text-xl rounded-xl font-bold px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                          purchasing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                        }`}
                      >
                        {purchasing ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaShoppingCart />
                            Purchase Course
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Money Back Guarantee */}
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                        <FaCheck className="text-green-500" />
                        30-day money-back guarantee
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full">
                      <HiOutlineAcademicCap className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Instructor</h3>
                      <p className="text-gray-600 dark:text-gray-300">Expert educator</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{state?.createdBy}</h4>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                      <span className="ml-2 text-gray-600 dark:text-gray-400">(4.9)</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Professional instructor with years of experience in the field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
