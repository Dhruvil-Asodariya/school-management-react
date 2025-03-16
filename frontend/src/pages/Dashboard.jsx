import { useState, useEffect } from "react";
import axios from "axios";
import Dashboard_Card from "../components/Dashboard_Card";

const Dashboard = () => {
  const [totals, setTotals] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });

  useEffect(() => {
    axios.get("http://localhost:8081/dashboard_totals")
      .then((response) => {
        console.log("Dashboard Totals:", response.data); // ✅ Debugging line
        setTotals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching dashboard totals:", error);
      });
  }, []);

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      <Dashboard_Card name="Students" total={totals.students} link="/student_manage" />
      <Dashboard_Card name="Teachers" total={totals.teachers} link="/faculty_manage" />
      <Dashboard_Card name="Parents" total="250" link="" />
      <Dashboard_Card name="Class" total={totals.classes} link="/class_manage" />
      <Dashboard_Card name="Subjects" total={totals.subjects} link="/subject_manage" />
    </div>
  );
};

export default Dashboard;
