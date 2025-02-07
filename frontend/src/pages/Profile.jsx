import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [profilePic, setProfilePic] = useState("vite.svg");
  // Main Profile Validation Schema (Excludes Profile Picture)
  const profileValidationSchema = Yup.object({
    firstName: Yup.string()
      .matches(/^[A-Za-z]+$/, "Only alphabets are allowed")
      .required("First name is required"),
    lastName: Yup.string()
      .matches(/^[A-Za-z]+$/, "Only alphabets are allowed")
      .required("Last name is required"),
    phoneNo: Yup.string()
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .length(10, "Phone number must be 10 digits")
      .required("Phone number is required"),
    dob: Yup.string().required("Date of Birth is required"),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string().required("Address is required"),
  });
  // Modal Profile Picture Validation Schema
  const modalValidationSchema = Yup.object({
    profilePic: Yup.mixed()
      .required("Profile picture is required")
      .test("fileSize", "File too large, max 5MB", (value) =>
        value ? value.size <= 5 * 1024 * 1024 : true
      )
      .test("fileType", "Only JPG, JPEG, and PNG allowed", (value) =>
        value
          ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
          : true
      ),
  });
  // Formik for Main Profile (Excluding Profile Picture)
  const formik = useFormik({
    initialValues: {
      firstName: "Ethan",
      lastName: "Leo",
      phoneNo: "8200606297",
      dob: "2007-10-18",
      gender: "Male",
      address: "Mountain View, California",
    },
    validationSchema: profileValidationSchema,
    onSubmit: (values) => {
      Swal.fire("Success!", "Profile updated successfully", "success");
      console.log("Updated Profile:", values);
    },
  });
  // Formik for Profile Picture Update in Modal
  const modalFormik = useFormik({
    initialValues: { profilePic: null },
    validationSchema: modalValidationSchema,
    onSubmit: (values) => {
      const reader = new FileReader();
      reader.onload = (e) => setProfilePic(e.target.result);
      reader.readAsDataURL(values.profilePic);
      // alert(values.profilePic.name);
      setShowEditModal(false);
      Swal.fire("Success!", "Profile picture updated successfully", "success");
    },
  });

  return (
    <>
      <section className="py-6 items-center justify-center">
        <div className="container mx-auto p-6">
          <div className="flex flex-wrap">
            {/* Profile Card */}
            <div className="w-100 p-4">
              <div className="bg-white shadow-lg rounded-lg p-4 text-center">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-32 h-32 mx-auto rounded-full border-2 border-blue-500"
                />
                <h2 className="text-lg font-semibold mt-4">
                  {formik.values.firstName} {formik.values.lastName}
                </h2>
                <p className="text-gray-500">Project Manager</p>
                <div className="mt-4">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg inline-flex items-center mr-2"
                    onClick={() => setShowEditModal(true)}
                  >
                    <FaRegEdit className="mr-2" /> Edit Profile
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-lg inline-flex items-center"
                    onClick={() =>
                      Swal.fire(
                        "Deleted!",
                        "Your profile has been deleted.",
                        "success"
                      )
                    }
                  >
                    <MdOutlineDelete className="mr-2" /> Delete Profile
                  </button>
                </div>
              </div>
            </div>
            {/* Tabs Section */}
            <div className="w-260 py-10 px-4 mt-4 bg-white shadow-lg">
              {/* Tabs Navigation */}
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "overview"
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "changeProfile"
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("changeProfile")}
                >
                  Edit Profile
                </button>
              </div>

              {/* Tabs Content */}
              <div className="mt-6">
                {activeTab === "overview" && (
                  <div>
                    <h3 className="mb-3">Profile</h3>
                    <div className="grid grid-cols-1 border border-white divide-y">
                      {[
                        ["First Name", "Ethan"],
                        ["Last Name", "Leo"],
                        ["Email", "abcd@gmail.com"],
                        ["Phone", "8200606297"],
                        ["Gender", "Male"],
                        ["Date Of Birth", "18-10-2007"],
                        ["Address", "Mountain View, California"],
                      ].map(([label, value], index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 border-b border-white"
                        >
                          <div className="bg-gray-100 p-2 border-r border-white font-semibold">
                            {label}
                          </div>
                          <div className="bg-gray-50 p-2">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "changeProfile" && (
                  <form
                    className="grid grid-cols-2 gap-4"
                    onSubmit={formik.handleSubmit}
                  >
                    {Object.keys(formik.values).map((field) => (
                      <div key={field}>
                        <label className="block mb-1 font-medium capitalize">
                          {field}
                        </label>
                        <input
                          type={field === "dob" ? "date" : "text"}
                          name={field}
                          className="w-full border rounded p-2 focus:outline-sky-600"
                          {...formik.getFieldProps(field)}
                        />
                        {formik.touched[field] && formik.errors[field] && (
                          <span className="text-red-500 text-sm">
                            {formik.errors[field]}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="col-span-2">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-x-0 top-0 flex items-start justify-center mt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-110">
            <h2 className="text-xl font-semibold mb-4">
              Change Profile Picture
            </h2>
            <form onSubmit={modalFormik.handleSubmit}>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded p-2 focus:outline-sky-600"
                  onChange={(event) =>
                    modalFormik.setFieldValue(
                      "profilePic",
                      event.target.files[0]
                    )
                  }
                />
                {modalFormik.touched.profilePic &&
                  modalFormik.errors.profilePic && (
                    <span className="text-red-500 text-sm">
                      {modalFormik.errors.profilePic}
                    </span>
                  )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
