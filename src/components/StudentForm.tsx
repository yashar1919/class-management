"use client";
import { useState } from "react";
import { useStudentStore } from "../store/studentStore";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function StudentForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [classType, setClassType] = useState("offline");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(1);
  //eslint-disable-next-line
  const [selectedDates, setSelectedDates] = useState<any[]>([]);

  const addStudent = useStudentStore((s) => s.addStudent);

  // End time calculation
  const endTime = startTime
    ? (() => {
        const [h, m] = startTime.split(":").map(Number);
        const endH = h + duration;
        return `${endH.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}`;
      })()
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !address.trim() ||
      !startTime ||
      !price ||
      selectedDates.length !== daysPerWeek
    )
      return;

    // Save all selected dates as first session days
    addStudent({
      name,
      phone,
      address,
      classType,
      startTime,
      endTime,
      duration,
      price,
      firstSessionDates: selectedDates.map((d) => d?.toDate?.() ?? d),
      daysPerWeek,
      multiDay,
      sessions: [],
    });

    setName("");
    setAddress("");
    setClassType("offline");
    setStartTime("");
    setDuration(1);
    setPrice("");
    setPhone("");
    setMultiDay(false);
    setDaysPerWeek(1);
    setSelectedDates([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 mb-6 bg-slate-800 p-6 rounded shadow"
    >
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border rounded px-2 py-1"
        required
      />
      <div className="flex gap-4 items-center">
        <label>Class type:</label>
        <select
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <label>Start time:</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border rounded px-2 py-1"
          required
        />
        <label>Duration (hours):</label>
        <input
          type="number"
          min={1}
          max={4}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
          required
        />
        <label>End time:</label>
        <input
          type="time"
          value={endTime}
          readOnly
          className="border rounded pl-2 py-1 bg-gray-600"
        />
      </div>
      <div className="flex gap-2 items-center">
        <label>
          <input
            type="checkbox"
            checked={multiDay}
            onChange={() => {
              setMultiDay((v) => !v);
              setDaysPerWeek(1);
              setSelectedDates([]);
            }}
            className="mr-2"
          />
          Multi-day class per week
        </label>
        {multiDay && (
          <div className="flex gap-2 items-center">
            <label>Days per week:</label>
            <input
              type="number"
              min={1}
              max={7}
              value={daysPerWeek}
              onChange={(e) => {
                setDaysPerWeek(Number(e.target.value));
                setSelectedDates([]);
              }}
              className="border rounded px-2 py-1 w-16"
              required
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <label>
          {multiDay
            ? `Select ${daysPerWeek} days (first session dates):`
            : "Select first session date:"}
        </label>
        <DatePicker
          value={multiDay ? selectedDates : selectedDates[0] ?? null}
          //eslint-disable-next-line
          onChange={(dates: any) => {
            if (multiDay) {
              if (Array.isArray(dates) && dates.length <= daysPerWeek) {
                setSelectedDates(dates);
              }
            } else {
              setSelectedDates(dates ? [dates] : []);
            }
          }}
          calendar={persian}
          locale={persian_fa}
          format="YYYY/MM/DD"
          highlightToday
          multiple={multiDay}
          numberOfMonths={1}
          className="border rounded px-2 py-1"
          placeholder={
            multiDay ? `Pick ${daysPerWeek} days` : "Pick first session date"
          }
          minDate={undefined}
          maxDate={undefined}
          disabled={false}
          onOpen={() => setSelectedDates([])}
        />
      </div>
      <div className="flex gap-2 items-center">
        <label>Session price:</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-2 py-1 w-32"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-teal-500 text-white px-4 py-2 rounded mt-2"
        disabled={selectedDates.length !== daysPerWeek}
      >
        Add student
      </button>
    </form>
  );
}
