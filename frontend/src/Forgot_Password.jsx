import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Forgot_Password = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:8081/forgot_password", { email }, {withCredentials: true} );

            toast.success(res.data.message || "OTP sent successfully!", {autoClose: 1000,} );
            setEmail(""); // clear input if needed
            setTimeout(() => {
                navigate("/verify_otp", { state: { email } });
            }, 1500); // 1.5 seconds
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                toast.error(err.response.data.error, {autoClose: 500,} ); // backend error
            } else {
                toast.error("Server error. Please try again later.", {autoClose: 500,} );
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <ToastContainer position="top-center" />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        placeholder="Enter your email"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Send OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Forgot_Password;
