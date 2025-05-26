"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGraduationCap } from "react-icons/fa";
import { apiFunctions, RegisterRequest } from "../../lib/api";

const SignUpPage = () => {
  const [formData, setFormData] = useState<Partial<RegisterRequest>>({
    email: "",
    password: "",
    password_confirmation: "",
    username: "",
    first_name: "",
    last_name: "",
    preferred_name: "",
    is_student: false,
    is_instructor: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRoleSelect = (role: 'student' | 'instructor') => {
    setFormData(prev => ({
      ...prev,
      is_student: role === 'student',
      is_instructor: role === 'instructor'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.email || !formData.password || !formData.password_confirmation ||
          !formData.first_name || !formData.last_name || !formData.preferred_name) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match");
        return;
      }

      if (!formData.is_student && !formData.is_instructor) {
        setError("Please select a role (Student or Instructor)");
        return;
      }

      // Generate username from email if not provided
      if (!formData.username) {
        formData.username = formData.email.split('@')[0];
      }

      const response = await apiFunctions.register(formData as RegisterRequest);
      console.log("Registration successful:", response);
      
      // Redirect to login page after successful registration
      router.push("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      // Handle API error messages
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, errors]: [string, any]) => `${field}: ${errors.join(', ')}`)
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
          
          {/* Role Selection */}
          <div className="flex flex-col gap-4 mb-6 w-full">
            <button 
              type="button"
              className={`w-full py-3 px-4 border rounded-lg transition-colors
                ${formData.is_instructor 
                  ? "bg-purple-600 text-white border-purple-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleRoleSelect('instructor')}
            >
              I am an Instructor
            </button>
            <button 
              type="button"
              className={`w-full py-3 px-4 border rounded-lg transition-colors
                ${formData.is_student 
                  ? "bg-purple-600 text-white border-purple-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleRoleSelect('student')}
            >
              I am a Student
            </button>
          </div>
          
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
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors
                disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!formData.email || !formData.password || !formData.password_confirmation || (!formData.is_student && !formData.is_instructor)}
            >
              Create Account
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
