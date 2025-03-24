import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate(); // Hook for navigating back

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-2">Oops! Page not found.</p>

      {/* Full-width Back Button */}
      <button
        onClick={() => navigate(-1)} // Go back to the previous page
        className="mt-6 flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 w-64 rounded-full shadow-md hover:bg-blue-600 transition-all"
      >
        <FaArrowLeft className="text-lg" />
        <span>Go Back</span>
      </button>
    </div>
  );
};

export default NotFound;
