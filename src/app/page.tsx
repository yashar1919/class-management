import Tabs from "../components/Tabs";
import StudentForm from "../components/StudentForm";
import StudentList from "../components/StudentList";
import CalendarTable from "../components/CalendarTable";
import StudentsInfo from "../components/StudentsInfo";

export default function Home() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-center text-4xl font-bold text-teal-500 mb-8">
        Class Management
      </h1>
      <Tabs>
        {/* Tab 1: Class Management */}
        <div>
          <StudentForm />
          <StudentList />
          <CalendarTable />
        </div>
        {/* Tab 2: Students Info */}
        <StudentsInfo />
      </Tabs>
    </div>
  );
}
