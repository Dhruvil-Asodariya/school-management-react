import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Reg_Title from "../components/Reg_Title";
import axios from "axios";

const Fees_Manage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);

    // Fetch Fees Data
    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:8081/fees", { withCredentials: true });
            console.log("✅ API Response:", res.data); // Debugging log
            setData(res.data);
        } catch (err) {
            console.error("❌ Error fetching fee data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Debugging: Check if data is received
    console.log("✅ Data in State:", data);

    const fees = data.map((fees) => ({
        name: fees.student_name,
        email: fees.email,
        phone: fees.phone_no,
        class: fees.class,
        tuition: fees.tuition_fee, // Fixed typo
        exam: fees.exam_fee,
        status: fees.status,
    }));

    // Define Columns
    const columns = [
        { name: "Sr No.", selector: (row, index) => index + 1, sortable: true },
        { name: "Student Name", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email },
        { name: "Phone", selector: (row) => row.phone },
        { name: "Class", selector: (row) => row.class },
        { name: "Tuition Fee (₹)", selector: (row) => row.tuition, sortable: true },
        { name: "Exam Fee (₹)", selector: (row) => row.exam },
        {
            name: "Status",
            selector: (row) => row.status,
            cell: (row) => (
                <span className={`font-bold ${row.status === 1 ? "text-green-500" : "text-red-500"}`}>
                    {row.status === 1 ? "✅ Paid" : "❌ Pending"}
                </span>
            ),
            sortable: true,
        },
    ];

    const filteredStudent = fees.filter((student) =>
        Object.values(student).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="bg-gray-100 text-gray-800 p-8">
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

export default Fees_Manage;
