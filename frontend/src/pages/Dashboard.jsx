import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <>
      <div className="flex flex-wrap gap-6 justify-start">
        {/* Students */}
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104  transition-shadow">
          <Link to="/student_manage" className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                Students
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: 250</span>
          </div>
        </div>

        {/* Teachers */}
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104 transition-shadow">
          <Link to="/faculty_manage" className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                Teachers
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: 20</span>
          </div>
        </div>

        {/* Parents */}
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104 transition-shadow">
          <Link to="" className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                Parents
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: 250</span>
          </div>
        </div>

        {/* Class */}
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104 transition-shadow">
          <Link to="/class_manage" className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                Class
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: 10</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="w-[300px] h-[150px] bg-white shadow-lg rounded-lg hover:shadow-xl hover:scale-104 transition-shadow">
          <Link to="/subject_manage" className="block">
            <div className="text-center bg-blue-600 hover:bg-blue-500 rounded-t-lg py-4">
              <span className="text-xl font-semibold text-white">
                Subjects
              </span>
            </div>
          </Link>
          <div className="mt-4 text-center">
            <span className="text-gray-500">Total: 12</span>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
};

export default Dashboard;
