import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const Change_Password = () => {
    const navigate = useNavigate();

    // Yup validation schema
    const validationSchema = Yup.object({
        currentPassword: Yup.string().required("Please enter your current password"),
        newPassword: Yup.string()
            .matches(/^\d{6}$/, "Password must be exactly 6 digits long")
            .required("Please enter a new password"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword")], "Passwords must match")
            .required("Please enter confirm password"),
    });

    // Formik form handling
    const formik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axios.post("http://localhost:8081/change_password", values, { withCredentials: true });

                Swal.fire({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => navigate("/dashboard"));
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.error || "Something went wrong",
                    icon: "error",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        },
    });

    return (
        <div className="flex justify-center items-center mt-3">
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-center">Change Password</h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium pb-2">Current Password</label>
                        <input 
                            type="password" 
                            name="currentPassword" 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("currentPassword")} 
                        />
                        {formik.touched.currentPassword && formik.errors.currentPassword && (
                            <span className="text-red-500 text-sm">{formik.errors.currentPassword}</span>
                        )}
                    </div>
                    <div>
                        <label className="block font-medium pb-2">New Password</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("newPassword")} 
                        />
                        {formik.touched.newPassword && formik.errors.newPassword && (
                            <span className="text-red-500 text-sm">{formik.errors.newPassword}</span>
                        )}
                    </div>
                    <div>
                        <label className="block font-medium pb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("confirmPassword")} 
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <span className="text-red-500 text-sm">{formik.errors.confirmPassword}</span>
                        )}
                    </div>
                    <div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200" type="submit">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Change_Password;
