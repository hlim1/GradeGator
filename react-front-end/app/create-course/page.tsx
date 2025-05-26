"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const CreateCoursePage = () => {
  const [courseNumber, setCourseNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [term, setTerm] = useState('Spring');
  const [year, setYear] = useState('2025');
  const [department, setDepartment] = useState('');
  const [allowEntryCode, setAllowEntryCode] = useState(false);

  const handleCreateCourse = () => {
    // Handle course creation logic here
    console.log({ courseNumber, courseName, courseDescription, term, year, department, allowEntryCode });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col p-6">
        <h1 className="text-2xl font-bold">Create your Course</h1>
        <p className="text-sm text-gray-600 mb-4">Enter your course details below.</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
          <label className="block text-sm font-semibold">Course Number *</label>
          <input 
            type="text" 
            placeholder="eg. Econ 101" 
            className="w-full p-2 border rounded mt-1"
            value={courseNumber}
            onChange={(e) => setCourseNumber(e.target.value)}
          />
          
          <label className="block text-sm font-semibold mt-4">Course Name *</label>
          <input 
            type="text" 
            placeholder="eg. Introduction to Macroeconomics" 
            className="w-full p-2 border rounded mt-1"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          
          <label className="block text-sm font-semibold mt-4">Course Description</label>
          <textarea 
            className="w-full p-2 border rounded mt-1"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          ></textarea>
          
          <div className="flex mt-4">
            <div className="w-1/2 pr-2">
              <label className="block text-sm font-semibold">Term</label>
              <select 
                className="w-full p-2 border rounded mt-1"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option>Spring</option>
                <option>Summer</option>
                <option>Fall</option>
                <option>Winter</option>
              </select>
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-sm font-semibold">Year</label>
              <select 
                className="w-full p-2 border rounded mt-1"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
              </select>
            </div>
          </div>
          
          <label className="block text-sm font-semibold mt-4">School</label>
          <p className="text-sm">Davidson College</p>
          
          <label className="block text-sm font-semibold mt-4">Department</label>
          <select 
            className="w-full p-2 border rounded mt-1"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>Select Department</option>
            <option>Economics</option>
            <option>Computer Science</option>
            <option>Mathematics</option>
          </select>
          
          <div className="mt-4 flex items-center">
            <input 
              type="checkbox" 
              className="mr-2" 
              checked={allowEntryCode} 
              onChange={() => setAllowEntryCode(!allowEntryCode)}
            />
            <label className="text-sm">Allow students to enroll via course entry code</label>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-gray-400 text-white rounded mr-2">Cancel</button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded" 
              onClick={handleCreateCourse}
            >
              Create Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
