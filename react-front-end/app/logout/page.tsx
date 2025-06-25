"use client";

import { useEffect } from "react";
import { logoutUser } from "@/utils/logout";

const LogoutPage = () => {
  useEffect(() => {
    logoutUser(); // call the reusable logic
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-medium text-gray-700">Logging you out...</p>
    </div>
  );
};

export default LogoutPage;
