import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout"; // ✅ Import AdminLayout
import Layout from "../Layout/Layout"; // ✅ Import Layout

// Pages
import AboutUs from "../Pages/About";
import AdminCourseDescription from "../Pages/Admin/AdminCourseDescription";
import AdminCourseList from "../Pages/Admin/AdminCourseList";
import Analytics from "../Pages/Admin/Analytics";
import PaymentManagement from "../Pages/Admin/PaymentManagement";
import SelectCourseForLecture from "../Pages/Admin/SelectCourseForLecture";
import UserManagement from "../Pages/Admin/UserManagement";
import Contact from "../Pages/Contact";
import CourseDescription from "../Pages/Course/CourseDescription";
import CourseList from "../Pages/Course/CourseList";
import CreateCourse from "../Pages/Course/CreateCourse";
import AddLecture from "../Pages/Dashboard/AddLecture";
import AdminDashboard from "../Pages/Dashboard/AdminDashboard";
import DisplayLecture from "../Pages/Dashboard/DisplayLecture";
import Denied from "../Pages/Denied";
import GoogleCallback from "../Pages/GoogleCallback";
import HomePage from "../Pages/HomePage";
import Login from "../Pages/Login";
import NotFound from "../Pages/NotFound";
import MyOrders from "../Pages/Orders/MyOrders";
import OrderDetails from "../Pages/Orders/OrderDetails";
import ChangePassword from "../Pages/Password/ChangePassword";
import ForgotPassword from "../Pages/Password/ForgotPassword";
import ResetPassword from "../Pages/Password/ResetPassword";
import Checkout from "../Pages/Payment/Checkout";
import CheckoutFail from "../Pages/Payment/CheckoutFail";
import CheckoutSuccess from "../Pages/Payment/CheckoutSuccess";
import Signup from "../Pages/Signup";
import MyCourses from "../Pages/User/MyCourses";
import Profile from "../Pages/User/Profile";
import RequireAuth from "./auth/RequireAuth";
import PageTransition from "./PageTransition";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="route-transition-container">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>

          {/* ✅ Public Pages wrapped in Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <PageTransition>
                  <HomePage />
                </PageTransition>
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <PageTransition>
                  <AboutUs />
                </PageTransition>
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <PageTransition>
                  <Contact />
                </PageTransition>
              </Layout>
            }
          />
          <Route
            path="/courses/description"
            element={
              <Layout>
                <PageTransition>
                  <CourseDescription />
                </PageTransition>
              </Layout>
            }
          />
          <Route
            path="/courses"
            element={
              <Layout>
                <PageTransition>
                  <CourseList />
                </PageTransition>
              </Layout>
            }
          />
          <Route
            path="/denied"
            element={
              <Layout hideNav={false}>
                <PageTransition>
                  <Denied />
                </PageTransition>
              </Layout>
            }
          />

          {/* ✅ Auth & Special Pages (no layout) */}
          <Route
            path="/auth/google/callback"
            element={
              <PageTransition>
                <GoogleCallback />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <Signup />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/user/profile/reset-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/user/profile/reset-password/:resetToken"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />

          {/* ✅ Protected Routes wrapped in Layout */}
          <Route element={<RequireAuth allowedRoles={["USER", "ADMIN"]} />}>
            <Route
              path="/my-courses"
              element={
                <Layout>
                  <PageTransition>
                    <MyCourses />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <PageTransition>
                    <MyOrders />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <Layout>
                  <PageTransition>
                    <OrderDetails />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/course/displaylectures"
              element={
                <Layout>
                  <PageTransition>
                    <DisplayLecture />
                  </PageTransition>
                </Layout>
              }
            />
          </Route>

          {/* ✅ Admin Routes - No Layout wrapper (pages handle their own AdminLayout) */}
          <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin/courses"
              element={
                <PageTransition>
                  <AdminCourseList />
                </PageTransition>
              }
            />
            <Route
              path="/admin/courses/description"
              element={
                <PageTransition>
                  <AdminCourseDescription />
                </PageTransition>
              }
            />
            <Route
              path="/admin/course/displaylectures"
              element={
                <AdminLayout>
                  <PageTransition>
                    <DisplayLecture />
                  </PageTransition>
                </AdminLayout>
              }
            />
            <Route
              path="/admin/select-course-for-lecture"
              element={
                <PageTransition>
                  <SelectCourseForLecture />
                </PageTransition>
              }
            />
            <Route
              path="/course/create"
              element={
                <PageTransition>
                  <CreateCourse />
                </PageTransition>
              }
            />
            <Route
              path="/course/addlecture"
              element={
                <PageTransition>
                  <AddLecture />
                </PageTransition>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PageTransition>
                  <UserManagement />
                </PageTransition>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <PageTransition>
                  <PaymentManagement />
                </PageTransition>
              }
            />
          </Route>

          {/* ✅ User Protected Routes */}
          <Route element={<RequireAuth allowedRoles={["USER", "ADMIN"]} />}>
            <Route
              path="/user/profile"
              element={
                <Layout>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/user/profile/change-password"
              element={
                <Layout>
                  <PageTransition>
                    <ChangePassword />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/checkout"
              element={
                <Layout hideNav hideFooter>
                  <PageTransition>
                    <Checkout />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/checkout/success"
              element={
                <Layout hideNav hideFooter>
                  <PageTransition>
                    <CheckoutSuccess />
                  </PageTransition>
                </Layout>
              }
            />
            <Route
              path="/checkout/fail"
              element={
                <Layout hideNav hideFooter>
                  <PageTransition>
                    <CheckoutFail />
                  </PageTransition>
                </Layout>
              }
            />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <PageTransition>
                  <NotFound />
                </PageTransition>
              </Layout>
            }
          />

        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default AnimatedRoutes;
