"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import CourseBlock from "../components/CourseBlock";
import CreateCourseModal from "../components/CreateCourseModal";
import JoinCourseModal from "../components/JoinCourseModal";
import { Course } from "@/lib/api";
import { apiFunctions } from "@/lib/api";

function compareSemesters(a: string, b: string) {
  const [termA, yearA] = a.split(" ");
  const [termB, yearB] = b.split(" ");

  if (parseInt(yearA) !== parseInt(yearB)) {
    return parseInt(yearB) - parseInt(yearA); // Higher year first
  }

  return termA === "Fall" ? -1 : 1; // Fall before Spring
}

export default function Dashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);


  useEffect(() => {
    sessionStorage.removeItem('assignmentName');
    if (typeof window !== "undefined") {
      const hasRefreshed = sessionStorage.getItem("hasRefreshedDashboard");
      if (!hasRefreshed) {
        sessionStorage.setItem("hasRefreshedDashboard", "true");
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    const user = sessionStorage.getItem("userData");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const fetchCourses = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const fetchedCourses = await apiFunctions.getCoursesByUserId(userId);

      if (Array.isArray(fetchedCourses)) {
        const uid = parseInt(userId || "-1");
        const instructors = fetchedCourses.filter(c => 
           ["instructor", "TA", "owner"].includes(c.role)
        );
        const students = fetchedCourses.filter(c => c.role === "student");

        setInstructorCourses(instructors);
        setStudentCourses(students);
      } else {
        setInstructorCourses([]);
        setStudentCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setInstructorCourses([]);
      setStudentCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (course: Course) => {
    router.push(`/course/${course.id}`);
  };

  const handleCourseCreated = () => {
    fetchCourses();
  };

  const handleCourseJoined = () => {
    fetchCourses();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div>Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">Dashboard</h1>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">Instructor Courses</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="name">Sort by Name</option>
                <option value="semester">Sort by Semester</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {instructorCourses
              .filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => {
                if (sortOption === "name") return a.name.localeCompare(b.name);
                if (sortOption === "semester") return compareSemesters(a.term, b.term);
                return 0;
              })
              .map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className="cursor-pointer"
                >
                  <CourseBlock
                    courseId={course.id}
                    courseName={course.name}
                    courseNumber={course.number}
                    section={course.section}
                    semester={course.term}
                    userRole={course.role}
                  />
                </div>
              ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">Student courses</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {studentCourses
              .filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => {
                if (sortOption === "name") return a.name.localeCompare(b.name);
                if (sortOption === "semester") return compareSemesters(a.term, b.term);
               return 0;
              })
              .map((course) => (
                <div
                   key={course.id}
                   onClick={() => handleCourseClick(course)}
                   className="cursor-pointer"
                >
                  <CourseBlock
                    courseId={course.id}
                    courseName={course.name}
                    courseNumber={course.number}
                    section={course.section}
                    semester={course.term}
                    userRole={course.role}
                  />
                </div>
              ))}
          </div>
        </section>

        {/* Show both buttons always since roles are gone */}
        <div className="fixed bottom-4 right-4 flex gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 shadow-md"
          >
            Create New Course
          </button>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 shadow-md"
          >
            Join a Course
          </button>
        </div>

        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCourseCreated={handleCourseCreated}
        />

        <JoinCourseModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onCourseJoined={handleCourseJoined}
        />
      </div>
    </div>
  );
}
