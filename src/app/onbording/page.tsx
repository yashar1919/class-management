"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Image1 from "../onbording/image-1.png";
import Image2 from "../onbording/image-2.png";

const steps = [
  {
    title: "خوش آمدید!",
    desc: "کلاسکو همراه شما در مدیریت هوشمند کلاس‌هاست. با تمرکز بر آموزش، بگذارید ما مدیریت را برایتان ساده کنیم.",
  },
  {
    title: "همه ابزارها در یک‌جا",
    desc: "ثبت و مدیریت دانش‌آموزان، برنامه‌ریزی جلسات، ارسال پیامک و گزارش‌گیری حرفه‌ای، همه در یک اپلیکیشن ساده و سریع.",
  },
  {
    title: "شروع کنید",
    desc: "همین حالا ثبت‌نام کنید و کلاس‌های خود را هوشمندانه پیش ببرید که تجربه‌ای متفاوت از مدیریت کلاس را آغاز کنید...",
  },
];

const images = [Image1, Image2, Image1];

export default function OnbordingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else {
      localStorage.setItem("onboarding-shown", "1");
      router.push("/signup");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 to-neutral-900 px-4">
      <Image
        src={images[step]}
        alt="Welcome Illustration"
        width={320}
        className="mb-8"
      />
      <div
        className="flex flex-col justify-center items-center"
        style={{ direction: "rtl" }}
      >
        <h1 className="text-3xl font-bold text-teal-300 my-4">
          {steps[step].title}
        </h1>
        <p className="text-gray-300 text-center max-w-md mb-10">
          {steps[step].desc}
        </p>
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold w-full py-2 rounded-xl text-lg transition"
          onClick={handleNext}
        >
          {step < steps.length - 1 ? "بعدی" : "شروع کنید"}
        </button>
        {/* نمایش نقطه‌های مرحله */}
        <div className="flex gap-4 mt-8">
          {steps.map((_, idx) => (
            <span
              key={idx}
              onClick={() => {
                if (idx < step) setStep(idx);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                idx === step
                  ? "bg-teal-400 scale-125"
                  : idx < step
                    ? "bg-teal-700 opacity-80"
                    : "bg-gray-600"
              }`}
              style={{ transition: "all 0.2s" }}
              title={steps[idx].title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
