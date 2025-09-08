import React, { useMemo } from "react";
import { Table, Tag, ConfigProvider, theme } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
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

interface SessionRow {
  key: number;
  session: number;
  date: string;
  weekday: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  price: string | number;
  deposit: React.ReactNode;
}

export default function CalendarTable({ student }: CalendarTableProps) {
  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);

  if (!student || !student.sessions) {
    return <div className="text-gray-500">No session data available.</div>;
  }

  const data: SessionRow[] = (student.sessions ?? []).map((session, idx) => ({
    key: idx,
    session: idx + 1,
    date: new Date(session.date).toLocaleDateString("fa-IR"),
    weekday: getWeekDayFa(new Date(session.date)),
    startTime: session.startTime,
    endTime: session.endTime,
    attended: session.attended,
    price: session.price,
    deposit:
      idx + 1 > student.daysPerWeek * 4 ? (
        <Tag color="yellow">Payment required before this session!</Tag>
      ) : (
        <Tag color="green">Payment has been made.</Tag>
      ),
  }));

  const columns: ColumnsType<SessionRow> = [
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      align: "center",
      width: 50,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      width: 80,
    },
    {
      title: "Weekday",
      dataIndex: "weekday",
      key: "weekday",
      align: "center",
      width: 70,
    },
    {
      title: "Start",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
      width: 60,
    },
    {
      title: "End",
      dataIndex: "endTime",
      key: "endTime",
      align: "center",
      width: 60,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 90,
    },
    {
      title: "Deposit",
      dataIndex: "deposit",
      key: "deposit",
      align: "center",
      width: 190,
    },
  ];

  // فقط ایندکس‌هایی که attended=true هستند را انتخاب کن
  const selectedRowKeys = useMemo(
    () => data.filter((row) => row.attended).map((row) => row.key),
    [data]
  );

  const rowSelection: TableProps<SessionRow>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      // هر بار که چک‌باکس تغییر کند، toggleAttendance را صدا بزن
      data.forEach((row) => {
        const shouldBeAttended = selectedKeys.includes(row.key);
        if (row.attended !== shouldBeAttended) {
          toggleAttendance(student.id, row.key);
        }
      });
    },
    columnTitle: "Attendance",
    columnWidth: 70,
  };

  return (
    <div
      className="overflow-x-auto rounded-lg border border-gray-500"
      style={{ maxHeight: 300, overflowY: "auto" }}
    >
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Table: {
              colorPrimary: "#008080",
              algorithm: true,
            },
          },
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          bordered
          scroll={{ y: 250 }}
          rowSelection={rowSelection}
          rowClassName={(record) =>
            record.attended ? "bg-green-100 text-gray-400" : "text-white"
          }
        />
      </ConfigProvider>
    </div>
  );
}
