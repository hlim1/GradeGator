"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFunctions, RegisterRequest } from "../../lib/api";

const SignUpPage = () => {
  const [formData, setFormData] = useState<Partial<RegisterRequest>>({
    email: "",
    password: "",
    password_confirmation: "",
    username: "",
    first_name: "",
    last_name: "",
    preferred_name: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { email, password, password_confirmation, first_name, last_name, preferred_name } = formData;

      if (!email || !password || !password_confirmation || !first_name || !last_name || !preferred_name) {
        setError("Please fill in all required fields");
        return;
      }

      if (password !== password_confirmation) {
        setError("Passwords do not match");
        return;
      }

      if (!formData.username) {
        formData.username = email.split('@')[0].trim().toLowerCase();
      }

      console.log("Form data being sent:", formData);
      const response = await apiFunctions.register(formData as RegisterRequest);
      console.log("Registration successful:", response);

      const loginResponse = await apiFunctions.login({
        username: formData.username!,
        password: formData.password!
      });

      if (!loginResponse.success) {
        setError("Account created, but auto-login failed. Please log in manually.");
        return;
      }

      if (loginResponse.user) {
        console.log("Auto-login successful", loginResponse.user);
        sessionStorage.setItem("userId", loginResponse.user.id.toString());
        sessionStorage.setItem("userData", JSON.stringify(loginResponse.user));
      }

      const tokenRes = await fetch("http://18.188.140.218:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username!,
          password: formData.password!
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        localStorage.setItem("accessToken", tokenData.access);
        localStorage.setItem("refreshToken", tokenData.refresh);
      } else {
        console.error("Failed to get JWT tokens after signup");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, errors]: [string, any]) => {
            return `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`;
          })
          .join('\n');
        setError(`Registration failed:\n${errorMessages}`);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-bl from-purple-500 to-blue-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 max-w-full mx-4">
        <div className="flex justify-between border-b pb-4 mb-6">
          <button className="font-semibold border-b-2 border-black">Sign Up</button>
          <button className="text-gray-400" onClick={() => router.push("/login")}>Log In</button>
        </div>

        <div className="flex flex-col items-center">
          <img src="/logo.svg" alt="Logo" className="h-12 mb-6" />
          <h2 className="text-2xl font-semibold mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Name</label>
              <input
                type="text"
                name="preferred_name"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What should we call you?"
                value={formData.preferred_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                name="email"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Account
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
