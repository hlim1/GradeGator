import React, { useState, useEffect } from 'react';
import { getCourses } from '../api/courseService';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch courses when component mounts
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        // Ensure we have an array, even if the API returns null/undefined
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch courses');
        setCourses([]); // Initialize with empty array on error
        setLoading(false);
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="course-list">
      <h2>Courses</h2>
      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <ul className="list-group">
          {courses.map(course => (
            <li key={course.id} className="list-group-item">
              <h3>{course.name}</h3>
              <p>{course.number} - {course.term}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourseList;