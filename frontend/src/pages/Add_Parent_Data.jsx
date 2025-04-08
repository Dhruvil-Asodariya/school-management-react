import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Button from "../components/Button";
import Form_Title from "../components/Form_Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Add_Parent_Data = () => {

    const navigate = useNavigate();

    const validationSchema = Yup.object({
        firstName: Yup.string()
            .matches(/^[A-Za-z]+$/, "First name should contain only alphabets")
            .required("Please enter First name"),
        lastName: Yup.string()
            .matches(/^[A-Za-z]+$/, "Last name should contain only alphabets")
            .required("Please enter Last name"),
        email: Yup.string()
            .email("Please enter a valid Email address")
            .required("Please Enter Email"),
        phoneNo: Yup.string()
            .matches(/^\d+$/, "Only numbers are allowed")
            .length(10, "Phone number must be 10 digits")
            .required("Phone number is required"),
        dob: Yup.string().required("Please enter Date Of Birth"),
        gender: Yup.string().required("Please select Gender"),
        address: Yup.string().required("Please enter Address"),
        image: Yup.mixed().required("Please select Image"),
    });

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNo: "",
            dob: "",
            address: "",
            gender: "",
            image: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append("firstName", values.firstName);
                formData.append("lastName", values.lastName);
                formData.append("email", values.email);
                formData.append("phoneNo", values.phoneNo);
                formData.append("dob", values.dob);
                formData.append("address", values.address);
                formData.append("gender", values.gender);
                formData.append("image", values.image); // Append file

                await axios.post("http://localhost:8081/parent", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });

                Swal.fire({
                    title: "Success!",
                    text: "New parent successfully added",
                    icon: "success",
                    timer: 1000,
                    showConfirmButton: true,
                    timerProgressBar: true,
                }).then(() => {
                    formik.resetForm();
                    navigate("/dashboard");
                });

            } catch (error) {
                console.error("Error adding parent:", error);
                // ✅ If email already exists, show an error
                if (error.response && error.response.status === 400) {
                    Swal.fire({
                        toast: true,
                        position: "top",
                        icon: "warning",
                        title: "Duplicate Email!",
                        text: "This email is already registered. Please use a different email.",
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                    });
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to add parent",
                        icon: "error",
                        timer: 1000,
                        showConfirmButton: true,
                    });
                }
            }
        }
    });

    return (
        <div className="flex justify-center items-center ">
            <div className="w-full bg-gray-10 shadow-lg rounded-lg p-6 mt-3">
                <Form_Title name="Add New Parent" />
                <form className="space-y-4" onSubmit={formik.handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                {...formik.getFieldProps("firstName")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            />
                            {formik.touched.firstName && formik.errors.firstName && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.firstName}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                {...formik.getFieldProps("lastName")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            />
                            {formik.touched.lastName && formik.errors.lastName && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.lastName}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium pb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            {...formik.getFieldProps("email")}
                            className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <span className="text-red-500 text-sm">
                                {formik.errors.email}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                Phone No.
                            </label>
                            <input
                                type="text"
                                name="phoneNo"
                                {...formik.getFieldProps("phoneNo")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            />
                            {formik.touched.phoneNo && formik.errors.phoneNo && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.phoneNo}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                Gender
                            </label>
                            <select
                                name="gender"
                                {...formik.getFieldProps("gender")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            >
                                <option value="">Choose...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {formik.touched.gender && formik.errors.gender && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.gender}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                Date Of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                {...formik.getFieldProps("dob")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            />
                            {formik.touched.dob && formik.errors.dob && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.dob}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium pb-3">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                {...formik.getFieldProps("address")}
                                className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            />
                            {formik.touched.address && formik.errors.address && (
                                <span className="text-red-500 text-sm">
                                    {formik.errors.address}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium pb-3">
                            Parent Image
                        </label>
                        <input
                            type="file"
                            name="image"
                            className="w-full px-3 py-2 bg-white border rounded-lg focus:outline-sky-600"
                            onChange={(event) =>
                                formik.setFieldValue("image", event.currentTarget.files[0])
                            }
                        />
                        {formik.touched.image && formik.errors.image && (
                            <span className="text-red-500 text-sm">
                                {formik.errors.image}
                            </span>
                        )}
                    </div>

                    <div className="text-left">
                        <Button name="Submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Add_Parent_Data;