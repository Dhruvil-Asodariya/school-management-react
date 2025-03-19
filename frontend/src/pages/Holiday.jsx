import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaCalendarDays } from "react-icons/fa6";
import Button from "../components/Button";
import axios from "axios";
import Swal from "sweetalert2";

const Holiday = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ✅ Get current month dynamically
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [holidays, setHolidays] = useState([]);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ holiday_name: "", holiday_date: "" });

  // ✅ Fetch holidays based on selected month
  useEffect(() => {
    axios.get(`http://localhost:8081/holiday/${selectedMonth}`)
      .then((response) => setHolidays(response.data))
      .catch(() => {
        Swal.fire({
          title: "Error!",
          text: "Failed to fetch holidays.",
          icon: "error",
          confirmButtonText: "OK"
        });
      });
  }, [selectedMonth]);

  // ✅ Open Edit Modal
  const openEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setEditForm({
      holiday_name: holiday.holiday_name,
      holiday_date: holiday.holiday_date.split("T")[0], // Format date properly
    });
    setEditModalOpen(true);
  };

  // ✅ Handle input changes in edit form
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ✅ Update Holiday
  const updateHoliday = () => {
    if (!editingHoliday || !editingHoliday.holiday_id) {
      console.error("Holiday ID is missing");
      return;
    }

    axios.put(`http://localhost:8081/holiday/${editingHoliday.holiday_id}`, editForm)
      .then(() => {
        setHolidays(holidays.map(holiday =>
          holiday.holiday_id === editingHoliday.holiday_id ? { ...holiday, ...editForm } : holiday
        ));
        setEditModalOpen(false);
        Swal.fire({
          title: "Success!",
          text: "Holiday updated successfully.",
          icon: "success",
          timer: 1000,
          confirmButtonText: "OK"
        });
      })
      .catch(() => {
        Swal.fire({
          title: "Error!",
          text: "Failed to update holiday.",
          icon: "error",
          timer: 1000,
          confirmButtonText: "OK"
        });
      });
  };

  // ✅ Delete Holiday
  const deleteHoliday = (holidayId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This holiday will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:8081/holiday/${holidayId}`)
          .then(() => {
            setHolidays(holidays.filter(holiday => holiday.holiday_id !== holidayId));
            Swal.fire({
              title: "Deleted!",
              text: "Holiday has been deleted.",
              icon: "success",
              timer: 1000, // 1-second timer
              showConfirmButton: false
            });
          })
          .catch(() => {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete holiday.",
              icon: "error",
              timer: 1000, // 1-second timer
              showConfirmButton: false
            });
          });
      }
    });
  };

  return (
    <div className="p-6 bg-gray-100">
      <Link to="/add_holiday" className="inline-block mb-4">
        <Button name="+ Add Holiday" />
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ Sidebar - Select Month */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold border-b pb-2">Months</h3>
          <ul className="mt-2 space-y-2">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(index + 1)}
                className={`block w-full text-left px-4 py-2 rounded-md transition ${selectedMonth === index + 1 ? "bg-blue-600 text-white hover:scale-102" : "bg-gray-100 hover:bg-gray-200 hover:scale-102"
                  }`}
              >
                {month}
              </button>
            ))}
          </ul>
        </div>

        {/* ✅ Holiday Table */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-lg overflow-auto">
          <div className="text-lg font-semibold border-b pb-2 flex items-center space-x-4">
            <FaCalendarDays className="w-5 h-5" />
            <span>{months[selectedMonth - 1]}</span>
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
                {holidays.length > 0 ? (
                  holidays.map((holiday, index) => (
                    <tr key={holiday.holiday_id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{holiday.holiday_name}</td>
                      <td className="px-4 py-2">{new Date(holiday.holiday_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 flex justify-center gap-4">
                        <button onClick={() => openEditModal(holiday)} className="text-blue-600 hover:text-blue-700">
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteHoliday(holiday.holiday_id)} className="text-red-600 hover:text-red-700">
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No holidays found for {months[selectedMonth - 1]}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Edit Holiday Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Holiday</h2>
            <input type="text" name="holiday_name" value={editForm.holiday_name} onChange={handleEditChange} className="w-full border rounded px-3 py-2 mb-3" />
            <input type="date" name="holiday_date" value={editForm.holiday_date} onChange={handleEditChange} className="w-full border rounded px-3 py-2 mb-3" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={updateHoliday} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday;
