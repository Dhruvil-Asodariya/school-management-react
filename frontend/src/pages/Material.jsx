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

  // ✅ Fetch All Materials and store in both data and filteredData
  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:8081/materials", {
        withCredentials: true,
      });
      setData(res.data); // Store all data
      setFilteredData(res.data); // Initialize filtered view
    } catch (err) {
      console.error("Error fetching Material:", err);
    }
  };

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

    const filtered = data.filter((material) => {
      const term = value.toLowerCase();
      return (
        material.subject?.toLowerCase().includes(term) ||
        material.material_title?.toLowerCase().includes(term) ||
        material.chapter?.toLowerCase().includes(term)
      );
    });

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
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search by Subject, Title or Chapter..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded focus:ring focus:ring-blue-300 focus:outline-none focus:border-sky-600 w-full max-w-sm"
        />
      </div>

      {/* 📚 Material Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((material) => (
            <div
              key={material.material_id}
              className="bg-white shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out rounded-xl p-4 flex flex-col items-center text-center border border-gray-200 cursor-default"
            >
              {/* 📝 File Icon */}
              <div
                className={`w-24 h-24 rounded-lg flex items-center justify-center mb-4 ${material.material_file?.toLowerCase().endsWith(".pdf")
                  ? "bg-red-100"
                  : material.material_file?.toLowerCase().endsWith(".doc") ||
                    material.material_file?.toLowerCase().endsWith(".docx")
                    ? "bg-blue-100"
                    : "bg-gray-100"
                  }`}
              >
                {material.material_file ? (
                  <>
                    {material.material_file.toLowerCase().endsWith(".pdf") ? (
                      <img src="pdf.png" alt="PDF" className="w-12 h-12 pointer-events-none" />
                    ) : material.material_file.toLowerCase().endsWith(".doc") ||
                      material.material_file.toLowerCase().endsWith(".docx") ? (
                      <img src="doc.png" alt="Word" className="w-12 h-12" />
                    ) : (
                      <span className="text-xs text-gray-600">Unknown</span>
                    )}
                  </>
                ) : null}
              </div>

              {/* 📖 Title & Chapter */}
              <h3 className="text-md font-semibold text-gray-800 mb-1">
                {material.material_title}
              </h3>
              <p className="text-gray-600 text-sm">{material.chapter}</p>

              {/* ⚡ Action Buttons with Effects */}
              <div className="flex space-x-4 mt-4">
                <button
                  className="text-blue-500 hover:text-white bg-transparent hover:bg-blue-500 border border-blue-500 px-2 py-1 rounded-md transition-all duration-300 ease-in-out"
                  title="Download"
                  onClick={() => handleDownload(material.material_file)}
                >
                  <FiDownload size={20} />
                </button>

                {(userSession?.role === 1 ||
                  userSession?.role === 2 ||
                  userSession?.role === 3) && (
                    <button
                      className="text-red-500 hover:text-white bg-transparent hover:bg-red-500 border border-red-500 px-2 py-1 rounded-md transition-all duration-300 ease-in-out"
                      title="Delete"
                      onClick={() => handleDelete(material.material_id)}
                    >
                      <FiTrash2 size={20} />
                    </button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <p>No materials found.</p>
        )}
      </div>
    </div>
  );
};

export default Material;
