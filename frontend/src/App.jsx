import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import MasterPage from "./MasterPage";
import Dashboard from "./pages/Dashboard";
import Student_Manage from "./pages/Student_Manage";
import Add_Student from "./pages/Add_Student";
import Add_Faculty from "./pages/Add_Faculty ";
import Faculty_Manage from "./pages/Faculty_Manage";
import Holiday from "./pages/Holiday";
import Add_Holiday from "./pages/Add_Holiday";
import Change_Password from "./pages/Change_Password";
import Profile from "./pages/Profile";
import Class_Manage from "./pages/Class_Manage";
import Subject_Manage from "./pages/Subject_Manage";
import Note_Manage from "./pages/Note_Manage";
import Material from "./pages/Material";
import Add_Material from "./pages/Add_Material";
import Leave_Manage from "./pages/Leave_Manage";
import Add_Leave from "./pages/Add_Leave";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";
import NotFound from "./components/NotFound"; // Import 404 Page

const App = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8081/session", { withCredentials: true })
      .then((response) => setUserRole(response.data.user.role))
      .catch(() => setUserRole(null));
  }, []);
  return (
    <Router>
      <Routes>
        {/* Wrap routes with MasterPage */}
        <Route path="/" element={ <Login /> } />
        <Route path="/logout" element={ <Logout /> } />
        <Route path="/dashboard" element={ <ProtectedRoute element={<MasterPage><Dashboard /></MasterPage>} allowedRoles={[1, 2, 3, 4, 5]} userRole={userRole} /> }/>
        <Route path="/student_manage" element={<ProtectedRoute element={<MasterPage><Student_Manage /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> } />
        <Route path="/add_student" element={ <ProtectedRoute element={<MasterPage><Add_Student /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/add_faculty" element={ <ProtectedRoute element={<MasterPage><Add_Faculty /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/faculty_manage" element={ <ProtectedRoute element={<MasterPage><Faculty_Manage /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/holiday" element={ <ProtectedRoute element={<MasterPage><Holiday /></MasterPage>} allowedRoles={[1, 2, 3, 4, 5]} userRole={userRole} /> }/>
        <Route path="/add_holiday" element={ <ProtectedRoute element={<MasterPage><Add_Holiday /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/profile" element={ <ProtectedRoute element={<MasterPage><Profile /></MasterPage>} allowedRoles={[1, 2, 3, 4, 5]} userRole={userRole} /> }/>
        <Route path="/change_password" element={ <ProtectedRoute element={<MasterPage><Change_Password /></MasterPage>} allowedRoles={[1, 2, 3, 4, 5]} userRole={userRole} /> }/>
        <Route path="/class_manage" element={ <ProtectedRoute element={<MasterPage><Class_Manage /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/subject_manage" element={ <ProtectedRoute element={<MasterPage><Subject_Manage /></MasterPage>} allowedRoles={[1, 2]} userRole={userRole} /> }/>
        <Route path="/note_manage" element={ <ProtectedRoute element={<MasterPage><Note_Manage /></MasterPage>} allowedRoles={[1, 2, 3]} userRole={userRole} /> }/>
        <Route path="/materials" element={ <ProtectedRoute element={<MasterPage><Material /></MasterPage>} allowedRoles={[1, 2, 3, 4]} userRole={userRole} /> }/>
        <Route path="/add_material" element={ <ProtectedRoute element={<MasterPage><Add_Material /></MasterPage>} allowedRoles={[1, 3]} userRole={userRole} /> }/>
        <Route path="/add_leave" element={ <ProtectedRoute element={<MasterPage><Add_Leave /></MasterPage>} allowedRoles={[1, 2, 3, 4]} userRole={userRole} /> }/>
        <Route path="/leave_manage" element={ <ProtectedRoute element={<MasterPage><Leave_Manage /></MasterPage>} allowedRoles={[1, 2, 3, 4]} userRole={userRole} /> }/>

        {/* Catch-All Route for 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;