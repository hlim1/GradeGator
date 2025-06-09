"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear session data
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("instructorId");

    // Redirect to login
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-medium text-gray-700">Logging you out...</p>
    </div>
  );
};

export default LogoutPage;
