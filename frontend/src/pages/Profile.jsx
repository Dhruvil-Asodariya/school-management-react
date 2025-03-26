import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profilePic, setProfilePic] = useState("vite.svg");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile data from the backend
  useEffect(() => {
    axios
      .get("http://localhost:8081/profile", { withCredentials: true })
      .then((response) => {
        const profile = response.data.profile;
        setProfilePic(profile.image || "vite.svg");
        formik.setValues({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phoneNo: profile.phone_no || "",
          dob: profile.date_of_birth || "",
          gender: profile.gender || "",
          address: profile.address || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        Swal.fire("Error", "Failed to load profile data", "error");
        setLoading(false);
      });
  }, []);

  // Profile validation schema
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

  // Formik for profile update
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      dob: "",
      gender: "",
      address: "",
    },
    validationSchema: profileValidationSchema,
    onSubmit: (values) => {
      axios
        .put("http://localhost:8081/profile_update", values, { withCredentials: true })
        .then((response) => {
          Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
            timer: 1000, // 1 second timer
            showConfirmButton: false, // Hides the button
            timerProgressBar: true,
          }).then(() => {
            setActiveTab("overview"); // Switch tab after Swal disappears
          });
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          Swal.fire({
            title: "Error",
            text: error.response?.data?.error || "Failed to update profile",
            icon: "error",
            timer: 1000, // 1 second timer for error alert too
            showConfirmButton: false,
            timerProgressBar: true,
          });
        });
    },

  });

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("email", formik.values.email);
    formData.append("firstName", formik.values.firstName);
    formData.append("lastName", formik.values.lastName);

    try {
      const response = await axios.put("http://localhost:8081/update_profile_picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setProfilePic(response.data.imageUrl); // Update profile picture in UI
      Swal.fire("Success", "Profile picture updated!", "success");
      window.location.reload();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Swal.fire("Error", error.response?.data?.error || "Failed to update profile picture", "error");
    }
  };

  const handleDeleteProfilePicture = async () => {
    Swal.fire({
        title: "Are you sure?",
        text: "You want to delete your profile picture?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete("http://localhost:8081/delete_profile_picture", {
                    data: { email: formik.values.email },
                    withCredentials: true,
                });

                Swal.fire({
                    title: "Deleted!",
                    text: "Your profile picture has been deleted.",
                    icon: "success",
                    timer: 1000, // Auto-close after 1 second
                    showConfirmButton: false,
                }).then(() => {
                    window.location.reload(); // Reload the page after Swal closes
                });

            } catch (error) {
                console.error("Error deleting profile picture:", error);
                Swal.fire("Error", "Failed to delete profile picture", "error");
            }
        }
    });
};


  if (loading) return <p className="text-center text-lg">Loading profile...</p>;

  return (
    <>
      <section className="py-6 items-center justify-center">
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Card */}
            <div className="w-full md:w-1/3">
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
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-lg inline-flex items-center mr-2" onClick={() => setIsEditModalOpen(true)}>
                    <FaRegEdit className="mr-2" /> Edit Profile
                  </button>
                  <button
                    className="bg-red-500 text-white py-2 px-4 rounded-lg inline-flex items-center" onClick={handleDeleteProfilePicture}>
                    <MdOutlineDelete className="mr-2" /> Delete Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="w-full md:w-2/3 py-10 px-4 bg-white shadow-lg">
              {/* Tabs Navigation */}
              <div className="flex border-b">
                <button
                  className={`px-4 py-2 font-medium ${activeTab === "overview"
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500"
                    }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === "changeProfile"
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
                    <div className="grid grid-cols-1 border border-white divide-y">
                      {[
                        ["First Name", formik.values.firstName],
                        ["Last Name", formik.values.lastName],
                        ["Phone", formik.values.phoneNo],
                        ["Gender", formik.values.gender],
                        ["Date Of Birth", formik.values.dob],
                        ["Address", formik.values.address],
                      ].map(([label, value], index) => (
                        <div key={index} className="grid grid-cols-2 border-b border-white">
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
                  <form className="grid grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
                    {/* Email Field - Readonly */}
                    <div className="col-span-2">
                      {/* <label className="block mb-1 font-medium">Email</label> */}
                      <input
                        type="email"
                        name="email"
                        className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
                        {...formik.getFieldProps("email")}
                        readOnly
                      />
                    </div>

                    {/* Other fields */}
                    {["firstName", "lastName", "phoneNo", "dob", "address"].map((field) => (
                      <div key={field}>
                        <label className="block mb-1 font-medium capitalize">{field}</label>
                        <input
                          type={field === "dob" ? "date" : "text"}
                          name={field}
                          className="w-full border rounded p-2 focus:outline-sky-600"
                          {...formik.getFieldProps(field)}
                        />
                        {formik.touched[field] && formik.errors[field] && (
                          <span className="text-red-500 text-sm">{formik.errors[field]}</span>
                        )}
                      </div>
                    ))}

                    {/* Gender Select Dropdown */}
                    <div>
                      <label className="block mb-1 font-medium">Gender</label>
                      <select
                        name="gender"
                        className="w-full border rounded p-2 focus:outline-sky-600"
                        {...formik.getFieldProps("gender")}
                      >
                        <option label="Select Gender" />
                        <option value="Male" label="Male" />
                        <option value="Female" label="Female" />
                      </select>
                      {formik.touched.gender && formik.errors.gender && (
                        <span className="text-red-500 text-sm">{formik.errors.gender}</span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* ✅ Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative animate-fadeIn">
              {/* Close Button */}
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>

              {/* Modal Title */}
              <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
                Update Profile Picture
              </h2>

              {/* File Input Styling */}
              <label className="cursor-pointer flex flex-col items-center border-2 border-dashed border-gray-300 p-5 rounded-lg hover:border-blue-500">
                <span className="text-gray-600 text-sm">Click to upload an image</span>
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>

              {/* Buttons */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileChange}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}


      </section>
    </>
  );
};

export default Profile;
