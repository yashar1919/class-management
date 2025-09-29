"use client";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // ثبت‌نام موفق، به صفحه لاگین برو
        window.location.href = "/login";
      } else {
        const data = await res.json();
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.log(err, "Signup error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-neutral-900">
      <form
        onSubmit={handleSignup}
        className="bg-neutral-950 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-teal-400 text-center">
          ثبت‌نام
        </h2>
        <input
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded bg-neutral-800 text-white"
          required
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-neutral-800 text-white"
          required
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded transition"
        >
          ثبت‌نام
        </button>
        <a href="/login" className="text-teal-400 text-center hover:underline">
          قبلاً ثبت‌نام کرده‌اید؟ ورود
        </a>
      </form>
    </div>
  );
}
