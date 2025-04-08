import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiRefreshCw } from "react-icons/fi";

const OTP_Verify = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);
    const [countdown, setCountdown] = useState(60);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            toast.error("No email provided. Redirecting...", {autoClose: 500,} );
            setTimeout(() => navigate("/forgot_password"), 1000);
        }
    }, [location, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [countdown]);

    // 🔁 Auto-submit OTP when all 6 digits are filled
    useEffect(() => {
        const otpCode = otp.join("");
        if (otpCode.length === 6 && otp.every(d => d !== "")) {
            handleVerify(otpCode);
        }
    }, [otp]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        const newOtp = [...otp];

        if (value) {
            newOtp[index] = value;
            setOtp(newOtp);

            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtp = [...otp];
            if (newOtp[index]) {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                newOtp[index - 1] = "";
                setOtp(newOtp);
            }
        }
    };

    const handleVerify = async (otpCode) => {
        try {
            const res = await axios.post("http://localhost:8081/verify_otp", { email, otp: otpCode });
            toast.success(res.data.message, { autoClose: 500 });

            setTimeout(() => {
                navigate("/reset_password", { state: { email } });
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Verification failed.", { autoClose: 500 });
        }
    };

    const resendOtp = async () => {
        setResending(true);
        try {
            await axios.post("http://localhost:8081/forgot_password", { email });
            toast.success("OTP resent to your email.", {autoClose: 500,} );
            setCountdown(60);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch {
            toast.error("Failed to resend OTP.");
        }
        setResending(false);
    };

    const resetOtp = () => {
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
    };

    const formatTime = () => {
        const minutes = Math.floor(countdown / 60).toString().padStart(2, "0");
        const seconds = (countdown % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const showResend = countdown === 0 && !resending;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <ToastContainer position="top-center" />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                maxLength={1}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className="w-10 h-10 text-center border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Time remaining:</span>
                        <span className="font-medium text-red-600">{formatTime()}</span>
                        {showResend && (
                            <button
                                type="button"
                                onClick={resendOtp}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Resend OTP"
                            >
                                <FiRefreshCw
                                    className={`text-xl ${resending ? "animate-spin" : ""}`}
                                    size={15}
                                />
                            </button>
                        )}
                    </div>

                    <div className="w-full">
                        <button
                            type="button"
                            onClick={resetOtp}
                            className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTP_Verify;
