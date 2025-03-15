import { FiDownload } from "react-icons/fi";
import axios from "axios";
import { useEffect, useState } from "react";

const Material = () => {
  const [data, setData] = useState([]);

  // Fetch materials from the backend
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/material");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching Material:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to handle file download
  const handleDownload = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:8081/download/${fileName}`, {
        responseType: "blob", // Ensures proper handling of binary data
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {data.map((material) => (
        <div
          key={material.material_id}
          className="bg-white shadow-md rounded-lg p-4 text-center relative group overflow-hidden "
        >
          <div className="overflow-hidden pt-3">
            <img
              src="pdf.png"
              alt={material.material_title}
              className="w-full h-48 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <h3 className="text-lg font-semibold">
            {material.material_title + " " + material.chapter}
          </h3>
          <button
            className="absolute bottom-4 right-4 text-blue-600 hover:scale-110 hover:text-blue-800"
            title="Download"
            onClick={() => handleDownload(material.material_file)}
          >
            <FiDownload size={25} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Material;
