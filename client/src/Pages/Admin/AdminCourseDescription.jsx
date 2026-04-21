import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  PlayCircle,
  Plus,
  Eye
} from "lucide-react";

import AdminLayout from "../../Layout/AdminLayout";

export default function AdminCourseDescription() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { role, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn || role !== "ADMIN") {
      navigate("/");
    }
  }, [isLoggedIn, role, navigate]);

  useEffect(() => {
    if (!state) {
      navigate("/admin/courses");
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                {state.category}
              </div>
              <h1 className="text-3xl font-bold mb-4">{state.title}</h1>
              <p className="text-blue-100 mb-6">{state.description}</p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{state.numberOfLectures} Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>8h 30m Duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Created by {state.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>₹{state.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/course/displaylectures", { state })}
            className="flex items-center justify-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">View Lectures</h3>
              <p className="text-sm text-gray-600">See all course content</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/course/addlecture", { state })}
            className="flex items-center justify-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Add Lecture</h3>
              <p className="text-sm text-gray-600">Create new lecture</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/course/create", { state })}
            className="flex items-center justify-center gap-3 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <PlayCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Edit Course</h3>
              <p className="text-sm text-gray-600">Update course details</p>
            </div>
          </button>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
              <p className="text-gray-600">{state.category}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Number of Lectures</h3>
              <p className="text-gray-600">{state.numberOfLectures}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Created By</h3>
              <p className="text-gray-600">{state.createdBy}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Price</h3>
              <p className="text-gray-600">₹{state.price}</p>
            </div>
          </div>
        </div>

        {/* Course Description */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Course</h2>
          <p className="text-gray-600 leading-relaxed">{state.description}</p>
        </div>
      </div>
    </AdminLayout>
  );
}
