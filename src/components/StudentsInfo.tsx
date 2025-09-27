"use client";
import React, { useState, useMemo } from "react";
import { useStudentStore } from "../store/studentStore";
import {
  ConfigProvider,
  Input,
  theme,
  Button,
  Drawer,
  Radio,
  Slider,
  Select,
  Avatar,
} from "antd";
import {
  FilterOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  NumberOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  DollarOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ModalCustom from "../components/UI/ModalCustom";
const { Search } = Input;

export default function StudentsInfo() {
  const { t, i18n } = useTranslation();
  const students = useStudentStore((s) => s.students);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  //eslint-disable-next-line
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [closeBtnHover, setCloseBtnHover] = useState(false); //hover for close btn modal

  // فیلترها
  const [typeFilter, setTypeFilter] = useState<"all" | "online" | "in-person">(
    "all"
  );
  const [timeFilter, setTimeFilter] = useState<
    "all" | "morning" | "noon" | "evening"
  >("all");
  const [durationFilter, setDurationFilter] = useState<"all" | 1 | 2 | 3 | 4>(
    "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // مقدار اولیه رنج سنی
  const minAge = useMemo(() => {
    if (students.length === 0) return 0;
    return Math.min(...students.map((s) => Number(s.age) || 0));
  }, [students]);
  const maxAge = useMemo(() => {
    if (students.length === 0) return 100;
    return Math.max(...students.map((s) => Number(s.age) || 0));
  }, [students]);
  const [ageRange, setAgeRange] = useState<[number, number]>([minAge, maxAge]);

  // گزینه‌های فیلتر با ترجمه
  const TIME_FILTERS = [
    { label: t("studentInfo.all") || "All", value: "all" },
    {
      label: t("studentInfo.morning") || "Morning (6:00 - 13:00)",
      value: "morning",
    },
    { label: t("studentInfo.noon") || "Noon (13:00 - 16:00)", value: "noon" },
    { label: t("studentInfo.evening") || "Evening (16:00+)", value: "evening" },
  ];

  const DURATION_OPTIONS = [
    { label: t("studentInfo.all") || "All", value: "all" },
    { label: t("studentInfo.1hour") || "1 hour", value: 1 },
    { label: t("studentInfo.2hours") || "2 hours", value: 2 },
    { label: t("studentInfo.3hours") || "3 hours", value: 3 },
    { label: t("studentInfo.4hours") || "4 hours", value: 4 },
  ];

  // حداکثر قیمت داینامیک
  const maxPrice = useMemo(() => {
    if (students.length === 0) return 1000;
    return Math.max(...students.map((s) => Number(s.price) || 0));
  }, [students]);

  // مقدار اولیه اسلایدر قیمت
  useMemo(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // مقدار اولیه اسلایدر سن
  useMemo(() => {
    setAgeRange([minAge, maxAge]);
  }, [minAge, maxAge]);

  // فیلتر نهایی
  const filteredStudents = useMemo(() => {
    let result = students;

    // سرچ
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((student) => {
        return (
          student.name?.toLowerCase().includes(q) ||
          student.phone?.toLowerCase().includes(q) ||
          student.address?.toLowerCase().includes(q) ||
          student.classType?.toLowerCase().includes(q) ||
          (student.price && String(student.price).includes(q)) ||
          (q === "online" || q === "آنلاین"
            ? student.classType?.toLowerCase() === "online"
            : false) ||
          (q === "in-person" || q === "حضوری"
            ? student.classType?.toLowerCase() === "in-person"
            : false)
        );
      });
    }

    // نوع کلاس
    if (typeFilter !== "all") {
      result = result.filter((student) => student.classType === typeFilter);
    }

    // فیلتر زمان شروع
    if (timeFilter !== "all") {
      result = result.filter((student) => {
        if (!student.startTime) return false;
        const [h, m] = student.startTime.split(":").map(Number);
        const minutes = h * 60 + (m || 0);
        if (timeFilter === "morning") return minutes >= 360 && minutes < 780; // 6:00 - 13:00
        if (timeFilter === "noon") return minutes >= 780 && minutes < 960; // 13:00 - 16:00
        if (timeFilter === "evening") return minutes >= 960; // 16:00+
        return true;
      });
    }

    // فیلتر مدت زمان
    if (durationFilter !== "all") {
      result = result.filter(
        (student) => Number(student.duration) === durationFilter
      );
    }

    // فیلتر قیمت
    result = result.filter((student) => {
      const price = Number(student.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // فیلتر سن
    result = result.filter((student) => {
      const age = Number(student.age) || 0;
      return age >= ageRange[0] && age <= ageRange[1];
    });

    return result;
  }, [
    students,
    search,
    typeFilter,
    timeFilter,
    durationFilter,
    priceRange,
    ageRange,
  ]);

  if (students.length === 0)
    return (
      <div className="text-gray-500">
        {t("studentInfo.noStudent") || "No students added yet."}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Input: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
              Button: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
            },
          }}
        >
          <Search
            placeholder={
              t("studentInfo.searchPlaceholder") ||
              "Search by name, phone, address, type or price"
            }
            allowClear
            enterButton
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={setSearch}
            size="large"
            //style={{ maxWidth: 700 }}
          />
        </ConfigProvider>

        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Button: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
            },
          }}
        >
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterOpen(true)}
            className=""
            size="large"
          >
            {t("studentInfo.filters") || "Filters"}
          </Button>
        </ConfigProvider>
      </div>

      <div
        className={`overflow-y-auto max-h-[90vh] pt-5 ${
          i18n.language === "fa" ? "pl-5 pr-2" : "pr-5 pl-2"
        } [&::-webkit-scrollbar]:w-0.75
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`}
      >
        {/* Drawer فیلتر */}
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Drawer: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
              Radio: {
                colorPrimary: "#00bba7",
                buttonSolidCheckedActiveBg: "#00bba7",
                buttonSolidCheckedHoverBg: "#00bba7",
                algorithm: true,
              },
              Select: {
                colorPrimary: "#00bba7",
                hoverBorderColor: "#00bba7",
                optionSelectedBg: "#00675c",
                algorithm: true,
              },
              Slider: {
                colorPrimary: "#00bba7",
                colorBgElevated: "#00bba7",
                trackHoverBg: "#00675c",
                trackBg: "#00bba7",
                algorithm: true,
              },
              Button: {
                colorPrimary: "#00bba7",
                defaultHoverBorderColor: "#00bba7",
                colorPrimaryHover: "#00bba7",
                defaultActiveBorderColor: "#00675c",
                defaultActiveColor: "#00675c",
                algorithm: true,
              },
            },
          }}
        >
          <Drawer
            title={t("studentInfo.filterTitle") || "Filter Students"}
            placement={i18n.language === "fa" ? "left" : "right"}
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            width={340}
          >
            <div className="space-y-6">
              {/* نوع کلاس */}
              <div>
                <div className="font-semibold mb-2">
                  {t("studentInfo.classType") || "Class Type"}
                </div>
                <Radio.Group
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">
                    {t("studentInfo.all") || "All"}
                  </Radio.Button>
                  <Radio.Button value="online">
                    {t("studentForm.online") || "Online"}
                  </Radio.Button>
                  <Radio.Button value="in-person">
                    {t("studentForm.inPerson") || "In-Person"}
                  </Radio.Button>
                </Radio.Group>
              </div>
              {/* زمان شروع */}
              <div>
                <div className="font-semibold mb-2">
                  {t("studentInfo.startTime") || "Start Time"}
                </div>
                <Select
                  value={timeFilter}
                  onChange={setTimeFilter}
                  style={{ width: "100%" }}
                  options={TIME_FILTERS}
                />
              </div>
              {/* مدت زمان */}
              <div>
                <div className="font-semibold mb-2">
                  {t("studentInfo.duration") || "Duration"}
                </div>
                <Select
                  value={durationFilter}
                  onChange={setDurationFilter}
                  style={{ width: "100%" }}
                  options={DURATION_OPTIONS}
                />
              </div>
              {/* فیلتر سن */}
              <div>
                <div className="font-semibold mb-2">
                  {t("studentInfo.ageRange") || "Age Range"}
                </div>
                <div dir={i18n.language === "fa" ? "rtl" : "ltr"}>
                  <Slider
                    range
                    min={minAge}
                    max={maxAge}
                    value={
                      i18n.language === "fa"
                        ? [
                            maxAge - (ageRange[1] - minAge),
                            maxAge - (ageRange[0] - minAge),
                          ]
                        : ageRange
                    }
                    onChange={(v) => {
                      if (i18n.language === "fa") {
                        // v: [right, left] → باید برعکس ذخیره شود
                        const [right, left] = v as [number, number];
                        setAgeRange([
                          maxAge - (left - minAge),
                          maxAge - (right - minAge),
                        ]);
                      } else {
                        setAgeRange(v as [number, number]);
                      }
                    }}
                    tooltip={{
                      formatter: (v) =>
                        i18n.language === "fa"
                          ? `${maxAge - ((v ?? minAge) - minAge)} ${
                              t("studentForm.age") || "سال"
                            }`
                          : `${v} ${t("studentForm.age") || "سال"}`,
                    }}
                    step={1}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {ageRange[0]} {t("studentForm.age") || "سال"}
                  </span>
                  <span>
                    {ageRange[1]} {t("studentForm.age") || "سال"}
                  </span>
                </div>
              </div>
              {/* قیمت */}
              <div>
                <div className="font-semibold mb-2">
                  {t("studentInfo.priceRange") || "Price Range"}
                </div>
                <div dir={i18n.language === "fa" ? "rtl" : "ltr"}>
                  <Slider
                    range
                    min={0}
                    max={maxPrice}
                    value={
                      i18n.language === "fa"
                        ? [maxPrice - priceRange[1], maxPrice - priceRange[0]]
                        : priceRange
                    }
                    onChange={(v) => {
                      if (i18n.language === "fa") {
                        const [right, left] = v as [number, number];
                        setPriceRange([maxPrice - left, maxPrice - right]);
                      } else {
                        setPriceRange(v as [number, number]);
                      }
                    }}
                    tooltip={{
                      formatter: (v) =>
                        i18n.language === "fa"
                          ? `${maxPrice - (v ?? 0)} ${
                              t("studentInfo.toman") || "تومان"
                            }`
                          : `${v ?? 0} ${t("studentInfo.toman") || "تومان"}`,
                    }}
                    step={1000}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {priceRange[0]} {t("studentInfo.toman") || "تومان"}
                  </span>
                  <span>
                    {priceRange[1]} {t("studentInfo.toman") || "تومان"}
                  </span>
                </div>
              </div>

              <Button
                block
                onClick={() => {
                  setTypeFilter("all");
                  setTimeFilter("all");
                  setDurationFilter("all");
                  setPriceRange([0, maxPrice]);
                  setAgeRange([minAge, maxAge]);
                }}
              >
                {t("studentInfo.resetFilters") || "Reset Filters"}
              </Button>
            </div>
          </Drawer>
        </ConfigProvider>

        {filteredStudents.length === 0 && (
          <div className="text-gray-400">
            {t("studentInfo.noResults") || "No results found."}
          </div>
        )}

        {filteredStudents.map((student) => (
          <div
            key={student.mongoId || student.id}
            className={`bg-neutral-900 px-3 py-2 flex items-center relative overflow-hidden mb-5 shadow-md ${
              i18n.language !== "fa"
                ? "rounded-bl-[50px] rounded-r-2xl rounded-tl-[50px]"
                : "rounded-br-[50px] rounded-l-2xl rounded-tr-[50px]"
            }`}
            style={{
              boxShadow: "0px 0px 7px #989898",

              flexDirection: i18n.language === "fa" ? "row-reverse" : "row",
            }}
            dir={i18n.language === "fa" ? "rtl" : "ltr"}
          >
            {/* دکمه فلش فارسی */}
            {i18n.language === "fa" && (
              <button
                className="absolute left-0 top-0 bottom-0 w-[50px] bg-teal-600 flex items-center justify-center border-none outline-none cursor-pointer transition-all hover:bg-teal-700 active:bg-teal-800"
                style={{
                  height: "100%",
                  boxShadow: "none",
                }}
                onClick={() => {
                  setSelectedStudent(student);
                  setModalOpen(true);
                }}
              >
                <span className="text-white text-2xl flex items-center justify-center">
                  <ArrowLeftOutlined />
                </span>
              </button>
            )}

            {/* آواتار و اطلاعات */}
            <div
              className={`flex flex-1 items-center ${
                i18n.language === "fa" ? "justify-end" : "justify-start"
              }`}
            >
              {/* آواتار */}
              <Avatar
                style={{
                  backgroundColor: "oklch(98.4% 0.014 180.72)",
                  color: "oklch(77.7% 0.152 181.912)",
                  fontSize: "35px",
                  fontWeight: 600,
                  boxShadow: "0px 0px 10px #00bba7",
                  display: "flex",
                  alignItems: "center",
                  marginLeft: i18n.language === "fa" ? "20px" : undefined,
                  marginRight: i18n.language === "en" ? "20px" : undefined,
                }}
                size={60}
                //className={i18n.language === "fa" ? "ml-4" : "mr-4"}
              >
                {student.name?.[0]?.toUpperCase() || "Y"}
              </Avatar>
              {/* اسم و اطلاعات */}
              <div
                className={`flex flex-col flex-1 ${
                  i18n.language === "fa" ? "pl-[60px]" : "pr-[60px]"
                }`}
              >
                <div
                  className={`font-bold text-2xl mb-2 text-teal-200 break-words ${
                    i18n.language === "fa" ? "text-right" : "text-left"
                  }`}
                >
                  {student.name}
                </div>
                <div
                  className={`flex w-full justify-between items-center mt-1 flex-wrap gap-y-2`}
                  dir={i18n.language === "fa" ? "rtl" : "ltr"}
                >
                  {[
                    <div className="w-full sm:w-auto" key="phone">
                      <span className="text-teal-400 text-[16px]">
                        {t("studentForm.phone") || "Phone"}:
                      </span>
                      <span
                        className={`text-sm break-all ${
                          i18n.language === "fa" ? "mr-1" : "ml-1"
                        }`}
                      >
                        {student.phone
                          ? student.phone.split("").map((char, idx) =>
                              /\d/.test(char) ? (
                                <span
                                  key={idx}
                                  className="inline-block mx-[0.5px]"
                                >
                                  {char}
                                </span>
                              ) : (
                                <span key={idx}>{char}</span>
                              )
                            )
                          : "-"}
                      </span>
                    </div>,
                    <div className="w-full sm:w-auto" key="classType">
                      <span className="text-teal-400 text-[16px]">
                        {t("studentForm.classType") || "Class type"}:
                      </span>
                      <span
                        className={`text-sm ${
                          i18n.language === "fa" ? "mr-1" : "ml-1"
                        }`}
                      >
                        {student.classType === "online"
                          ? t("studentForm.online")
                          : student.classType === "in-person"
                          ? t("studentForm.inPerson")
                          : student.classType}
                      </span>
                    </div>,
                    <div className="w-full sm:w-auto" key="time">
                      <span className="text-teal-400 text-[16px]">
                        {t("studentInfo.time") || "Time"}:
                      </span>
                      <span
                        className={`text-sm ${
                          i18n.language === "fa" ? "mr-1" : "ml-1"
                        }`}
                      >
                        {student.startTime}{" "}
                        <span className="text-xs">
                          {t("studentInfo.until")}
                        </span>{" "}
                        {student.endTime}
                      </span>
                    </div>,
                    <div className="w-full sm:w-auto" key="duration">
                      <span className="text-teal-400 text-[16px]">
                        {t("studentForm.durationHours") || "Duration"}:
                      </span>
                      <span
                        className={`text-sm ${
                          i18n.language === "fa" ? "mr-1" : "ml-1"
                        }`}
                      >
                        {student.duration} {t("studentList.hour") || "hour(s)"}
                      </span>
                    </div>,
                  ].reduce((acc: React.ReactNode[], curr, idx, arr) => {
                    acc.push(curr);
                    if (idx < arr.length - 1) {
                      acc.push(
                        <div
                          key={`divider-${idx}`}
                          className="hidden sm:flex h-7 items-center"
                          aria-hidden
                        >
                          <div className="border-l border-gray-500 opacity-30 h-full mx-3" />
                        </div>
                      );
                    }
                    return acc;
                  }, [])}
                </div>
              </div>
            </div>

            {/* دکمه فلش انگلیسی */}
            {i18n.language !== "fa" && (
              <button
                className="absolute right-0 top-0 bottom-0 w-[50px] bg-teal-600 flex items-center justify-center border-none outline-none cursor-pointer transition-all hover:bg-teal-700 active:bg-teal-800"
                style={{
                  height: "100%",
                  boxShadow: "none",
                }}
                onClick={() => {
                  setSelectedStudent(student);
                  setModalOpen(true);
                }}
              >
                <span className="text-white text-2xl flex items-center justify-center">
                  <ArrowRightOutlined />
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Button: {
              colorPrimary: "#00bba7",
              algorithm: true,
            },
          },
        }}
      >
        {/* مودال نمایش اطلاعات دانش‌آموز */}
        <ModalCustom
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          width={550}
          title=""
          footer={
            <Button
              block
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: 10,
                height: 35,
                border: closeBtnHover
                  ? "1px solid #d32626"
                  : "1px solid #ad1616",
                color: closeBtnHover ? "#d32626" : "#ad1616",
                transition: " color 0.3s",
                fontSize: "16px",
              }}
              onMouseEnter={() => setCloseBtnHover(true)}
              onMouseLeave={() => setCloseBtnHover(false)}
            >
              {t("studentInfo.close")}
            </Button>
          }
        >
          {selectedStudent && (
            <div>
              <p className="mb-5 text-center text-2xl sm:text-3xl text-teal-300 font-semibold">
                {t("studentInfo.fullInfo")}
              </p>
              <div
                className="space-y-0 text-base overflow-y-auto max-h-[70vh] [&::-webkit-scrollbar]:w-0.5
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
              >
                {/* نام */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <UserOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.fullName") || "Full Name"}:
                  </span>
                  <span className="font-light text-[15px] break-all">
                    {selectedStudent.name}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* تلفن */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <PhoneOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.phone") || "Phone"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.phone}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* آدرس */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <HomeOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.address") || "Address"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.address}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* سن */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <NumberOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.age") || "Age"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.age}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* نوع کلاس */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <LaptopOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.classType") || "Class Type"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.classType === "online"
                      ? t("studentForm.online")
                      : selectedStudent.classType === "in-person"
                      ? t("studentForm.inPerson")
                      : selectedStudent.classType}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />
                {/* لینک جلسه آنلاین */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <LaptopOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.onlineLink") || "Online Link"}:
                  </span>
                  {selectedStudent.onlineLink ? (
                    <span className="break-all text-sm">
                      <a
                        href={selectedStudent.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-light break-all"
                      >
                        {selectedStudent.onlineLink}
                      </a>
                    </span>
                  ) : (
                    <span className="font-light text-white text-[15px]">-</span>
                  )}
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* زمان */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <ClockCircleOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentInfo.time") || "Time"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.startTime} {t("studentInfo.until")}{" "}
                    {selectedStudent.endTime}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* مدت زمان */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <FieldTimeOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentForm.durationHours") || "Duration"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.duration}{" "}
                    {t("studentList.hour") || "hour(s)"}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* قیمت */}
                <div className="flex items-center gap-2">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <DollarOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md">
                    {t("studentForm.sessionPrice") || "Price"}:
                  </span>
                  <span className="font-light text-white text-[15px]">
                    {selectedStudent.price}{" "}
                    <span className="text-xs">
                      {t("studentInfo.toman") || "Toman"}
                    </span>
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* درآمد ماهیانه */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <FieldTimeOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md">
                    {t("studentInfo.monthlyIncome") || "Monthly Income"}:
                  </span>
                  <span className="font-bold text-green-500 text-[15px]">
                    {(() => {
                      const sessionPrice = Number(selectedStudent.price) || 0;
                      const daysPerWeek =
                        Number(selectedStudent.daysPerWeek) || 0;
                      const total = sessionPrice * daysPerWeek * 4;
                      return (
                        <>
                          {total.toLocaleString()}{" "}
                          <span className="text-xs font-light text-green-500 font-sans">
                            {t("studentInfo.toman") || "Toman"}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                </div>

                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* تعداد روز در هفته */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <BarsOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentInfo.classDaysPerWeek") || "Days/Week"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.daysPerWeek}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <CalendarOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentInfo.firstSessionDates") || "First Session(s)"}:
                  </span>
                  <span className="font-light text-white text-[13px] break-all">
                    {selectedStudent.firstSessionDates &&
                    selectedStudent.firstSessionDates.length > 0
                      ? selectedStudent.firstSessionDates
                          .map((d: Date) => {
                            const dateObj = new Date(d);
                            const dateStr = dateObj.toLocaleDateString(
                              i18n.language === "fa" ? "fa-IR" : "en-US"
                            );
                            const weekday = dateObj.toLocaleDateString(
                              i18n.language === "fa" ? "fa-IR" : "en-US",
                              { weekday: "long" }
                            );
                            return `${weekday} (${dateStr})`;
                          })
                          .join("، ")
                      : "-"}
                  </span>
                </div>
                <div className="border-t border-gray-700 opacity-40 my-2" />

                {/* روزهای کلاس */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <div className="bg-teal-900 px-1.5 py-1.5 rounded-full flex items-center justify-center">
                    <ScheduleOutlined
                      className="text-lg"
                      style={{ color: "#54d1c4" }}
                    />
                  </div>
                  <span className="font-semibold text-teal-500 text-sm sm:text-md whitespace-nowrap">
                    {t("studentInfo.classDays") || "Class Days"}:
                  </span>
                  <span className="font-light text-white text-[15px] break-all">
                    {selectedStudent.firstSessionDates &&
                    selectedStudent.firstSessionDates.length > 0
                      ? Array.from(
                          new Set(
                            selectedStudent.firstSessionDates.map((d: Date) =>
                              new Date(d).toLocaleDateString(
                                i18n.language === "fa" ? "fa-IR" : "en-US",
                                { weekday: "long" }
                              )
                            )
                          )
                        ).join("، ")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ModalCustom>
      </ConfigProvider>
    </div>
  );
}
