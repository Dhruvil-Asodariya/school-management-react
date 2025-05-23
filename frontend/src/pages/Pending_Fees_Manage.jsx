import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Reg_Title from "../components/Reg_Title";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
Modal.setAppElement("#root");

const Pending_Fees_Manage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [selectedFee, setSelectedFee] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Fetch Fees Data
    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:8081/pending_fees", { withCredentials: true });
            console.log("✅ API Response:", res.data);
            setData(res.data);
        } catch (err) {
            console.error("❌ Error fetching fee data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (row) => {
        console.log("🟢 Opening Modal with:", row);

        const tuitionFee = row.tuition ? parseFloat(row.tuition) : 0;
        const examFee = row.exam ? parseFloat(row.exam) : 0;

        setSelectedFee({
            name: row.name || "N/A",
            email: row.email,
            phone_no: row.phone_no,
            tuition: isNaN(tuitionFee) ? "N/A" : tuitionFee,
            exam: isNaN(examFee) ? "N/A" : examFee,
            total: isNaN(tuitionFee) || isNaN(examFee) ? "N/A" : tuitionFee + examFee,
        });

        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedFee(null);
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = (error) => reject(error);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        await loadRazorpayScript();

        try {
            const res = await axios.post("http://localhost:8081/create_order", {
                amount: selectedFee.total * 100 // Amount in paise
            });

            const { order_id, currency } = res.data;

            const options = {
                key: "KEY_ID",
                amount: selectedFee.total * 100,
                currency: currency || "INR",
                name: "Easy Way School",
                description: `Fees Payment for ${selectedFee.name}`,
                order_id: order_id,
                handler: async function (response) {
                    console.log("🔵 Payment Success:", response);

                    try {
                        await axios.post("http://localhost:8081/verify_payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { withCredentials: true });
                        await fetchData();
                        Swal.fire({
                            title: "Payment Successful!",
                            text: "Your payment was received successfully.",
                            icon: "success",
                            timer: 1000,
                            showConfirmButton: true,
                            timerProgressBar: true,
                        }).then(() => {
                            navigate("/fees_manage");
                            closeModal();
                        });

                    } catch (err) {
                        console.error("❌ Payment Verification Error:", err);

                        Swal.fire({
                            title: "Payment Failed!",
                            text: "Payment verification failed. Please try again.",
                            icon: "error",
                        });
                    }
                },
                prefill: {
                    name: selectedFee.name,
                    email: selectedFee.email,
                    contact: selectedFee.phone_no
                },
                theme: {
                    color: "#3399cc"
                },
                method: {
                    upi: true,
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            console.error("❌ Payment Error:", err);

            Swal.fire({
                title: "Payment Failed!",
                text: "Something went wrong. Please try again.",
                timer: 1000,
                showConfirmButton: true,
                timerProgressBar: true,
                icon: "error",
            });
        }
    };

    const fees = data.map((fees, index) => ({
        id: fees.id,
        srNo: index + 1,
        name: fees.student_name,
        email: fees.email,
        phone: fees.phone_no,
        class: fees.class,
        tuition: fees.tuition_fee,
        exam: fees.exam_fee,
        status: fees.status,
    }));

    const columns = [
        { name: "Sr No.", selector: (row) => row.srNo, sortable: true },
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
        {
            name: "Action",
            cell: (row) => (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={() => openModal(row)}
                    disabled={row.status === 1} // Prevent payment button if already paid
                >
                    {row.status === 1 ? "Paid" : "Pay Now"}
                </button>
            ),
        },
    ];

    const filteredStudent = fees.filter((student) =>
        Object.values(student).some((value) =>
            value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
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

            {/* Payment Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="bg-white p-6 rounded-xl shadow-2xl w-96 mx-auto"
                overlayClassName="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center"
            >
                {selectedFee && (
                    <div className="text-gray-800">
                        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                            Confirm Payment
                        </h2>

                        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                            <p className="text-lg font-medium">
                                <strong>Student:</strong> {selectedFee.name}
                            </p>
                            <p className="text-md text-gray-600">
                                <strong>Tuition Fee:</strong> ₹{selectedFee.tuition !== "N/A" ? selectedFee.tuition.toLocaleString() : "N/A"}
                            </p>
                            <p className="text-md text-gray-600">
                                <strong>Exam Fee:</strong> ₹{selectedFee.exam !== "N/A" ? selectedFee.exam.toLocaleString() : "N/A"}
                            </p>

                            <p className="mt-4 text-lg font-bold text-gray-900 border-t pt-2">
                                Total: <span className="text-green-600">₹{selectedFee.total !== "N/A" ? selectedFee.total.toLocaleString() : "N/A"}</span>
                            </p>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                className="w-1/2 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-1/2 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition ml-2"
                                onClick={handlePayment}
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Pending_Fees_Manage;