import React, { useState } from 'react';
import { createCourse } from '../api/courseService';

function CourseForm() {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    term: '',
    section: '',
    department: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const newCourse = await createCourse(formData);
      setSuccess(true);
      setFormData({
        name: '',
        number: '',
        term: '',
        section: '',
        department: '',
      });
      console.log('Course created:', newCourse);
    } catch (err) {
      setError(err.response?.data || 'Failed to create course');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Create New Course</h2>
      </div>
      <div className="card-body">
        {success && (
          <div className="alert alert-success">
            Course created successfully!
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger">
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Course Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="number" className="form-label">Course Number</label>
            <input
              type="text"
              className="form-control"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="term" className="form-label">Term</label>
            <input
              type="text"
              className="form-control"
              id="term"
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="section" className="form-label">Section</label>
            <input
              type="text"
              className="form-control"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="department" className="form-label">Department</label>
            <input
              type="text"
              className="form-control"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CourseForm;