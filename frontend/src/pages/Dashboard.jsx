import Dashboard_Card from "../components/Dashboard_Card";

const Dashboard = () => {
  return (
    <>
      <div className="flex flex-wrap gap-6 justify-start">
        {/* Students */}
        <Dashboard_Card name="Students" total="250" link="/student_manage" />

        {/* Teachers */}
        <Dashboard_Card name="Teachers" total="25" link="/faculty_manage" />

        {/* Parents */}
        <Dashboard_Card name="Parents" total="250" link="" />

        {/* Class */}
        <Dashboard_Card name="Class" total="10" link="/class_manage" />

        {/* Subjects */}
        <Dashboard_Card name="Subjects" total="12" link="/subject_manage" />
      </div>
    </>
  );
};

export default Dashboard;