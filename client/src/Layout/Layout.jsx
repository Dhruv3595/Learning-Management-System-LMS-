import PropTypes from "prop-types";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

export default function Layout({ children, hideNav, hideFooter }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-base-200 overflow-x-hidden">
      {/* ✅ Fixed Navbar in its own layer */}
      {!hideNav && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}

      {/* ✅ Main content with top padding equal to navbar height (80px) */}
      <main className={`flex-1 relative z-10 ${!hideNav ? "pt-20" : ""}`}>
        {children}
      </main>

      {/* ✅ Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  hideNav: PropTypes.bool,
  hideFooter: PropTypes.bool,
};
