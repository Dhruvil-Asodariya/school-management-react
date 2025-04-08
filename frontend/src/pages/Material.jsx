import { FiDownload, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { useEffect, useState } from "react";

const Material = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [userSession, setUserSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Check User Session
  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8081/session", {
        withCredentials: true,
      });
      setUserSession(response.data.user);
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
      setUserSession(null);
    }
  };

  // ✅ Fetch All Materials
  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:8081/materials",{ withCredentials: true, });
      setFilteredData(res.data);
    } catch (err) {
      console.error("Error fetching Material:", err);
    }
  };

  // ✅ Make sure session check finishes first
  useEffect(() => {
    const loadData = async () => {
      await checkSession();
      await fetchMaterials();
    };

    loadData();
  }, []);

  // 🔍 Handle Search Input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = data.filter((material) =>
      material.subject?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // ✅ Download Handler
  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:8081/download/${fileName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // ✅ Delete Handler
  const handleDelete = async (materialId) => {
    try {
      await axios.delete(`http://localhost:8081/material/${materialId}`);
      const updatedData = data.filter((material) => material.material_id !== materialId);
      setData(updatedData);
      setFilteredData(updatedData.filter((material) =>
        material.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="p-6">
      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Subject..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border rounded-lg p-2 w-full"
        />
      </div>

      {/* 📚 Material Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((material) => (
            <div
              key={material.material_id}
              className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* 📝 PDF Icon */}
              <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <img src="pdf.png" alt={material.material_title} className="w-12 h-12" />
              </div>

              {/* 📖 Title & Chapter */}
              <h3 className="text-md font-semibold text-gray-800 mb-1">
                {material.material_title}
              </h3>
              <p className="text-gray-600 text-sm">{material.chapter}</p>

              {/* ⚡ Action Buttons */}
              <div className="flex space-x-4 mt-4">
                <button
                  className="text-blue-500 hover:text-blue-700 transition-transform hover:scale-110"
                  title="Download"
                  onClick={() => handleDownload(material.material_file)}
                >
                  <FiDownload size={22} />
                </button>

                {(userSession?.role === 1 || userSession?.role === 2 || userSession?.role === 3) && (
                  <button
                    className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"
                    title="Delete"
                    onClick={() => handleDelete(material.material_id)}
                  >
                    <FiTrash2 size={22} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No materials found. Raw data: {JSON.stringify(data)}</p> // ✅ Debug fallback
        )}
      </div>
    </div>
  );
};

export default Material;
