# Project Management

# Summer 2025

## Student(s)
- Brandon Rivera (brrivera@davidson.edu)
- Harsh Desai (hadesai@davidson.edu)

## Project
- Build an Online Grading System - GradeGator

## Period
- May 27 - July 20 (8-Weeks)

## Meeting
- Meets twice a week: Monday and Thursday at 11:00 a.m. -- 12:00 p.m.
- For [an effective and efficient meeting](https://www.condecosoftware.com/blog/meeting-length/#:~:text=Deciding%20on%20meeting%20length), the meeting will not exceed 60 minutes unless necessary.
- The meeting will conduct the following structure:
  1. The student describes the progress including anything the student has learned after the past meeting. 20 minutes.
  2. Discussion. This step may be integrated with Step 1. The project advisor asks any questions related to the student's work. 30 minutes.
  3. The student proposes items to work on until the next meeting. 10 minutes.

## Technology

### Programming Languages:
- Python, Java, HTML, CSS, JavaScript, TypeScript

### Cloud:
- AWS (EC2, Lambda)

### Version Control:
- Git, GitHub

## Work Items

### Week 1
- Attend <ins>all</ins> ALPhA workshop sessions for learning Python, GitHub, and UNIX. Check the email for the schedule.
- Read <ins>all</ins> **four** reports written by the GradeGator group to understand the motivation and current status.
  - The reports can be found in the `GradeGator/ProjectManagement/Resources/Reports` directory.
- Learn what is AWS. Specifically, learn what [EC2](https://aws.amazon.com/ec2/), [Lambda](https://aws.amazon.com/lambda/), how to host a web--server on EC2, etc.. Some resources:
  - [EC2 Tutorial from AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/tutorial-launch-my-first-ec2-instance.html)
  - [AWS Cloud Tutorial](https://www.w3schools.com/aws/aws_cloudessentials_ec2intro.php)
  - [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
  - [Hosting a Static Website on AWS Using EC2: A Step-by-Step Guide](https://medium.com/@samuelnnanna71/hosting-a-static-website-on-aws-using-ec2-a-step-by-step-guide-1fb3ded99796)
- When learning the technologies, make sure you follow the examples and perform them by yourself to gain practical knowledge. Be ready to show the demo if asked.
  - AWS has a free tier that the user can experiment with without any cost.
- Meeting with the former student(s) to learn how AWS and GitHub repo are structured.

### Week 2
- Access [Davidson AWS Organization Account](https://davidsonaws.awsapps.com/start#/)
  - Use your Davidson credential to access the account.
  - Click `Davidson-GradeGators->AWSAdministratorAccess` to access the main Dashboard.
  - Check out S3 buckets.
  - Check out Lambda functions.
- Learn how to host a static website on S3.
  - There is a bucket `gradegator-web-server` created for hosting the web server.
- Connect the front end and the back end.
  - As a professor, I want to create my account so I can access the features of the site.
  - As a professor, I want to create a course so I can manage my assignments for the students.
  - As a professor, I want to upload an assignment so I can publish the assignment to the students.
  - As a professor, I want to upload the auto-grader so I can grade students' submitted assignments automatically.
  - As a professor, I want to view the auto-graded result so I can manually assess the students' work.
- Online Posts to Read and Learn
  - AWS recommends [AWS Amplify](https://aws.amazon.com/amplify/) for the full stack development. Go through the site and see how it can be implemented into our GradeGator system.
  - GradeGator is a full stack development. Read following posts to learn about what a full stack development is.
    - [What is Full Stack Development?](https://aws.amazon.com/what-is/full-stack-development/) by AWS.
    - [Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) from Wikipedia.
    - [The Model View Controller Pattern – MVC Architecture and Frameworks Explained](https://www.freecodecamp.org/news/the-model-view-controller-pattern-mvc-architecture-and-frameworks-explained/) by Rafael D. Hernandez.
- Helpful Online Resources for Learning Entity-Relationship (ER) Diagram:
  - [What is an Entity Relationship Diagram (ERD)?](https://www.lucidchart.com/pages/er-diagrams) from Lucid Chart
  - [Introduction of ER Model](https://www.geeksforgeeks.org/introduction-of-er-model/) from GeeksforGeeks

### Week 3
- Fix the course is visible to all students and instructors. (Both)
- Fix the log-out logic. (done)
- The front-end assignment communicates properly with AWS lambda and S3. (Brandon)
  - When an assignment is created, S3 holds assignment files. (done)
  - Lambda communicates with the front-end. (not done)
- Verify that AWS RDS (PostgreSQL) is correctly populated when new data is added using the front-end. (done)
  - There should be a way to query the database using SQL code.
- Make rubric generation be done online using the UI instead of creating a file locally and uploading the zip file. (Both)
- Don't Allow Students to delete or alter course settings (Change Student permissions). (Harsh)

### Week 4
- Construct a full ER diagram referencing the PostgreSQL. (done)
  - Verify the ER diagram is correct.
  - The relationship cardinalities should be specified.
  - All attributes in the table should be visible, along with their types.
- Fix course visibility issue. (Both)
- Debug student submission. (not done)
  - Submit the completed assignment, run autograder (lambda), and return the result.
- Create a temporary session-limited token for the user.
  - Create at the login time.
  - Deletes either when the user logs out or remains idle for 20 minutes.
  - If the token deletes due to the idleness of the user, the user will automatically log out.

### Week 5
- Returning the result to the front-end.
  - Decide on the details of the visualization of the result. For now, follow the style of Gradescope.
    - Print `testName`, show the text in green if `passed` is `true`. Otherwise, red.
  - Show the student submitted files.
    - Add a tab that the user can click to view the submitted files. The user can click each file to view the code.
- Visibility of the assignments and submissions.
- Create a temporary session-limited token for the user.
  - Create at the login time.
  - Deletes either when the user logs out or remains idle for 20 minutes.
  - If the token is deleted due to the idleness of the user, the user will automatically log out.
- Thursday: Live technical demo.

### Week 6
- Implement "Settings" page for the course. On the page, there should be the following items:
  - Edit Course information: Course name, number, semester, year, department.
  - Configure autograder -- able to upload a new autograder file. This file will overwrite the existing one, if any, and compile.
  - Manage submission release date, deadline, and late submission date.
- Implement "Rubric" page for the course. On the page, there should be the following items:
  - Create new rubric: Each rubric must include a description and the weight (score).
  - Able to edit the existing rubric description and the weight.
  - Able to remove the rubric.
- Code display. The code view page shows collapsible options, where each option shows the submitted source file if clicked.
- Change "Documents" to "Files" and make it visible to the students.
- Implement the class roster page. On the page, there should be the following items:
  - Shows the names of users.
  - Shows the role of each user.
  - Shows the email address of each user.
  - Able to add a user using either option: Single user or batch using a csv file.
- Design how the role-by-course should be implemented.
  - Do we need an extra table(s) in the database, or can we utilize the existing ones and simply (maybe not so simple) modify the front-end? 

### Week 7
- Fix the updating autograder issue.
- Role-by-course implementation.
- Re-run the demo on Thursday to set up additional TODOs.

### Week 8
- Build a formal document that lays out _all_ the functionalities that are working.
  - Include all the screenshots or make a video.
  - List the future TODOs, i.e., functionalities that must be implemented.
- Late submission option change.
  - Click Late submission allowed will allow the user to set the late submission date.
- Name change: Rubric -> Autograder
- Date settings error in the Settings page.
- Display the autograder uploaded in the Autograder page.
- Name change: Outline -> Rubric.
- Instructors need to be able to grade the submission's manual rubric.
- Instructor adding users to the course.
- Set the owner of the course, and only the instructors can change the roles.

### Week 9
- Push and merge all changes to the main for Version 1.
- Version 2:
  - Merging Student and Instructor tables?
  - Merging update name and role functionalities.
  - Send an automated email to the user added to the course.
    - Need to modify the user creation and addition logic.
  - Rubric handling, i.e., students can view, and instructors/TAs can manually grade.
- Finalize any remaining TODOs that can be easily done.
- In the daily summary for July 25, list all the working functionalities of GradeGator. 
