import {Link} from "react-router-dom"

const Login = () => {
    return (
      <div className="flex h-screen">
        {/* Left Section */}
        <div className="w-full md:w-1/4 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24">
          <div className="mb-6">
            <img src="./Logo/1.png" alt="" />
            {/* <h1 className="text-3xl font-bold">EDUSPHERE</h1> */}
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
          <p className="text-gray-500 mb-6">Sign in to continue to Edusphere.</p>
  
          <form className="w-full max-w-sm">
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded focus:outline-sky-600"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded focus:outline-sky-600"
                placeholder="Enter your password"
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Log In
            </button>
          </form>
  
          <p className="mt-4 text-gray-500">
            Don’t have an account?{" "}
            <Link to={""} className="text-blue-600 hover:underline">
              Forgote
            </Link>
          </p>
        </div>
  
        {/* Right Section - 75% Width with Opacity */}
        <div className="md:w-3/4 relative">
          <div
            className="absolute inset-0 bg-black opacity-50"
          ></div>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/login.jpg')" }}
          ></div>
        </div>
      </div>
    );
  };
  
  export default Login;
  