import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            toast.error("Email missing. Redirecting...");
            setTimeout(() => navigate("/forgot_password"), 500);
        }
    }, [location, navigate]);

    const validatePassword = (value) => {
        if (!/^\d{6}$/.test(value)) {
            return "PIN must be exactly 6 digits.";
        }
        return "";
    };

    const validateConfirmPassword = (value) => {
        if (value !== password) {
            return "PINs do not match.";
        }
        return "";
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setPassword(value);
        setErrors((prev) => ({
            ...prev,
            password: validatePassword(value),
            confirmPassword: validateConfirmPassword(confirmPassword)
        }));
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setConfirmPassword(value);
        setErrors((prev) => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value)
        }));
    };

    const handleReset = async () => {
        if (errors.password || errors.confirmPassword) {
            toast.error("Please fix errors before submitting.", { autoClose: 500 });
            return;
        }
    
        try {
            const res = await axios.post("http://localhost:8081/reset_password", {
                password: password,  // or just `password` in ES6 shorthand
            }, {
                withCredentials: true
            });
    
            toast.success(res.data.message, { autoClose: 500 });
            setTimeout(() => navigate("/"), 500);
        } catch (err) {
            toast.error(err.response?.data?.error, { autoClose: 500 });
        }
    };
    


    const isFormValid =
        password.length === 6 &&
        confirmPassword.length === 6 &&
        !errors.password &&
        !errors.confirmPassword;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <ToastContainer position="top-center" />
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
                <div className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit PIN"
                            value={password}
                            onChange={handlePasswordChange}
                            className={`w-full px-4 py-2 border rounded focus:outline-none ${errors.password
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Confirm 6-digit PIN"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={`w-full px-4 py-2 border rounded focus:outline-none ${errors.confirmPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                                }`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        onClick={handleReset}
                        disabled={!isFormValid}
                        className={`w-full py-2 rounded transition ${isFormValid
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        Reset PIN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
