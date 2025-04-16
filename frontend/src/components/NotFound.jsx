import { useEffect, useState } from "react";

const NotFound = () => {
  const [glitch, setGlitch] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch((prev) => (prev + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-blue-900 px-4 overflow-hidden">
      {/* Animated 404 */}
      <div className="relative text-[100px] md:text-[140px] lg:text-[180px] font-extrabold leading-none tracking-tight animate-bounceIn">
        <div className="relative inline-block animate-pulse">
          <span className="text-blue-700 relative z-10">4</span>
          <span
            className={`absolute top-0 left-0 z-0 opacity-60 text-cyan-400 ${
              glitch === 1 ? "-translate-x-1 -translate-y-1" : ""
            } ${glitch === 2 ? "translate-x-1 translate-y-1" : ""} transition-all duration-150`}
          >
            4
          </span>
        </div>
        <span className="mx-2 text-blue-700 relative z-10 animate-pulse">0</span>
        <div className="relative inline-block animate-pulse">
          <span className="text-blue-700 relative z-10">4</span>
          <span
            className={`absolute top-0 left-0 z-0 opacity-60 text-cyan-400 ${
              glitch === 1 ? "translate-x-1 -translate-y-1" : ""
            } ${glitch === 2 ? "-translate-x-1 translate-y-1" : ""} transition-all duration-150`}
          >
            4
          </span>
        </div>
      </div>

      {/* Texts */}
      <p className="mt-4 text-3xl md:text-4xl font-semibold text-blue-800 animate-fadeInUp">
        Oops! Page Not Found
      </p>
      <p className="text-blue-600 text-md md:text-lg mt-2 animate-fadeInUp delay-[0.3s]">
        The page you’re looking for doesn’t exist or has been moved.
      </p>


      {/* Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.8) translateY(-30px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-bounceIn {
            animation: bounceIn 1s ease-in-out;
          }

          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          .hover\\:animate-wiggle:hover {
            animation: wiggle 0.5s ease-in-out;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-pulse {
            animation: pulse 2s infinite;
          }

          .delay-\\[0\\.3s\\] {
            animation-delay: 0.3s;
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;  