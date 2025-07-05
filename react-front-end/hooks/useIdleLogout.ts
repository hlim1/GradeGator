"use client";
import { useEffect, useRef } from "react";
import { logoutUser } from "@/utils/logout";

const AUTO_LOGOUT_TIMEOUT = 20 * 60 * 1000; // 20 minutes
export default function useIdleLogout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("logging out");
      logoutUser();
    }, AUTO_LOGOUT_TIMEOUT);
  };

  useEffect(() => {
    console.log("🟢 Idle timeout tracking started");
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    console.log("reset time");
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
