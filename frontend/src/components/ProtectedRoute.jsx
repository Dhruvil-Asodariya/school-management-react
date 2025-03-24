import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";

const ProtectedRoute = ({ element, allowedRoles, userRole }) => {
  const navigate = useNavigate(); // Hook for navigating back

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <MdLockOutline className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            You do not have permission to view this page.
          </p>

          {/* Full-Width Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3 w-full rounded-full shadow-md hover:bg-red-600 transition-all"
          >
            <FaArrowLeft className="text-lg" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return element; // Render the page if authorized
};

export default ProtectedRoute;
