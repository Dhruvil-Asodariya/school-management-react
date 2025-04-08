import { useState, useEffect } from "react";
import axios from "axios";
import Dashboard_Card from "../components/Dashboard_Card";

const Dashboard = () => {
  const [userSession, setUserSession] = useState(null);
  const [totals, setTotals] = useState({
    students: 0,
    faculty: 0,
    parent: 0,
    classes: 0,
    subjects: 0,
    pending_fees: 0,
  });

  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8081/session", { withCredentials: true });
      setUserSession(response.data.user);
    } catch (error) {
      console.error("No Active Session:", error.response?.data || error);
      setUserSession(false); // Set to false to indicate no session
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (userSession) { // ✅ Fetch totals only when session exists
      axios.get("http://localhost:8081/dashboard_totals", { withCredentials: true })
        .then((response) => {
          console.log("✅ API Response Data:", response.data);
          setTotals({
            students: response.data.students || 0,
            faculty: response.data.faculty || 0,
            parent: response.data.parent || 0,
            classes: response.data.classes || 0,
            subjects: response.data.subjects || 0,
            pending_fees: response.data.pending_fees || 0,
          });
        })
        .catch((error) => {
          console.error("❌ API Fetch Error:", error);
        });
    }
  }, [userSession]); // ✅ Only run when userSession is updated

  // 🛑 Prevent accessing `role` before session loads
  if (userSession === null) {
    return <div>Loading...</div>;
  }

  if (!userSession) {
    return <div>❌ Not authorized. Please log in.</div>;
  }

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {userSession.role === 1 || userSession.role === 3 ? (
        <>
          <Dashboard_Card name="Students" total={totals.students} link="/student_manage" />
          <Dashboard_Card name="Teachers" total={totals.faculty} link="/faculty_manage" />
          <Dashboard_Card name="Parents" total={totals.parent} link="/parent_manage" />
          <Dashboard_Card name="Class" total={totals.classes} link="/class_manage" />
          <Dashboard_Card name="Subjects" total={totals.subjects} link="/subject_manage" />
          <Dashboard_Card name="Pending Fee" total={totals.pending_fees} link="/fees_manage" />
        </>
      ) : userSession.role === 4 ? (
        <Dashboard_Card name="Pending Fee" total={totals.pending_fees} link="/pending_fees_manage" />
      ) : userSession.role === 5 ? (
        <Dashboard_Card name="Pending Fee" total={totals.pending_fees} link="/pending_fees_manage" />
      ) :  (
        <div>❌ Unauthorized access</div>
      )}
    </div>
  );
};

export default Dashboard;
