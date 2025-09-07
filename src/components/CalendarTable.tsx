"use client";
import { Student, useStudentStore } from "../store/studentStore";

const weekDaysFa: Record<string, string> = {
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
  Saturday: "شنبه",
};

function getWeekDayFa(date: Date) {
  const en = date.toLocaleDateString("en-US", { weekday: "long" });
  return weekDaysFa[en] || en;
}

type CalendarTableProps = {
  student: Student;
};

export default function CalendarTable({ student }: CalendarTableProps) {
  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);

  if (!student || !student.sessions) {
    return <div className="text-gray-500">No session data available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      {/* <table className="w-full text-center border-2 border-slate-500 bg-gray-800"> */}
      <table className="w-full text-center border-2 border-slate-500 bg-neutral-800">
        <thead>
          {/* <tr className="bg-gray-900 text-white"> */}
          <tr className="bg-black text-white">
            <th className="px-4 py-2">Session</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Weekday</th>
            <th className="px-4 py-2">Start</th>
            <th className="px-4 py-2">End</th>
            <th className="px-4 py-2">Attendance</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Deposit</th>
          </tr>
        </thead>
        <tbody>
          {(student.sessions ?? []).map((session, idx) => (
            <tr
              key={idx}
              className={`border-b transition-all ${
                session.attended ? "bg-green-100 text-gray-400" : "text-white"
              }`}
              style={session.attended ? { opacity: 0.7 } : {}}
            >
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2">
                {new Date(session.date).toLocaleDateString("fa-IR")}
              </td>
              <td className="px-4 py-2">
                {getWeekDayFa(new Date(session.date))}
              </td>
              <td className="px-4 py-2">{session.startTime}</td>
              <td className="px-4 py-2">{session.endTime}</td>
              <td className="px-4 py-2 flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  checked={session.attended}
                  onChange={() => toggleAttendance(student.id, idx)}
                />
                {session.attended && (
                  <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    برگزار شد
                  </span>
                )}
              </td>
              <td className="px-4 py-2">{session.price}</td>
              <td className="px-4 py-2">
                {idx + 1 > student.daysPerWeek * 4 ? ( // بعد از 4 هفته payment required
                  <span className="bg-yellow-400 text-yellow-800 px-2 rounded text-xs">
                    Payment required before this session!
                  </span>
                ) : (
                  <span className="bg-green-400 text-green-800 px-2 rounded text-xs">
                    Payment has been made.
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
