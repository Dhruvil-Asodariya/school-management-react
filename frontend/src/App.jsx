import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import MasterPage from "./MasterPage";
import Dashboard from "./pages/Dashboard";
import Student_Manage from "./pages/Student_Manage";
import Add_Student from "./pages/Add_Student";
import Add_Faculty from "./pages/Add_Faculty ";
import FacultyManage from "./pages/Faculty_Manage";
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

const App = () => {
  
  return (
    <Router>
      <Routes>
        {/* Wrap routes with MasterPage */}
        <Route path="/" element={ <Login /> } />
        <Route path="/logout" element={ <Logout /> } />
        <Route path="/dashboard" element={ <MasterPage><Dashboard /></MasterPage> }/>
        <Route path="/student_manage" element={ <MasterPage><Student_Manage /></MasterPage> }/>
        <Route path="/add_student" element={ <MasterPage><Add_Student /></MasterPage> }/>
        <Route path="/add_faculty" element={ <MasterPage><Add_Faculty /></MasterPage> }/>
        <Route path="/faculty_manage" element={ <MasterPage><FacultyManage /></MasterPage> }/>
        <Route path="/holiday" element={ <MasterPage><Holiday /></MasterPage> }/>
        <Route path="/add_holiday" element={ <MasterPage><Add_Holiday /></MasterPage> }/>
        <Route path="/profile" element={ <MasterPage><Profile/></MasterPage> }/>
        <Route path="/change_password" element={ <MasterPage><Change_Password /></MasterPage> }/>
        <Route path="/class_manage" element={ <MasterPage><Class_Manage /></MasterPage> }/>
        <Route path="/subject_manage" element={ <MasterPage><Subject_Manage /></MasterPage> }/>
        <Route path="/note_manage" element={ <MasterPage><Note_Manage /></MasterPage> }/>
        <Route path="/materials" element={ <MasterPage><Material /></MasterPage> }/>
        <Route path="/add_material" element={ <MasterPage><Add_Material /></MasterPage> }/>
        <Route path="/add_leave" element={ <MasterPage><Add_Leave /></MasterPage> }/>
        <Route path="/leave_manage" element={ <MasterPage><Leave_Manage /></MasterPage> }/>
      </Routes>
    </Router>
  );
};

export default App;