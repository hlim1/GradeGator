"use client";

import useIdleLogout from "@/hooks/useIdleLogout";

export default function IdleLogoutWrapper({ children }: { children: React.ReactNode }) {
  const isBrowser = typeof window !== "undefined";
  const accessToken = isBrowser ? localStorage.getItem("accessToken") : null;

  if (!accessToken) {
    return <>{children}</>;
  }

  useIdleLogout(); 

  return <>{children}</>;
}
