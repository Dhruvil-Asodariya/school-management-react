import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { jsPDF } from "jspdf";
import { toWords } from 'number-to-words';
import { FiDownload } from 'react-icons/fi';

const Fees_Manage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [logoImg, setLogoImg] = useState("");

    useEffect(() => {
        fetchData();
        loadLogo();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:8081/fees", { withCredentials: true });
            setData(res.data);
        } catch (error) {
            console.error("Error fetching fee data:", error);
        }
    };

    const loadLogo = () => {
        setLogoImg("public/Logo/1.png");
    };

    const fees = data.map((item) => ({
        name: item.student_name,
        email: item.email,
        phone: item.phone_no,
        class: item.class,
        tuition: item.tuition_fee,
        exam: item.exam_fee,
        status: item.status,
        uid: item.uid,
        program: "BACHELOR OF TECHNOLOGY IN COMPUTER ENGINEERING",
        semester: "Sem-VI",
    }));

    const columns = [
        { name: "Sr No.", selector: (row, index) => index + 1 },
        { name: "Student Name", selector: (row) => row.name },
        { name: "Email", selector: (row) => row.email },
        { name: "Phone", selector: (row) => row.phone },
        { name: "Class", selector: (row) => row.class },
        {
            name: "Status", selector: (row) => (
                <span className={`font-bold ${row.status === 1 ? "text-green-500" : "text-red-500"}`}>
                    {row.status === 1 ? "✅ Paid" : "❌ Pending"}
                </span>)
        },
        {
            name: "Invoice",
            cell: (row) =>
                row.status === 1 ? ( // ✅ Only show if Paid
                    <button
                        className="text-blue-500 hover:text-white bg-transparent hover:bg-blue-500 border border-blue-500 px-2 py-1 rounded-md transition-all duration-300 ease-in-out"
                        onClick={() => generateInvoice(row)}
                    >
                        <FiDownload size={20} />
                    </button>
                ) : (
                    <span className="text-gray-400">N/A</span> // or you can just return `null` if you want it completely blank
                ),
        }
    ];

    const filteredStudent = fees.filter((student) =>
        Object.values(student).some((val) =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const generateInvoice = (student) => {
        const doc = new jsPDF("p", "mm", "a4");

        // Draw Logo
        if (logoImg) {
            doc.addImage(logoImg, "JPEG", 15, 5, 30, 30);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Easyway School", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text("Gadhpur Road, At, Kathodara, Surat, Gujarat 394326", 105, 26, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(10, 40, 200, 40);

        // Invoice Details
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Receipt No: ${Math.floor(Math.random() * 90000) + 10000}`, 15, 48);
        const formattedDate = new Date().toLocaleDateString('en-GB');  // This gives DD/MM/YYYY
        doc.text(`Date: ${formattedDate}`, 140, 48);
        const currentDate = new Date();
        let academicYearStart = currentDate.getFullYear(); // Start with the current year
        let academicYearEnd = academicYearStart + 1; // End year will be the next year

        // Adjust if current month is before August (the academic year starts in August)
        if (currentDate.getMonth() < 7) { // Months are 0-indexed (0 = January, 7 = August)
            academicYearStart -= 1;
            academicYearEnd -= 1;
        }

        const academicYear = `${academicYearStart}-${academicYearEnd}`;
        doc.text(`Academic Year: ${academicYear}`, 15, 54);

        doc.line(10, 60, 200, 60);

        // Student Info
        doc.setFont("helvetica", "bold");
        doc.text(`MR. / MS. :`, 15, 68);
        doc.setFont("helvetica", "normal");
        doc.text(`${student.name}`, 50, 68);

        doc.setFont("helvetica", "bold");
        doc.text(`Class :`, 15, 80);
        doc.setFont("helvetica", "normal");
        doc.text(`${student.class}`, 50, 80);

        doc.line(10, 85, 200, 85);

        // Fee Details Table
        doc.setFont("helvetica", "bold");
        doc.text("Sr. No.", 20, 93);
        doc.text("Particulars", 60, 93);
        doc.text("Amount", 160, 93);

        doc.line(10, 96, 200, 96);

        doc.setFont("helvetica", "normal");
        doc.text("1", 20, 102);
        doc.text("TUITION FEES", 60, 102);
        doc.text(`${Number(student.tuition).toFixed(2)}`, 160, 102);

        doc.setFont("helvetica", "normal");
        doc.text("2", 20, 108);
        doc.text("EXAM FEES", 60, 108);
        doc.text(`${Number(student.exam).toFixed(2)}`, 160, 108);

        doc.line(10, 112, 200, 112);

        doc.setFont("helvetica", "bold");
        doc.text("Total", 60, 118);
        const totalFees = (Number(student.tuition) + Number(student.exam)).toFixed(2);
        doc.text(`${totalFees}`, 160, 118);

        // Payment Details
        doc.setFont("helvetica", "normal");
        doc.text("(In Words) :", 15, 126);
        doc.setFont("helvetica", "bold");

        const feeInWords = toWords(totalFees);  // Convert the total fee to words
        doc.text(`${feeInWords.toUpperCase()} ONLY`, 45, 126);

        doc.setFont("helvetica", "normal");
        doc.text("By Cash / Online :", 15, 134);
        doc.text("ONLINE PAYMENT", 70, 134);

        doc.line(10, 146, 200, 146);

        // Notes
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Please Note :", 15, 152);
        doc.setFont("helvetica", "normal");
        const notes = [
            "1. Fees paid through cheque/demand draft are subject to clearing.",
            "2. If the cheque/draft is dishonored by the bank due to any reason, a penalty will be charged.",
            "3. The fee paid is NON-TRANSFERABLE / NON-REFUNDABLE (Subject to management decision).",
            "4. This is a system generated report and does not require a signature.",
            "5. Subject to Rajkot Jurisdiction.",
        ];
        notes.forEach((note, index) => {
            doc.text(note, 15, 160 + (index * 5));
        });

        // Footer
        doc.setFontSize(8);
        doc.text("This is an electronically generated receipt. hence does not require a signature", 105, 185, { align: "center" });

        doc.save(`${student.name}_Invoice.pdf`);
    };

    return (
        <div className="p-8 bg-gray-100">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-4 py-2 rounded mb-4 focus:outline-sky-500"
            />

            <DataTable
                columns={columns}
                data={filteredStudent}
                pagination
                highlightOnHover
                striped
            />
        </div>
    );
};

export default Fees_Manage;
