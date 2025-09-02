"use client";
import { useStudentStore } from "../store/studentStore";

export default function StudentsInfo() {
  const students = useStudentStore((s) => s.students);

  if (students.length === 0)
    return <div className="text-gray-500">No students added yet.</div>;

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div key={student.id} className="bg-gray-800 p-4 rounded shadow">
          <div className="font-bold text-lg mb-2">{student.name}</div>
          <div>
            <b>Phone:</b> {student.phone || "-"}
          </div>
          <div>
            <b>Address:</b> {student.address}
          </div>
          <div>
            <b>Class type:</b> {student.classType}
          </div>
          <div>
            <b>Start time:</b> {student.startTime}
          </div>
          <div>
            <b>End time:</b> {student.endTime}
          </div>
          <div>
            <b>Duration:</b> {student.duration} hour(s)
          </div>
          <div>
            <b>Session price:</b> {student.price}
          </div>
          <div>
            <b>First session dates:</b>{" "}
            {student.firstSessionDates && student.firstSessionDates.length > 0
              ? student.firstSessionDates
                  .map((d) => new Date(d).toLocaleDateString("fa-IR"))
                  .join(", ")
              : "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
