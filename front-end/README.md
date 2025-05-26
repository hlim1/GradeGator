# Grade Gator Frontend - Setup Instructions

These instructions will help you set up and run the Grade Gator frontend application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

You can check if you have these installed by opening a terminal or command prompt and typing:

```
node -v
npm -v
```

If these commands display version numbers, you're good to go!

## Installation Steps

1. **Clone the repository**


2. **Install dependencies**

   While in the project directory, run:

   ```
   npm install
   ```

   This will install all the required packages. It might take a few minutes.

3. **Configure the backend API URL**

   If needed, open the file `src/api/api.js` and update the `API_URL` constant to point to your backend:

   ```javascript
   const API_URL = 'http://localhost:8000/api';
   ```

   Change this if your backend is running on a different address.

## Running the Application

1. **Start the development server**

   Run the following command:

   ```
   npm start
   ```

2. **Access the application**

   Your default web browser should automatically open with the application running at:
   
   [http://localhost:3000](http://localhost:3000)

   If it doesn't open automatically, you can manually open your browser and navigate to that address.

## Using the Application

- The application will load the main dashboard when you first visit.
- Use the navigation menu to access different sections: Courses, Assignments, Students, etc.
- Any changes you make will be sent to the backend API.