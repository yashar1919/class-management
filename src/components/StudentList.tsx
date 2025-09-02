"use client";
import { useStudentStore } from "../store/studentStore";

export default function StudentList() {
  const students = useStudentStore((s) => s.students);
  const removeStudent = useStudentStore((s) => s.removeStudent);

  if (students.length === 0)
    return (
      <div className="text-gray-500">No students have been added yet.</div>
    );

  return (
    <ul className="space-y-2">
      {students.map((student) => (
        <li
          key={student.id}
          className="flex items-center justify-between bg-gray-500 p-2 rounded shadow"
        >
          <span>
            <span className="font-bold">{student.name}</span>
            {student.phone && (
              <span className="text-sm text-gray-300 ml-2">
                ({student.phone})
              </span>
            )}
          </span>
          <button
            onClick={() => removeStudent(student.id)}
            className="bg-red-400 text-white px-2 py-1 rounded"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
