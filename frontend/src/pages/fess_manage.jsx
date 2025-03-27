import { useState } from "react";
import DataTable from "react-data-table-component";
import Reg_Title from "../components/Reg_Title";

const StudentManagementSystem = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [students] = useState([
        {
            name: "John Doe",
            email: "johndoe@gmail.com",
            phone: "+91 98765 43210",
            class: "Class 10",
            amount: "₹5000",
            status: "Paid",
        },
        {
            name: "Jane Smith",
            email: "janesmith@gmail.com",
            phone: "+91 98765 43211",
            class: "Class 7",
            amount: "₹4500",
            status: "Pending",
        },
    ]);

    // Define Columns
    const columns = [
        {
            name: "Sr No.",
            selector: (row, index) => index+1,
            sortable: true,
        },
        {
            name: "Student Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.email,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
        },
        {
            name: "Class",
            selector: (row) => row.class,
        },
        {
            name: "Amount (₹)",
            selector: (row) => row.amount,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.status,
            cell: (row) => (
                <span className={`font-bold ${row.status === "Paid" ? "text-green-500" : "text-red-500"}`}>
                    {row.status === "Paid" ? "✅ Paid" : "❌ Pending"}
                </span>
            ),
            sortable: true,
        },
    ];

    const filteredStudent = students.filter((faculty) =>
        Object.values(faculty).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    return (
        <div className="bg-gray-100 min-h-screen text-gray-800 p-8">
            <Reg_Title name="All Fee List" />

            <div className="mb-6 flex justify-between items-center">
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
                    data={filteredStudent}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                />
            </div>
        </div>
    );
};

export default StudentManagementSystem;
