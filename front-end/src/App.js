import React from 'react';
import './App.css';
import CourseList from './components/CourseList';
import CourseForm from './components/CourseForm';

function App() {
  return (
    <div className="App">
      <main>
        <CourseList />
        <CourseForm />
      </main>
    </div>
  );
}

export default App;
