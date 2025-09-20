"use client";
import { useState, useMemo } from "react";
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
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
const { Search } = Input;

export default function StudentsInfo() {
  const { t, i18n } = useTranslation();
  const students = useStudentStore((s) => s.students);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

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

    return result;
  }, [students, search, typeFilter, timeFilter, durationFilter, priceRange]);

  if (students.length === 0)
    return (
      <div className="text-gray-500">
        {t("studentInfo.noStudent") || "No students added yet."}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
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
            {/* قیمت */}
            <div>
              <div className="font-semibold mb-2">
                {t("studentInfo.priceRange") || "Price Range"}
              </div>
              <Slider
                range
                min={0}
                max={maxPrice}
                value={priceRange}
                onChange={(v) => setPriceRange(v as [number, number])}
                tooltip={{
                  formatter: (v) => `${v} ${t("studentInfo.toman") || "تومان"}`,
                }}
                step={1000}
              />
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
          key={student.id}
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
              // onClick={() => ...}
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
                <div className="w-full sm:w-auto">
                  <span className="text-teal-400 text-[16px]">
                    {t("studentForm.phone") || "Phone"}:
                  </span>
                  <span
                    className={`text-sm break-all ${
                      i18n.language === "fa" ? "mr-1" : "ml-1"
                    }`}
                  >
                    {student.phone || "-"}
                  </span>
                </div>
                <div className="w-full sm:w-auto">
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
                </div>
                <div className="w-full sm:w-auto">
                  <span className="text-teal-400 text-[16px]">
                    {t("studentInfo.time") || "Time"}:
                  </span>
                  <span
                    className={`text-sm ${
                      i18n.language === "fa" ? "mr-1" : "ml-1"
                    }`}
                  >
                    {student.startTime}{" "}
                    <span className="text-xs">{t("studentInfo.until")}</span>{" "}
                    {student.endTime}
                  </span>
                </div>
                <div className="w-full sm:w-auto">
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
                </div>
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
              // onClick={() => ...}
            >
              <span className="text-white text-2xl flex items-center justify-center">
                <ArrowRightOutlined />
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
