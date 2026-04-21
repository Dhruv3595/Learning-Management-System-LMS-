import { useEffect } from "react";
import { useDispatch } from "react-redux";

import AnimatedRoutes from "./Components/AnimatedRoutes";
import { getUserData } from "./Redux/Slices/AuthSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) {
      dispatch(getUserData());
    }
  }, [dispatch]);

  // Prevent browser scroll restoration on page refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <>
      <AnimatedRoutes />
    </>
  );
}

export default App;
