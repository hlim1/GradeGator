This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
Before you run the server: 
```bash
npm install
```

(Optional) If you're getting command not found: npm, it means Node.js and npm (Node Package Manager) are not installed or not properly set up on your system. Here’s how to fix it:

✅ Step 1: Check if Node.js is installed
Try this in your terminal:

```bash
node -v
```
If you also get command not found, it confirms Node.js isn’t installed. (Cont. to Step 2)

✅ Step 2: Install Node.js and npm
For macOS (using Homebrew)
If you have Homebrew:
```bash
brew install node
```

Then you can verify installation by running the following commands:
```bash
node -v
npm -v
```
Both should now return version numbers.

Then, you can continue with 
```bash
npm install
```

## Run the server 
#### ⚠️(Please make sure you complete the previous step before continuing)

After installing node modules, you should be able to start the server through:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing and Using Git Branches

To contribute to the project, follow these steps:

🌿 Create a new branch

If you’re starting work on a new task:
```bash
git checkout -b your-branch-name
```

Use a meaningful name like:

```bash
git checkout -b Katherine-LandingPage
```

📂 Make changes and commit

After editing files, stage and commit your changes:

```bash
git add .
git commit -m "Short description of your change"
```

⬆️ Push your branch to GitHub

```bash
git push origin your-branch-name
```

✅ Open a Pull Request

Go to the repository on GitHub, and you'll see an option to “Compare & pull request” for your branch. Open a pull request and request reviews from teammates.