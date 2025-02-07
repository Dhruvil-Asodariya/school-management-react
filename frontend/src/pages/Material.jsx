import { FiDownload } from "react-icons/fi";

const materials = [
  {
    id: 1,
    image: "pdf.png",
    title: "React Chapter 1",
  },
  {
    id: 2,
    image: "pdf.png",
    title: "React Chapter 2",
  },
  {
    id: 3,
    image: "pdf.png",
    title: "React Chapter 3",
  },
  {
    id: 4,
    image: "pdf.png", // Replace with your image URL
    title: "React Chapter 4",
  },
  {
    id: 5,
    image: "pdf.png", // Replace with your image URL
    title: "React Chapter 5",
  },
];

const Material = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {materials.map((material) => (
        <div
          key={material.id}
          className="bg-white shadow-md rounded-lg p-4 text-center relative group overflow-hidden "
        >
          <div className="overflow-hidden pt-3">
            <img
              src={material.image}
              alt={material.title}
              className="w-full h-48 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <h3 className="text-lg font-semibold">{material.title}</h3>
          <button
            className="absolute bottom-4 right-4 text-blue-600 hover:scale-120 hover:text-blue-800"
            title="Download"
          >
            <FiDownload size={25} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Material;