import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaTachometerAlt, FaMoneyCheckAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { BsDot } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { GiNotebook } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import { CgNotes } from "react-icons/cg";
import { AiFillRead } from "react-icons/ai";
import { FaOutdent } from "react-icons/fa";
import { PiNotebookFill } from "react-icons/pi";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { FaUser, FaCog, FaSignOutAlt, FaKey, FaLock } from "react-icons/fa";
import axios from "axios";

const MasterPage = ({ children }) => {


  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8081/session", { withCredentials: true });
      setUserSession(response.data.user);
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
      setUserSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const checkPassword = async () => {
    try {
      const response = await axios.get("http://localhost:8081/password", { withCredentials: true });
      setLockPassword(response.data.user.password);  // ✅ Correct access
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
      setLockPassword(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPassword();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [studentSubmenuOpen, setStudentSubmenuOpen] = useState(false);
  const [facultySubmenuOpen, setFacultySubmenuOpen] = useState(false);
  const [principalSubmenuOpen, setPrincipalSubmenuOpen] = useState(false);
  const [materialSubmenuOpen, setMaterialSubmenuOpen] = useState(false);
  const [feeSubmenuOpen, setFeeSubmenuOpen] = useState(false);
  const [feeAmountSubmenuOpen, setFeeAmountSubmenuOpen] = useState(false);
  const [holidaySubmenuOpen, setHolidaySubmenuOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    const savedLock = localStorage.getItem("isLocked");
    return savedLock === "true";
  });
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [userSession, setUserSession] = useState(null);
  const [lockPassword, setLockPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const dropdownRef = useRef(null);
  const correctPassword = lockPassword;


  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newSidebarState = !prev;
      if (!newSidebarState) {
        setStudentSubmenuOpen(false);  // 👈 Close submenu when sidebar closing
        setFacultySubmenuOpen(false);
        setPrincipalSubmenuOpen(false);
        setMaterialSubmenuOpen(false);
        setFeeSubmenuOpen(false);
        setFeeAmountSubmenuOpen(false);
        setHolidaySubmenuOpen(false);
      }
      return newSidebarState;
    });
  };
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const toggleStudentSubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      // Optional: little delay for smoothness
      setTimeout(() => setStudentSubmenuOpen(true), 100);
    } else {
      setStudentSubmenuOpen(prev => !prev);
    }
  };
  const toggleFacultySubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setFacultySubmenuOpen(true), 200);
    } else {
      setFacultySubmenuOpen(prev => !prev);
    }
  };

  const togglePrincipalSubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setPrincipalSubmenuOpen(true), 200);
    } else {
      setPrincipalSubmenuOpen(prev => !prev);
    }
  };

  const toggleMaterialSubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setMaterialSubmenuOpen(true), 200);
    } else {
      setMaterialSubmenuOpen(prev => !prev);
    }
  };

  const toggleFeeSubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setFeeSubmenuOpen(true), 200);
    } else {
      setFeeSubmenuOpen(prev => !prev);
    }
  };

  const toggleFeeAmountSubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setFeeAmountSubmenuOpen(true), 200);
    } else {
      setFeeAmountSubmenuOpen(prev => !prev);
    }
  };

  const toggleHolidaySubmenu = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setHolidaySubmenuOpen(true), 200);
    } else {
      setHolidaySubmenuOpen(prev => !prev);
    }
  };

  const handleLockScreen = () => {
    setIsLocked(true);
    localStorage.setItem("isLocked", "true");
  };

  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsLocked(false);
      localStorage.setItem("isLocked", "false");
      setPassword("");
      setError(""); // Clear any previous error
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Fetch Students
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/master", {
        withCredentials: true, // Ensures session cookies are sent
      });

      if (res.data.length > 0) {
        setImage(res.data[0].image); // Assuming API returns [{ image: "URL" }]
        setFirstName(res.data[0].first_name);
        setLastName(res.data[0].last_name);
      }

      console.log("✅ Image URL:", res.data[0]?.image); // Debugging
    } catch (err) {
      console.error("❌ Error fetching profile image:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  useEffect(() => {
    console.log("🔍 Current User Session:", userSession);
  }, [userSession]);

  if (loading) {
    return <p className="text-center text-lg font-semibold text-blue-600 animate-pulse">Loading...</p>;
  }



  if (userSession.role === 1) {
    return (
      <div className="h-screen flex flex-col bg-white text-black">
        {/* Navbar */}
        <nav className="p-4 fixed w-full h-15 z-10 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center">
            <Link to={"/dashboard"}>
              <img src="./Logo/1.png" alt="school logo" className="ml-4 w-12 h-12 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-dark-500 p-2 rounded text-white flex items-center"
              >
                <img src={image} className="w-8 h-8 mr-3 rounded-full" />
                {firstName + " " + lastName}
                <IoMdArrowDropdown className="ml-2 w-5 h-5" />
              </button>

              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaKey className="w-4 h-4" />
                    <Link to="/change_password">Change Password</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102 border-b border-gray-300" onClick={() => setDropdownOpen(false)}>
                    <FaLock className="w-4 h-4" />
                    <button onClick={handleLockScreen}>Lock Screen</button>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaSignOutAlt className="w-4 h-4" />
                    <Link to="/logout">Logout</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Lock Screen Modal */}
        {isLocked && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-8 w-[90%] max-w-md shadow-2xl text-center transition-all duration-500 text-white">
              <div className="mb-4 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-white/90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c1.656 0 3-1.344 3-3V5a3 3 0 00-6 0v3c0 1.656 1.344 3 3 3zm6 2H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-semibold mb-2">Screen Locked</h2>
              <p className="text-sm text-white/70 mb-6">Enter your password to unlock the screen</p>

              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              />

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-400 mb-4 font-medium transition duration-300 animate-shake">
                  {error}
                </p>
              )}

              <button
                onClick={handleUnlock}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 text-white font-medium shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Unlock
              </button>
            </div>
          </div>
        )}


        {/* Layout Below Navbar */}
        <div className="flex flex-1 pt-13">
          {/* Sidebar */}
          <div
            className={`mt-5 transition-transform duration-300 ${sidebarOpen ? "w-64" : "w-16"
              } bg-white shadow-lg flex flex-col h-full relative`}
          >
            <button
              onClick={toggleSidebar}
              className="text-black p-2 pl-4"
              aria-label="Toggle Sidebar"
            >
              <GiHamburgerMenu className="w-6 h-6" />
            </button>
            <ul className="flex-1 w-full">
              {/* Dashboard */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaTachometerAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/dashboard" className="ml-4">
                    Dashboard
                  </Link>
                )}
              </li>

              {/* Student Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleStudentSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Student</span>}
                {sidebarOpen && (
                  studentSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  )
                )}
              </li>

              {studentSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_student">Add Student</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/student_manage">Manage Students</Link>
                  </li>
                </ul>
              )}

              {/* Faculty Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFacultySubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Faculty</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {facultySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_faculty">Add Faculty</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/faculty_manage">Manage Faculty</Link>
                  </li>
                </ul>
              )}

              {/* Principal Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={togglePrincipalSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Principal</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {principalSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_principal">Add Principal</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/principal_manage">Manage Principal</Link>
                  </li>
                </ul>
              )}

              {/* Material Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleMaterialSubmenu}
              >
                <AiFillRead className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Material</span>}
                {sidebarOpen &&
                  (materialSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {materialSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_material">Add Material</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/materials">All Material</Link>
                  </li>
                </ul>
              )}

              {/* Holiday Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleHolidaySubmenu}
              >
                <FaCalendarAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Holiday</span>}
                {sidebarOpen &&
                  (holidaySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {holidaySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_holiday">Add Holiday</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/holiday">Manage Holiday</Link>
                  </li>
                </ul>
              )}

              {/* Fees Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fee</span>}
                {sidebarOpen &&
                  (feeSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_manage">All Fee</Link>
                  </li>
                </ul>
              )}

              {/* Fees Amount Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeAmountSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fees Amount Manage</span>}
                {sidebarOpen &&
                  (feeAmountSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeAmountSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_amount">All Fee Amount</Link>
                  </li>
                </ul>
              )}

              {/* Manage Class */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <SiGoogleclassroom className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/class_manage" className="ml-4">
                    Manage Class
                  </Link>
                )}
              </li>

              {/* Manage Subject */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <PiNotebookFill className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/subject_manage" className="ml-4">
                    Manage Subject
                  </Link>
                )}
              </li>

              {/* Manage Note */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <GiNotebook className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/note_manage" className="ml-4">
                    Manage Note
                  </Link>
                )}
              </li>


              {/* Add Leave */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <CgNotes className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/leave_manage" className="ml-4">
                    Leave Manage
                  </Link>
                )}
              </li>

              {/* Leave Manage */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_leave" className="ml-4">
                    Add Leave
                  </Link>
                )}
              </li> */}
            </ul>

            {/* Logout */}
            <ul>
              <li className="flex items-center py-4 px-4 mb-4 hover:font-bold hover:scale-106">
                <RiLogoutBoxRLine className="w-6 h-6" />
                {sidebarOpen && (
                  <Link to="/logout" className="ml-4">
                    Logout
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
            {/* <footer className="p-4 bg-white text-black">
        <p className="text-center">Footer Content</p>
      </footer> */}
          </div>
        </div>
      </div>
    );
  }

  //Principal Dashboard
  if (userSession.role === 2) {
    return (
      <div className="h-screen flex flex-col bg-white text-black">
        {/* Navbar */}
        <nav className="p-4 fixed w-full h-15 z-10 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center">
            <Link to={"/dashboard"}>
              <img src="./Logo/1.png" alt="school logo" className="ml-4 w-12 h-12 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-dark-500 p-2 rounded text-white flex items-center"
              >
                <img src={image} className="w-8 h-8 mr-3 rounded-full" />
                {firstName + " " + lastName}
                <IoMdArrowDropdown className="ml-2 w-5 h-5" />
              </button>
              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaKey className="w-4 h-4" />
                    <Link to="/change_password">Change Password</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaLock className="w-4 h-4" />
                    <button onClick={handleLockScreen}>Lock Screen</button>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-b border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaCog className="w-4 h-4" />
                    <Link to="/settings">Settings</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaSignOutAlt className="w-4 h-4" />
                    <Link to="/logout">Logout</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Lock Screen Modal */}
        {isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-50">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-black p-8 rounded-lg shadow-2xl w-96">
              <h2 className="text-xl font-bold mb-4 text-center text-white">
                Screen Locked
              </h2>
              <input
                type="password"
                className="border p-3 w-full font-bold text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-lg w-full transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-4 hover:border-white active:scale-95 active:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={handleUnlock}
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Layout Below Navbar */}
        <div className="flex flex-1 pt-13">
          {/* Sidebar */}
          <div
            className={`mt-5 transition-transform duration-300 ${sidebarOpen ? "w-64" : "w-16"
              } bg-white shadow-lg flex flex-col h-full relative`}
          >
            <button
              onClick={toggleSidebar}
              className="text-black p-2 pl-4"
              aria-label="Toggle Sidebar"
            >
              <GiHamburgerMenu className="w-6 h-6" />
            </button>
            <ul className="flex-1 w-full">
              {/* Dashboard */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaTachometerAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/dashboard" className="ml-4">
                    Dashboard
                  </Link>
                )}
              </li>

              {/* Student Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleStudentSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Student</span>}
                {sidebarOpen &&
                  (studentSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {studentSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_student">Add Student</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/student_manage">Manage Students</Link>
                  </li>
                </ul>
              )}

              {/* Faculty Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFacultySubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Faculty</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {facultySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_faculty">Add Faculty</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/faculty_manage">Manage Faculty</Link>
                  </li>
                </ul>
              )}

              {/* Material Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleMaterialSubmenu}
              >
                <AiFillRead className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Material</span>}
                {sidebarOpen &&
                  (materialSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {materialSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_material">Add Material</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/materials">All Material</Link>
                  </li>
                </ul>
              )}

              {/* Holiday Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleHolidaySubmenu}
              >
                <FaCalendarAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Holiday</span>}
                {sidebarOpen &&
                  (holidaySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {holidaySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_holiday">Add Holiday</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/holiday">Manage Holiday</Link>
                  </li>
                </ul>
              )}
              {/* Fees Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fee</span>}
                {sidebarOpen &&
                  (feeSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_manage">All Fee</Link>
                  </li>
                </ul>
              )}

              {/* Fees Amount Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeAmountSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fees Amount Manage</span>}
                {sidebarOpen &&
                  (feeAmountSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeAmountSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_amount">All Fee Amount</Link>
                  </li>
                </ul>
              )}

              {/* Manage Class */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <SiGoogleclassroom className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/class_manage" className="ml-4">
                    Manage Class
                  </Link>
                )}
              </li>

              {/* Manage Subject */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <PiNotebookFill className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/subject_manage" className="ml-4">
                    Manage Subject
                  </Link>
                )}
              </li>

              {/* Manage Note */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <GiNotebook className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/note_manage" className="ml-4">
                    Manage Note
                  </Link>
                )}
              </li>


              {/* Add Leave */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <CgNotes className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/leave_manage" className="ml-4">
                    Leave Manage
                  </Link>
                )}
              </li>

              {/* Leave Manage */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_leave" className="ml-4">
                    Add Leave
                  </Link>
                )}
              </li>
            </ul>

            {/* Logout */}
            <ul>
              <li className="flex items-center py-4 px-4 mb-4 hover:font-bold hover:scale-106">
                <RiLogoutBoxRLine className="w-6 h-6" />
                {sidebarOpen && (
                  <Link to="/logout" className="ml-4">
                    Logout
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
            {/* <footer className="p-4 bg-white text-black">
        <p className="text-center">Footer Content</p>
      </footer> */}
          </div>
        </div>
      </div>
    );
  }

  //Faculty Dashboard
  else if (userSession.role === 3) {
    return (
      <div className="h-screen flex flex-col bg-white text-black">
        {/* Navbar */}
        <nav className="p-4 fixed w-full h-15 z-10 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center">
            <Link to={"/dashboard"}>
              <img src="./Logo/1.png" alt="school logo" className="ml-4 w-12 h-12 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-dark-500 p-2 rounded text-white flex items-center"
              >
                <img src={image} className="w-8 h-8 mr-3 rounded-full" />
                {firstName + " " + lastName}
                <IoMdArrowDropdown className="ml-2 w-5 h-5" />
              </button>
              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaKey className="w-4 h-4" />
                    <Link to="/change_password">Change Password</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaLock className="w-4 h-4" />
                    <button onClick={handleLockScreen}>Lock Screen</button>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-b border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaCog className="w-4 h-4" />
                    <Link to="/settings">Settings</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaSignOutAlt className="w-4 h-4" />
                    <Link to="/logout">Logout</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Lock Screen Modal */}
        {isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-50">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-black p-8 rounded-lg shadow-2xl w-96">
              <h2 className="text-xl font-bold mb-4 text-center text-white">
                Screen Locked
              </h2>
              <input
                type="password"
                className="border p-3 w-full font-bold text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-lg w-full transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-4 hover:border-white active:scale-95 active:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={handleUnlock}
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Layout Below Navbar */}
        <div className="flex flex-1 pt-13">
          {/* Sidebar */}
          <div
            className={`mt-5 transition-transform duration-300 ${sidebarOpen ? "w-64" : "w-16"
              } bg-white shadow-lg flex flex-col h-full relative`}
          >
            <button
              onClick={toggleSidebar}
              className="text-black p-2 pl-4"
              aria-label="Toggle Sidebar"
            >
              <GiHamburgerMenu className="w-6 h-6" />
            </button>
            <ul className="flex-1 w-full">
              {/* Dashboard */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaTachometerAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/dashboard" className="ml-4">
                    Dashboard
                  </Link>
                )}
              </li>

              {/* Student Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleStudentSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Student</span>}
                {sidebarOpen &&
                  (studentSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {studentSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_student">Add Student</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/student_manage">Manage Students</Link>
                  </li>
                </ul>
              )}

              {/* Faculty Submenu */}
              {/* <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFacultySubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Faculty</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {facultySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_faculty">Add Faculty</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/faculty_manage">Manage Faculty</Link>
                  </li>
                </ul>
              )} */}

              {/* Principal Submenu */}
              {/* <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={togglePrincipalSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Principal</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {principalSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_principal">Add Principal</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/principal_manage">Manage Principal</Link>
                  </li>
                </ul>
              )} */}

              {/* Material Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleMaterialSubmenu}
              >
                <AiFillRead className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Material</span>}
                {sidebarOpen &&
                  (materialSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {materialSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_material">Add Material</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/materials">All Material</Link>
                  </li>
                </ul>
              )}

              {/* Holiday Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleHolidaySubmenu}
              >
                <FaCalendarAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Holiday</span>}
                {sidebarOpen &&
                  (holidaySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {holidaySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  {/* <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_holiday">Add Holiday</Link>
                  </li> */}
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/holiday">Manage Holiday</Link>
                  </li>
                </ul>
              )}

              {/* Fees Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fee</span>}
                {sidebarOpen &&
                  (feeSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/pending_fees_manage">Pending Fee</Link>
                  </li>
                </ul>
              )}

              {/* Manage Class */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <SiGoogleclassroom className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/class_manage" className="ml-4">
                    Manage Class
                  </Link>
                )}
              </li> */}

              {/* Manage Subject */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <PiNotebookFill className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/subject_manage" className="ml-4">
                    Manage Subject
                  </Link>
                )}
              </li> */}

              {/* Manage Note */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <GiNotebook className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/note_manage" className="ml-4">
                    Manage Note
                  </Link>
                )}
              </li>


              {/* Add Leave */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <CgNotes className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/leave_manage" className="ml-4">
                    Leave Manage
                  </Link>
                )}
              </li>

              {/* Leave Manage */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_leave" className="ml-4">
                    Add Leave
                  </Link>
                )}
              </li>
            </ul>

            {/* Logout */}
            <ul>
              <li className="flex items-center py-4 px-4 mb-4 hover:font-bold hover:scale-106">
                <RiLogoutBoxRLine className="w-6 h-6" />
                {sidebarOpen && (
                  <Link to="/logout" className="ml-4">
                    Logout
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
            {/* <footer className="p-4 bg-white text-black">
        <p className="text-center">Footer Content</p>
      </footer> */}
          </div>
        </div>
      </div>
    );
  }

  //Student Dashboard
  else if (userSession.role === 4) {
    return (
      <div className="h-screen flex flex-col bg-white text-black">
        {/* Navbar */}
        <nav className="p-4 fixed w-full h-15 z-10 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center">
            <Link to={"/dashboard"}>
              <img src="./Logo/1.png" alt="school logo" className="ml-4 w-12 h-12 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-dark-500 p-2 rounded text-white flex items-center"
              >
                <img src={image} className="w-8 h-8 mr-3 rounded-full" />
                {firstName + " " + lastName}
                <IoMdArrowDropdown className="ml-2 w-5 h-5" />
              </button>
              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaKey className="w-4 h-4" />
                    <Link to="/change_password">Change Password</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaLock className="w-4 h-4" />
                    <button onClick={handleLockScreen}>Lock Screen</button>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-b border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaCog className="w-4 h-4" />
                    <Link to="/settings">Settings</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaSignOutAlt className="w-4 h-4" />
                    <Link to="/logout">Logout</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Lock Screen Modal */}
        {isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-50">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-black p-8 rounded-lg shadow-2xl w-96">
              <h2 className="text-xl font-bold mb-4 text-center text-white">
                Screen Locked
              </h2>
              <input
                type="password"
                className="border p-3 w-full font-bold text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-lg w-full transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-4 hover:border-white active:scale-95 active:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={handleUnlock}
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Layout Below Navbar */}
        <div className="flex flex-1 pt-13">
          {/* Sidebar */}
          <div
            className={`mt-5 transition-transform duration-300 ${sidebarOpen ? "w-64" : "w-16"
              } bg-white shadow-lg flex flex-col h-full relative`}
          >
            <button
              onClick={toggleSidebar}
              className="text-black p-2 pl-4"
              aria-label="Toggle Sidebar"
            >
              <GiHamburgerMenu className="w-6 h-6" />
            </button>
            <ul className="flex-1 w-full">
              {/* Dashboard */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaTachometerAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/dashboard" className="ml-4">
                    Dashboard
                  </Link>
                )}
              </li>

              {/* Material */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <AiFillRead className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/materials" className="ml-4">
                    Material
                  </Link>
                )}
              </li>

              {/* Holiday */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaCalendarAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/holiday" className="ml-4">
                    Holiday
                  </Link>
                )}
              </li>

              {/* Fee Manage */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fee</span>}
                {sidebarOpen &&
                  (feeSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_manage">All Fee</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/pending_fees_manage">Pending Fee</Link>
                  </li>
                </ul>
              )}

              {/* Add Leave */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <CgNotes className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/leave_manage" className="ml-4">
                    Leave Manage
                  </Link>
                )}
              </li>

              {/* Add Leave */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_leave" className="ml-4">
                    Add Leave
                  </Link>
                )}
              </li>

              {/* Manage Note */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <GiNotebook className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/note_manage" className="ml-4">
                    Note
                  </Link>
                )}
              </li>

              {/* Add Parent Data */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_parent_data" className="ml-4">
                    Add Parent Data
                  </Link>
                )}
              </li> */}

            </ul>



            {/* Logout */}
            <ul>
              <li className="flex items-center py-4 px-4 mb-4 hover:font-bold hover:scale-106">
                <RiLogoutBoxRLine className="w-6 h-6" />
                {sidebarOpen && (
                  <Link to="/logout" className="ml-4">
                    Logout
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
            {/* <footer className="p-4 bg-white text-black">
        <p className="text-center">Footer Content</p>
      </footer> */}
          </div>
        </div>
      </div>
    );
  }

  //Parent Dashboard
  else if (userSession.role === 5) {
    return (
      <div className="h-screen flex flex-col bg-white text-black">
        {/* Navbar */}
        <nav className="p-4 fixed w-full h-15 z-10 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center">
            <Link to={"/dashboard"}>
              <img src="./Logo/1.png" alt="school logo" className="ml-4 w-12 h-12 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-dark-500 p-2 rounded text-white flex items-center"
              >
                <img src={image} className="w-8 h-8 mr-3 rounded-full" />
                {firstName + " " + lastName}
                <IoMdArrowDropdown className="ml-2 w-5 h-5" />
              </button>
              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaUser className="w-4 h-4" />
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaKey className="w-4 h-4" />
                    <Link to="/change_password">Change Password</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaLock className="w-4 h-4" />
                    <button onClick={handleLockScreen}>Lock Screen</button>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold border-b border-gray-300 hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaCog className="w-4 h-4" />
                    <Link to="/settings">Settings</Link>
                  </li>
                  <li className="px-4 py-2 flex items-center gap-2 hover:font-bold hover:scale-102" onClick={() => setDropdownOpen(false)}>
                    <FaSignOutAlt className="w-4 h-4" />
                    <Link to="/logout">Logout</Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Lock Screen Modal */}
        {isLocked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white z-50">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-black p-8 rounded-lg shadow-2xl w-96">
              <h2 className="text-xl font-bold mb-4 text-center text-white">
                Screen Locked
              </h2>
              <input
                type="password"
                className="border p-3 w-full font-bold text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-8 py-4 rounded-lg w-full transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-2xl hover:border-4 hover:border-white active:scale-95 active:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                onClick={handleUnlock}
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Layout Below Navbar */}
        <div className="flex flex-1 pt-13">
          {/* Sidebar */}
          <div
            className={`mt-5 transition-transform duration-300 ${sidebarOpen ? "w-64" : "w-16"
              } bg-white shadow-lg flex flex-col h-full relative`}
          >
            <button
              onClick={toggleSidebar}
              className="text-black p-2 pl-4"
              aria-label="Toggle Sidebar"
            >
              <GiHamburgerMenu className="w-6 h-6" />
            </button>
            <ul className="flex-1 w-full">
              {/* Dashboard */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaTachometerAlt className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/dashboard" className="ml-4">
                    Dashboard
                  </Link>
                )}
              </li>

              {/* Student Submenu */}
              {/* <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleStudentSubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Student</span>}
                {sidebarOpen &&
                  (studentSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {studentSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_student">Add Student</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/student_manage">Manage Students</Link>
                  </li>
                </ul>
              )} */}

              {/* Faculty Submenu */}
              {/* <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFacultySubmenu}
              >
                <FaUsers className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Faculty</span>}
                {sidebarOpen &&
                  (facultySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {facultySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_faculty">Add Faculty</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/faculty_manage">Manage Faculty</Link>
                  </li>
                </ul>
              )} */}

              {/* Material Submenu */}
              {/* <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleMaterialSubmenu}
              >
                <AiFillRead className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Material</span>}
                {sidebarOpen &&
                  (materialSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {materialSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_material">Add Material</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/materials">All Material</Link>
                  </li>
                </ul>
              )} */}

              {/* Holiday Submenu */}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleHolidaySubmenu}
              >
                <FaCalendarAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Holiday</span>}
                {sidebarOpen &&
                  (holidaySubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>
              {holidaySubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  {/* <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/add_holiday">Add Holiday</Link>
                  </li> */}
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/holiday">Holiday</Link>
                  </li>
                </ul>
              )}
              <li
                className="py-4 px-4 hover:font-bold hover:scale-106 cursor-pointer flex items-center"
                onClick={toggleFeeSubmenu}
              >
                <FaMoneyCheckAlt className="w-5 h-5" />
                {sidebarOpen && <span className="ml-4">Fee</span>}
                {sidebarOpen &&
                  (feeSubmenuOpen ? (
                    <IoMdArrowDropdown className="ml-auto" />
                  ) : (
                    <IoMdArrowDropright className="ml-auto" />
                  ))}
              </li>

              {feeSubmenuOpen && (
                <ul
                  className={`transition-all duration-300 ${sidebarOpen
                    ? "ml-10 bg-white p-2 rounded"
                    : "absolute left-16 w-48 bg-white shadow-lg p-2 rounded"
                    }`}
                >
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/fees_manage">All Fee</Link>
                  </li>
                  <li className="py-2 flex items-center hover:font-bold hover:scale-106">
                    <BsDot className="w-5 h-5 mr-2" />
                    <Link to="/pending_fees_manage">Pending Fee</Link>
                  </li>
                </ul>
              )}

              {/* Manage Class */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <SiGoogleclassroom className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/class_manage" className="ml-4">
                    Manage Class
                  </Link>
                )}
              </li> */}

              {/* Manage Subject */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <PiNotebookFill className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/subject_manage" className="ml-4">
                    Manage Subject
                  </Link>
                )}
              </li> */}

              {/* Manage Note */}
              <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <GiNotebook className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/note_manage" className="ml-4">
                    Note
                  </Link>
                )}
              </li>


              {/* Add Leave */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <CgNotes className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/leave_manage" className="ml-4">
                    Leave Manage
                  </Link>
                )}
              </li> */}

              {/* Leave Manage */}
              {/* <li className="flex items-center py-4 px-4 hover:font-bold hover:scale-106">
                <FaOutdent className="w-5 h-5" />
                {sidebarOpen && (
                  <Link to="/add_leave" className="ml-4">
                    Add Leave
                  </Link>
                )}
              </li> */}
            </ul>

            {/* Logout */}
            <ul>
              <li className="flex items-center py-4 px-4 mb-4 hover:font-bold hover:scale-106">
                <RiLogoutBoxRLine className="w-6 h-6" />
                {sidebarOpen && (
                  <Link to="/logout" className="ml-4">
                    Logout
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">{children}</div>
            {/* <footer className="p-4 bg-white text-black">
        <p className="text-center">Footer Content</p>
      </footer> */}
          </div>
        </div>
      </div>
    );
  }
};

MasterPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MasterPage;