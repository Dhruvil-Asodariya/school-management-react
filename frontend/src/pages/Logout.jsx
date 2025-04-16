import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";


const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Call backend logout API (Adjust URL as per your backend)
        await axios.post("http://localhost:8081/logout", {}, { withCredentials: true });

        // Clear user session (Token or Auth Data)
        localStorage.removeItem("userToken");
        sessionStorage.removeItem("userSession");

        // Show success toast message
        toast.success("Logged out successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-gradient-to-r from-indigo-100 via-sky-100 to-purple-100">
    <motion.div
      className="p-10 bg-white shadow-2xl rounded-2xl text-center w-[420px] border border-blue-100"
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Glowing Ring Effect */}
      <motion.div
        className="relative flex items-center justify-center mx-auto mb-5"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="absolute w-20 h-20 rounded-full bg-blue-300 opacity-30 blur-xl z-0"></div>
        <div className="w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 rounded-full z-10 shadow-md">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>

      <motion.h2
        className="text-xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Logging out...
      </motion.h2>

      <motion.p
        className="text-gray-600"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Please wait while we safely log you out.
      </motion.p>
    </motion.div>
  </div>
  );
};

export default Logout;
