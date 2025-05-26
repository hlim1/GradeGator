"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGraduationCap } from "react-icons/fa";
import { apiFunctions } from "@/lib/api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      const response = await apiFunctions.login({ username, password });
      
      if (!response.success) {
        setError("Invalid username or password");
        return;
      }

      if (response.user) {
        console.log("Login successful");
        // Store user data in sessionStorage
        sessionStorage.setItem("instructorId", response.user.id.toString());
        sessionStorage.setItem("userData", JSON.stringify(response.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error logging in:", err);
      setError(err.response?.data?.error?.[0] || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-bl from-purple-500 to-blue-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 max-w-full mx-4">
        <div className="flex justify-between border-b pb-4 mb-6">
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
          <button className="font-semibold border-b-2 border-black">Log In</button>
        </div>
        <div className="flex flex-col items-center">
          <img src="/logo.svg" alt="Logo" className="h-12 mb-6" />
          <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-[60%] transform -translate-y-1/2 text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            By logging in, you agree to our{" "}
            <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
