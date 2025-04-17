import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Button from "../components/Button";
import Reg_Title from "../components/Reg_Title";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const PrincipalManage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [editPrincipal, setEditPrincipal] = useState(null); // ✅ Holds the selected student for editing

    // Fetch Students
    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:8081/principal");
            setData(res.data);
        } catch (err) {
            console.error("Error fetching Principal:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✅ Open Edit Modal
    const handleEditClick = (principal) => {
        setEditPrincipal(principal);
    };

    // ✅ Handle Form Submission for Editing
    const handleUpdatePrincipal = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8081/principal/${editPrincipal.principal_id}`, editPrincipal);
            Swal.fire({
                title: "Updated!",
                text: "Principal details have been updated.",
                icon: "success",
                timer: 1000, // 1-second timer
                showConfirmButton: false,
                timerProgressBar: true
            });
            fetchData();
            setEditPrincipal(null);
        } catch (error) {
            console.error("Error updating principal:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to update principal details.",
                icon: "error",
                timer: 1000, // 1-second timer
                showConfirmButton: false,
                timerProgressBar: true
            });
        }
    };

    //Delete Student
    const handleDeleteClick = async (principalId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            timer: 1000,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8081/principal/${principalId}`);
                Swal.fire("Deleted!", "The principal has been deleted.", "success");
                fetchData();
            } catch (error) {
                console.error("Error deleting principal:", error);
                Swal.fire("Error!", "Failed to delete the principal.", "error");
            }
        }
    };

    const principal = data.map((principal) => ({
        id: principal.principal_id,
        profile: principal.image,
        firstName: principal.first_name,
        lastName: principal.last_name,
        email: principal.email,
        gender: principal.gender,
        dob: principal.date_of_birth,
        phone_number: principal.phone_no,
        address: principal.address,
    }));

    const columns = [
        { name: "Profile", selector: (row) => <img src={row.profile} className="w-10 h-10 rounded-full" alt="Profile" />, sortable: false },
        { name: "Roll No", selector: (row, index) => index + 1, sortable: true },
        { name: "First Name", selector: (row) => row.firstName, sortable: true },
        { name: "Last Name", selector: (row) => row.lastName, sortable: true },
        { name: "Email", selector: (row) => row.email, sortable: true },
        { name: "Gender", selector: (row) => row.gender, sortable: true },
        { name: "Mobile", selector: (row) => row.phone_number, sortable: true },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex space-x-3">
                    <button onClick={() => handleEditClick(row)} className="text-blue-600 hover:text-blue-800">
                        <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 hover:text-red-800">
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const filteredPrincipal = principal.filter((faculty) =>
        Object.values(faculty).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-6 bg-gray-100">
            <Reg_Title name="All Principals List" />

            <div className="mb-6 flex justify-between items-center">
                <Link to="/add_principal">
                    <Button name="+ Add Principal" />
                </Link>
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-4 py-2 border rounded focus:ring focus:ring-blue-300 focus:outline-sky-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredPrincipal}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                />
            </div>

            {editPrincipal && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Edit Principal</h2>
                        <form onSubmit={handleUpdatePrincipal}>
                            {/* First Name */}
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                placeholder="First Name"
                                value={editPrincipal.firstName}
                                onChange={(e) => setEditPrincipal({ ...editPrincipal, firstName: e.target.value })}
                            />

                            {/* Last Name */}
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Last Name"
                                value={editPrincipal.lastName}
                                onChange={(e) => setEditPrincipal({ ...editPrincipal, lastName: e.target.value })}
                            />

                            {/* Phone Number */}
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Phone Number"
                                value={editPrincipal.phone_number}
                                onChange={(e) => setEditPrincipal({ ...editPrincipal, phone_number: e.target.value })}
                            />

                            {/* Address */}
                            <textarea
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Address"
                                value={editPrincipal.address}
                                onChange={(e) => setEditPrincipal({ ...editPrincipal, address: e.target.value })}
                            ></textarea>

                            {/* Gender */}
                            <select
                                className="w-full p-2 border rounded mb-2"
                                value={editPrincipal.gender}
                                onChange={(e) => setEditPrincipal({ ...editPrincipal, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-4">
                                <button type="button" onClick={() => setEditPrincipal(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrincipalManage;