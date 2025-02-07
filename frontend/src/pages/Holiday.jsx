import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
// import { LuPlus } from "react-icons/lu";
import { FaCalendarDays } from "react-icons/fa6";
import Button from "../components/Button";

const Holiday = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // State to track selected month
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  return (
    <div className="p-6">
      {/* Add Holiday Button */}
      <Link to="/add_holiday" className="inline-block mb-4">
      <Button name="+ Add Holiday" />
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Months List */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold border-b pb-2">Months</h3>
          <ul className="mt-2 space-y-2">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(month)} // Set selected month on click
                className={`block w-full text-left px-4 py-2 rounded-md transition ${
                  selectedMonth === month ? "bg-blue-600 text-white hover:scale-102" : "bg-gray-100 hover:bg-gray-200 hover:scale-102"
                }`}
              >
                {month}
              </button>
            ))}
          </ul>
        </div>

        {/* Holiday Table */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-lg overflow-auto">
          {/* Dynamic Table Heading Based on Selected Month */}
          <div className="text-lg font-semibold border-b pb-2 flex items-center space-x-4">
            <FaCalendarDays className="w-5 h-5"/>
            <span>{selectedMonth}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full mt-2 border border-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Sr No.</th>
                  <th className="px-4 py-2 text-left">Holiday Name</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">Makarsankranti</td>
                  <td className="px-4 py-2">14-01-2025</td>
                  <td className="px-4 py-2 flex justify-center gap-4">
                    <Link to="#">
                      <button className="text-blue-600 hover:text-blue-700">
                        <FaEdit className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link to="#">
                      <button className="text-red-600 hover:text-red-700">
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
