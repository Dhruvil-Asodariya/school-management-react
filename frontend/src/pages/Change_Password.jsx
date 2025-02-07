import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const Change_Password = () => {
    const navigate = useNavigate();

    // Yup validation schema
    const validationSchema = Yup.object({
        currentPassword: Yup.string().required("Please enter Current Password"),
        newPassword: Yup.string().matches(
            /^(?=[A-Z\d]{8}$)(?=.*[A-Z])(?=.*\d)[A-Z\d]*$/,
            "Password must be exactly 8 characters long, contain only one uppercase letter, and include only digits"
        ).required("Please enter New password"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], "Passwords must match to the New password")
            .required("Please enter Confirm Password"),
    });

    // Formik form handling
    const formik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: () => {
            Swal.fire({
                title: "Success!",
                text: "Password changed successfully",
                icon: "success",
                timer: 1000,
                showConfirmButton: true,
                timerProgressBar: true,
            }).then(() => navigate("/dashboard"));
        },
    });

    return (
        <div className="flex justify-center items-center mt-3">
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full">
                <h2 className="text-xl font-semibold mb-4 text-center">Change Password</h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium pb-3">Current Password</label>
                        <input 
                            type="password" 
                            name="currentPassword" 
                            className="w-full px-3 py-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("currentPassword")} 
                        />
                        {formik.touched.currentPassword && formik.errors.currentPassword && <span className="text-red-500 text-sm">{formik.errors.currentPassword}</span>}
                    </div>
                    <div>
                        <label className="block font-medium pb-3">New Password</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            className="w-full px-3 py-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("newPassword")} 
                        />
                        {formik.touched.newPassword && formik.errors.newPassword && <span className="text-red-500 text-sm">{formik.errors.newPassword}</span>}
                    </div>
                    <div>
                        <label className="block font-medium pb-3">Confirm Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            className="w-full px-3 py-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            {...formik.getFieldProps("confirmPassword")} 
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && <span className="text-red-500 text-sm">{formik.errors.confirmPassword}</span>}
                    </div>
                    <div>
                        <button className="w-50 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200" type="submit">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Change_Password;
