import React from "react";

const Profile = () => {
  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("userId") : "";

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <h1 className="text-3xl text-gray-300 font-bold mb-10">Profile</h1>
      <p className="text-md text-gray-400 mb-2">
        Logged in as:
        <span className="font-mono text-teal-400 font-semibold text-xl mx-3">
          {userEmail || "Unknown"}
        </span>
      </p>
    </div>
  );
};

export default Profile;
