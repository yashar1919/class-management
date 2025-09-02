/* "use client";
import { useState } from "react";
import DatePicker from "react-multi-date-picker";
//import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useStudentStore } from "../store/studentStore";

type Session = {
  //eslint-disable-next-line
  date: any;
  attended: boolean;
};

type StudentSessions = {
  [studentId: string]: Session[];
};

export default function CalendarTable() {
  const students = useStudentStore((s) => s.students);
  const [sessions, setSessions] = useState<StudentSessions>({});
  //eslint-disable-next-line
  const handleDatesChange = (studentId: string, dates: any[]) => {
    setSessions((prev) => ({
      ...prev,
      [studentId]: dates.map((date, idx) => ({
        date,
        attended: prev[studentId]?.[idx]?.attended || false,
      })),
    }));
  };

  const handleAttend = (studentId: string, idx: number) => {
    setSessions((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((session, i) =>
        i === idx ? { ...session, attended: !session.attended } : session
      ),
    }));
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-teal-600 mb-4">Calendar</h2>
      {students.length === 0 && (
        <div className="text-gray-400">No students have been added yet.</div>
      )}
      {students.map((student) => (
        <div key={student.id} className="mb-8 p-4 border rounded shadow">
          <div className="font-bold mb-2">{student.name}</div>
          <DatePicker
            value={sessions[student.id]?.map((s) => s.date) || []}
            //eslint-disable-next-line
            onChange={(dates: any) => handleDatesChange(student.id, dates)}
            calendar={persian}
            locale={persian_fa}
            multiple
            format="YYYY/MM/DD"
            //showOtherDays
            highlightToday
            weekDays={["ش", "ی", "د", "س", "چ", "پ", "ج"]}
            //containerClassName="calendar-custom"
            numberOfMonths={1}
            weekStartDayIndex={0}
            monthYearSeparator={" "}
            headerOrder={["LEFT_BUTTON", "MONTH_YEAR", "RIGHT_BUTTON"]}
            className="mb-4"
          />
          <table className="w-full text-center border mt-4">
            <thead>
              <tr className="bg-gray-700">
                <th>Meeting</th>
                <th>Date</th>
                <th>Attendance</th>
                <th>Deposit</th>
              </tr>
            </thead>
            <tbody>
              {sessions[student.id]?.map((session, idx) => (
                <tr key={idx} className="border-b">
                  <td>{idx + 1}</td>
                  <td>
                    {session.date?.format?.("YYYY/MM/DD") ??
                      session.date?.toString?.()}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={session.attended}
                      onChange={() => handleAttend(student.id, idx)}
                    />
                  </td>
                  <td>
                    {(idx + 1) % 4 === 0 && (
                      <span className="bg-yellow-400 text-yellow-800 px-2 rounded">
                        قبل از این جلسه باید واریزی انجام شود!
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
} */

"use client";
import { useStudentStore } from "../store/studentStore";

export default function CalendarTable() {
  const students = useStudentStore((s) => s.students);
  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);

  if (students.length === 0)
    return <div className="text-gray-500">No students added yet.</div>;

  return (
    <div className="mt-10">
      {students.map((student) => (
        <div
          key={student.id}
          className="mb-8 p-4 border rounded shadow bg-gray-900"
        >
          <div className="font-bold mb-2 text-white">{student.name}</div>
          <table className="w-full text-center border mt-4">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th>Session</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Attendance</th>
                <th>Price</th>
                <th>Deposit</th>
              </tr>
            </thead>
            <tbody>
              {(student.sessions ?? []).map((session, idx) => (
                <tr key={idx} className="border-b">
                  <td>{idx + 1}</td>
                  <td>{new Date(session.date).toLocaleDateString("fa-IR")}</td>
                  <td>{session.startTime}</td>
                  <td>{session.endTime}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={session.attended}
                      onChange={() => toggleAttendance(student.id, idx)}
                    />
                  </td>
                  <td>{session.price}</td>
                  <td>
                    {(idx + 1) % 4 === 0 && (
                      <span className="bg-yellow-400 text-yellow-800 px-2 rounded">
                        Payment required before this session!
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
