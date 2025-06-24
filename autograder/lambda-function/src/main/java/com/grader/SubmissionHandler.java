package com.grader;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3ObjectSummary;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Enhanced SubmissionHandler that combines both implementations to support:
 * • Single‑file submissions (Foo.java)
 * • Multi‑file submissions packaged as Foo.zip (multiple .java files)
 * • Proper test execution with package management
 * • Smart filtering of which files to store in the results bucket
 */
public class SubmissionHandler implements RequestHandler<S3Event, String> {
    private final AmazonS3 s3Client = AmazonS3ClientBuilder.defaultClient();
    private static final String TEST_BUCKET = "professor-test-cases";
    private static final String RESULTS_BUCKET = "graded-results";
    private String tempDir; // Will be initialized in handleRequest

    /*
     * ==========================================================
     * Lambda entry‑point
     * ==========================================================
     */
    @Override
    public String handleRequest(S3Event event, Context context) {
        String sourceBucket = event.getRecords().get(0).getS3().getBucket().getName();
        String sourceKey = event.getRecords().get(0).getS3().getObject().getKey();
        boolean isZip = sourceKey.toLowerCase().endsWith(".zip");

        // Create timestamped working directory
        tempDir = "/tmp/grading-" + System.currentTimeMillis();
        Path unzipDir = null;
        Path subDir = Paths.get(tempDir, "submission");
        Path testsDir = Paths.get(tempDir, "tests");
        Path compDir = Paths.get(tempDir, "compiled");
        Path modDir = Paths.get(tempDir, "modified_tests");

        try {
            Files.createDirectories(subDir);
            Files.createDirectories(testsDir);
            Files.createDirectories(compDir);
            Files.createDirectories(modDir);
        } catch (IOException e) {
            return "Failed to create temp dirs: " + e.getMessage();
        }

        // Extract assignment name from the filename
        String assignmentName = extractAssignmentName(sourceKey);
        String[] assignmentList = assignmentName.split("_");
        String assignmentId = assignmentList[0];
        String baseAssignment = assignmentList[assignmentList.length - 1];
        context.getLogger().log("Detected assignment: " + assignmentName);

        try {
            /* ------------------------------------------------- */
            /* 1️⃣ Download student submission(s) */
            /* ------------------------------------------------- */
            if (isZip) {
                context.getLogger().log("ZIP submission — unzipping: " + sourceKey);
                S3Object studentObj = s3Client.getObject(sourceBucket, sourceKey);
                unzipObjectToDir(studentObj, subDir, context);

                // List extracted files for debugging
                context.getLogger().log("Extracted files from ZIP:");
                try (Stream<Path> files = Files.list(subDir)) {
                    files.forEach(p -> context.getLogger().log("  - " + p.getFileName()));
                }
            } else {
                context.getLogger().log("Single‑file submission: " + sourceKey);
                S3Object studentObj = s3Client.getObject(sourceBucket, sourceKey);
                File outFile = subDir.resolve(new File(sourceKey).getName()).toFile();
                downloadS3Object(studentObj, outFile);
            }

            /* ------------------------------------------------- */
            /* 2️⃣ Ensure tests exist and download them */
            /* ------------------------------------------------- */
            String autograderFileName = assignmentIdAutograder(assignmentId);
            String autograderFileNameWithoutZip;

            if (autograderFileName == null) {
                String msg = "No autograder exists for assignment ID: " + assignmentId;
                context.getLogger().log(msg);
                return uploadResult(sourceBucket, sourceKey,
                        jsonError(msg), context, isZip);
            } else {
                context.getLogger().log("Autograder Found");

                if (autograderFileName.endsWith(".zip")){
                    context.getLogger().log("Autograder is a zip file. Stripping Extension");

                    autograderFileNameWithoutZip = extractAssignmentName(autograderFileName);

                    context.getLogger().log("Unzipping: " + autograderFileName);
                    
                    S3Object zipObject = s3Client.getObject(TEST_BUCKET, autograderFileName);
                    InputStream zipInputStream = zipObject.getObjectContent();

                    unzipDir = Paths.get(tempDir, "tests");
                    Files.createDirectories(unzipDir);

                    try (ZipInputStream zis = new ZipInputStream(zipInputStream)) {
                        ZipEntry entry;
                        while ((entry = zis.getNextEntry()) != null) {
                            Path outputPath = unzipDir.resolve(entry.getName());

                            if (entry.isDirectory()) {
                                Files.createDirectories(outputPath);
                            } else {
                                // Ensure parent directories exist
                                Files.createDirectories(outputPath.getParent());

                                try (OutputStream os = new FileOutputStream(outputPath.toFile())) {
                                    byte[] buffer = new byte[4096];
                                    int len;
                                    while ((len = zis.read(buffer)) > 0) {
                                        os.write(buffer, 0, len);
                                    }
                                }
                            }

                            zis.closeEntry();
                        }

                        context.getLogger().log("Successfully unzipped autograder to: " + unzipDir.toString());
                    } catch (IOException e) {
                        context.getLogger().log("Failed to unzip autograder: " + e.getMessage());
                    }
                }
            }

            Path expectedPath = unzipDir.resolve("tests/annotations/GradedTest.java");
            if (!Files.exists(expectedPath)) {
                String msg = "No test suite found at expected path: " + expectedPath;
                context.getLogger().log(msg);
                return uploadResult(sourceBucket, sourceKey, jsonError(msg), context, isZip);
            }

            context.getLogger().log("Test framework downloaded for assignment: " + assignmentName);

            //since we changed the logic to download the zip contents and extract, there is no need to download again
            
            //downloadS3Directory(TEST_BUCKET, autograderFileNameWithoutZip, unzipDir.toString());

            // Copy interface files to submission directory
            Path testsRoot = unzipDir.resolve("tests");
            copyInterfaceFiles(testsRoot, subDir, context);

            /* ------------------------------------------------- */
            /* 3️⃣ Compile and Run tests */
            /* ------------------------------------------------- */
            context.getLogger().log("Compiling code");
            String compileResult = compileCode(sourceKey, baseAssignment, context);
            if (!"success".equals(compileResult)) {
                return uploadResult(sourceBucket, sourceKey, compileResult, context, isZip);
            }

            context.getLogger().log("Running tests");
            String testResult = runTests(context);

            /* ------------------------------------------------- */
            /* 4️⃣ Upload result + submission source files */
            /* ------------------------------------------------- */
            return uploadResult(sourceBucket, sourceKey, testResult, context, isZip);
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            context.getLogger().log("Error: " + e.getMessage());
            context.getLogger().log("Stack trace: " + sw.toString());
            String errorResult = jsonError("Unhandled exception: " + e.getMessage());
            try {
                return uploadResult(sourceBucket, sourceKey, errorResult, context, isZip);
            } catch (Exception ex) {
                return "Error processing submission and failed to upload result: " + e.getMessage();
            }
        }
    }

    /*
     * ==========================================================
     * Helpers — download, unzip, S3 utilities
     * ==========================================================
     */
    private void unzipObjectToDir(S3Object s3Object, Path targetDir, Context context) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(s3Object.getObjectContent())) {
            ZipEntry entry;
            byte[] buf = new byte[4096];

            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory())
                    continue; // skip folders

                Path entryPath = Paths.get(entry.getName());

                // Skip macOS metadata folders and resource-fork files
                if (entry.getName().contains("__MACOSX") ||
                        entryPath.getFileName().toString().startsWith("._")) {
                    continue;
                }

                // 🔑 FLATTEN: drop any leading folder, keep only the file name
                Path outPath = targetDir.resolve(entryPath.getFileName());
                Files.createDirectories(outPath.getParent());

                context.getLogger().log("Extracting file: " + outPath.getFileName());

                try (OutputStream os = Files.newOutputStream(outPath)) {
                    int len;
                    while ((len = zis.read(buf)) != -1) {
                        os.write(buf, 0, len);
                    }
                }
            }
        }
    }

    private void downloadS3Object(S3Object s3Object, File targetFile) throws IOException {
        targetFile.getParentFile().mkdirs();
        try (S3ObjectInputStream in = s3Object.getObjectContent();
                FileOutputStream out = new FileOutputStream(targetFile)) {
            byte[] buf = new byte[4096];
            int len;
            while ((len = in.read(buf)) != -1) {
                out.write(buf, 0, len);
            }
        }
    }

    private void downloadS3Directory(String bucket, String prefix, String targetDir) throws IOException {
        for (S3ObjectSummary sum : s3Client.listObjects(bucket, prefix).getObjectSummaries()) {
            String key = sum.getKey();
            if (key.endsWith("/"))
                continue; // skip pseudo‑dirs

            String rel = key.substring(prefix.length());
            if (rel.startsWith("/"))
                rel = rel.substring(1);

            File tgt = new File(targetDir, rel);
            tgt.getParentFile().mkdirs();

            S3Object object = s3Client.getObject(bucket, key);
            downloadS3Object(object, tgt);
        }
    }

    private String assignmentIdAutograder(String assignmentId) {
        try {
            String prefix = assignmentId + "_";
            ListObjectsV2Request request = new ListObjectsV2Request()
                .withBucketName(TEST_BUCKET)
                .withPrefix(prefix);

            ListObjectsV2Result result = s3Client.listObjectsV2(request);

            for (S3ObjectSummary obj : result.getObjectSummaries()) {
                String key = obj.getKey();
                if (key.endsWith(".zip")) {
                    System.out.println("Found autograder zip: " + key);
                    return key;
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // Helper method to extract assignment name from submission filename
    private String extractAssignmentName(String filename) {
        // Remove path if present
        String baseName = new File(filename).getName();

        // Remove extension (works for both .java and .zip)
        int dotIndex = baseName.lastIndexOf('.');
        if (dotIndex > 0) {
            return baseName.substring(0, dotIndex);
        }

        return baseName;
    }

    private String jsonError(String msg) {
        return "{\"status\":\"error\",\"message\":\"" + msg.replace("\"", "\\\"") + "\"}";
    }

    private void copyInterfaceFiles(Path testsRoot, Path submissionDir, Context context) {
        try {
            // Find and copy interface files (.java files in root of test dir)
            try (Stream<Path> files = Files.list(testsRoot)) {
                files.filter(p -> {
                    String fileName = p.getFileName().toString();
                    return fileName.endsWith(".java") && !Files.isDirectory(p);
                }).forEach(interfacePath -> {
                    try {
                        String fileName = interfacePath.getFileName().toString();
                        Path targetPath = submissionDir.resolve(fileName);
                        Files.copy(interfacePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                        context.getLogger().log("Copied interface file: " + fileName);
                    } catch (IOException e) {
                        context.getLogger().log("Error copying interface file: " + e.getMessage());
                    }
                });
            }

            // Find and copy resource files (non-Java files in root of test dir)
            try (Stream<Path> files = Files.list(testsRoot)) {
                files.filter(p -> {
                    String fileName = p.getFileName().toString();
                    return !fileName.endsWith(".java") && !Files.isDirectory(p);
                }).forEach(resourcePath -> {
                    try {
                        String fileName = resourcePath.getFileName().toString();
                        Path targetPath = submissionDir.resolve(fileName);
                        Files.copy(resourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                        context.getLogger().log("Copied resource file: " + fileName);
                    } catch (IOException e) {
                        context.getLogger().log("Error copying resource file: " + e.getMessage());
                    }
                });
            }
        } catch (Exception e) {
            context.getLogger().log("Error in copyInterfaceFiles: " + e.getMessage());
        }
    }

    /*
     * ==========================================================
     * Compilation & Testing
     * ==========================================================
     */
    private String compileCode(String sourceKey, String assignmentName, Context context) {
        try {
            // Extract the filename without the path
            String sourceFilename = new File(sourceKey).getName();

            // List directories for debugging
            context.getLogger().log("Directory structure before compilation:");
            listDirectoryContents(new File(tempDir), "", context);

            ProcessBuilder pb = new ProcessBuilder();
            pb.directory(new File(tempDir));

            // Step 0: Locate and prepare GradedTest
            File gradedTestFile = findFileInDirectory(new File(tempDir), "GradedTest.java");
            if (gradedTestFile == null) {
                return jsonError("GradedTest.java not found in test suite");
            }

            String gradedTestContent = new String(Files.readAllBytes(gradedTestFile.toPath()));
            String gradedTestPackage = extractPackage(gradedTestFile);

            // Create a modified version of GradedTest.java in the tests package
            String modifiedGradedTestContent;
            if (gradedTestPackage.equals("annotations")) {
                modifiedGradedTestContent = gradedTestContent.replace("package annotations;", "package tests;");
            } else if (!gradedTestPackage.isEmpty()) {
                modifiedGradedTestContent = gradedTestContent.replace("package " + gradedTestPackage + ";",
                        "package tests;");
            } else {
                modifiedGradedTestContent = "package tests;\n\n" + gradedTestContent;
            }

            // Write the modified GradedTest.java to a new file
            File modifiedGradedTestFile = new File(tempDir + "/modified_tests/GradedTest.java");
            Files.write(modifiedGradedTestFile.toPath(), modifiedGradedTestContent.getBytes());
            context.getLogger().log("Created modified GradedTest in tests package");

            // Step 1: Compile the modified GradedTest.java
            List<String> command = new ArrayList<>();
            command.add("javac");
            command.add("-d");
            command.add(tempDir + "/compiled");
            command.add(modifiedGradedTestFile.getAbsolutePath());

            context.getLogger().log("Compiling modified GradedTest file: " + String.join(" ", command));
            pb.command(command);

            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                        .lines().collect(Collectors.joining("\n"));
                context.getLogger().log("Modified GradedTest compilation failed: " + error);
                return jsonError("Test compilation error: " + error);
            }

            // Step 2: Handle all student submissions
            // Find all Java files in submission directory
            List<File> studentFiles = new ArrayList<>();
            findJavaFiles(new File(tempDir + "/submission"), studentFiles);

            if (studentFiles.isEmpty()) {
                return jsonError("No Java files found in submission");
            }

            // Compile all student files with original packages
            command = new ArrayList<>();
            command.add("javac");
            command.add("-d");
            command.add(tempDir + "/compiled");

            for (File file : studentFiles) {
                command.add(file.getAbsolutePath());
            }

            context.getLogger().log("Compiling student submissions: " + String.join(" ", command));
            pb.command(command);

            process = pb.start();
            exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                        .lines().collect(Collectors.joining("\n"));
                context.getLogger().log("Student code compilation failed: " + error);
                return jsonError("Compilation error: " + error);
            }

            // Step 3: Create modified versions of student files with tests package
            for (File studentFile : studentFiles) {
                String studentContent = new String(Files.readAllBytes(studentFile.toPath()));
                String studentPackage = extractPackage(studentFile);
                String className = extractClassName(studentContent);

                String modifiedStudentContent;
                if (studentPackage.isEmpty()) {
                    modifiedStudentContent = "package tests;\n\n" + studentContent;
                } else {
                    modifiedStudentContent = studentContent.replace("package " + studentPackage + ";",
                            "package tests;");
                }

                // Write the modified student code
                File modifiedStudentFile = new File(tempDir + "/modified_tests/" + studentFile.getName());
                Files.write(modifiedStudentFile.toPath(), modifiedStudentContent.getBytes());
                context.getLogger().log("Created modified student file: " + modifiedStudentFile.getName());
            }

            // Step 4: Locate and modify test files
            String testFileName = assignmentName + "Tests.java";
            File testFile = findFileInDirectory(new File(tempDir), testFileName);

            if (testFile == null) {
                context.getLogger().log("Test file not found: " + testFileName);

                // Try alternate formats (with or without 'Hero' suffix)
                if (assignmentName.endsWith("Hero")) {
                    String alternateTestName = assignmentName.substring(0, assignmentName.length() - 4) + "Tests.java";
                    testFile = findFileInDirectory(new File(tempDir), alternateTestName);
                    if (testFile != null) {
                        testFileName = alternateTestName;
                        context.getLogger().log("Found alternate test file: " + testFileName);
                    }
                } else {
                    String alternateTestName = assignmentName + "HeroTests.java";
                    testFile = findFileInDirectory(new File(tempDir), alternateTestName);
                    if (testFile != null) {
                        testFileName = alternateTestName;
                        context.getLogger().log("Found alternate test file: " + testFileName);
                    }
                }

                if (testFile == null) {
                    return jsonError("Test file not found for assignment: " + assignmentName);
                }
            }

            String testContent = new String(Files.readAllBytes(testFile.toPath()));
            String testPackage = extractPackage(testFile);

            // 1. First build the modified test content
            StringBuilder modifiedTestContent = new StringBuilder();

            // 2. Add or update package declaration
            if (testPackage.isEmpty()) {
                modifiedTestContent.append("package tests;\n\n");
                modifiedTestContent.append(testContent);
            } else if (!testPackage.equals("tests")) {
                modifiedTestContent.append(testContent.replace("package " + testPackage + ";", "package tests;"));
            } else {
                modifiedTestContent.append(testContent);
            }

            // 3. Fix imports in a more generic way
            String contentStr = modifiedTestContent.toString();

            // Get class names from student files for import fixing
            Set<String> classesToFix = new HashSet<>();
            for (File studentFile : studentFiles) {
                // Extract just the filename without extension
                String className = studentFile.getName();
                if (className.endsWith(".java")) {
                    className = className.substring(0, className.length() - 5);
                    classesToFix.add(className);
                }
            }

            // Also check for interface files in submission dir
            File[] submissionFiles = new File(tempDir + "/submission").listFiles();
            if (submissionFiles != null) {
                for (File file : submissionFiles) {
                    if (file.getName().endsWith(".java")) {
                        String className = file.getName();
                        className = className.substring(0, className.length() - 5);
                        classesToFix.add(className);
                    }
                }
            }

            // Fix each import
            for (String className : classesToFix) {
                String badImport = "import " + className + ";";
                if (contentStr.contains(badImport)) {
                    contentStr = contentStr.replace(badImport, "import tests." + className + ";");
                    context.getLogger().log("Fixed import for: " + className);
                }
            }

            // 4. Update the content with fixed imports
            modifiedTestContent = new StringBuilder(contentStr);
            if (!contentStr.contains("import tests.GradedTest;") &&
                    !contentStr.contains("import " + gradedTestPackage + ".GradedTest;")) {

                // Find where to insert the import
                int insertPos = 0;

                if (contentStr.contains("package ")) {
                    // Insert after package declaration
                    insertPos = contentStr.indexOf(";", contentStr.indexOf("package ")) + 1;
                    while (insertPos < contentStr.length() &&
                            (contentStr.charAt(insertPos) == '\n' || contentStr.charAt(insertPos) == '\r')) {
                        insertPos++;
                    }
                }

                // Insert the import for GradedTest
                contentStr = contentStr.substring(0, insertPos) +
                        "\nimport tests.GradedTest;\n" +
                        contentStr.substring(insertPos);

                modifiedTestContent = new StringBuilder(contentStr);
            }

            // Write the modified test file
            File modifiedTestFile = new File(tempDir + "/modified_tests/" + testFileName);
            Files.write(modifiedTestFile.toPath(), modifiedTestContent.toString().getBytes());
            context.getLogger().log("Created modified test file: " + modifiedTestFile.getAbsolutePath());

            // Step 5: Also modify RunTests.java
            File runTestsFile = findFileInDirectory(new File(tempDir), "RunTests.java");
            if (runTestsFile == null) {
                return jsonError("RunTests.java not found in test suite");
            }

            String runTestsContent = new String(Files.readAllBytes(runTestsFile.toPath()));
            String runTestsPackage = extractPackage(runTestsFile);

            StringBuilder modifiedRunTestsContent = new StringBuilder();

            // Add or update package declaration
            if (runTestsPackage.isEmpty()) {
                modifiedRunTestsContent.append("package tests;\n\n");
                modifiedRunTestsContent.append(runTestsContent);
            } else if (!runTestsPackage.equals("tests")) {
                modifiedRunTestsContent
                        .append(runTestsContent.replace("package " + runTestsPackage + ";", "package tests;"));
            } else {
                modifiedRunTestsContent.append(runTestsContent);
            }

            // Write the modified RunTests file
            File modifiedRunTestsFile = new File(tempDir + "/modified_tests/RunTests.java");
            Files.write(modifiedRunTestsFile.toPath(), modifiedRunTestsContent.toString().getBytes());
            context.getLogger().log("Created modified RunTests file");

            // Step 6: Compile all modified test files
            command = new ArrayList<>();
            command.add("javac");
            command.add("-cp");
            command.add(tempDir + "/compiled:" +
                    tempDir + "/tests/libs/junit-4.12.jar:" +
                    tempDir + "/tests/libs/hamcrest-core-1.3.jar:" +
                    tempDir + "/tests/libs/*");
            command.add("-d");
            command.add(tempDir + "/compiled");

            // Add all the modified test files
            List<File> modifiedTestFiles = new ArrayList<>();
            findJavaFiles(new File(tempDir + "/modified_tests"), modifiedTestFiles);

            for (File file : modifiedTestFiles) {
                command.add(file.getAbsolutePath());
            }

            context.getLogger().log("Compiling modified test files: " + String.join(" ", command));
            pb.command(command);

            process = pb.start();
            exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                        .lines().collect(Collectors.joining("\n"));
                context.getLogger().log("Modified test compilation failed: " + error);
                return jsonError("Test compilation error: " + error);
            }

            return "success";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            context.getLogger().log("Compilation exception: " + e.getMessage());
            context.getLogger().log("Stack trace: " + sw.toString());
            return jsonError("Compilation exception: " + e.getMessage());
        }
    }

    private String runTests(Context context) {
        try {
            File[] resourceFiles = new File(tempDir + "/submission").listFiles(
                    file -> !file.isDirectory() && !file.getName().endsWith(".java"));
            if (resourceFiles != null) {
                for (File resourceFile : resourceFiles) {
                    Path targetPath = Paths.get(tempDir, resourceFile.getName());
                    Files.copy(resourceFile.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                    context.getLogger().log("Copied resource to working dir: " + resourceFile.getName());
                }
            }
            // We've now moved all test classes to the tests package
            String runTestsClass = "tests.RunTests";

            context.getLogger().log("Using RunTests class: " + runTestsClass);

            ProcessBuilder pb = new ProcessBuilder();
            pb.directory(new File(tempDir));

            // Set up classpath with explicit paths
            String classPath = tempDir + "/compiled:" +
                    tempDir + "/tests/libs/junit-4.12.jar:" +
                    tempDir + "/tests/libs/hamcrest-core-1.3.jar:" +
                    tempDir + "/tests/libs/*";

            List<String> command = new ArrayList<>();
            command.add("java");
            command.add("-cp");
            command.add(classPath);
            command.add(runTestsClass);

            context.getLogger().log("Running tests with command: " + String.join(" ", command));
            pb.command(command);

            Process process = pb.start();

            // Capture both standard output and error output
            String output = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines().collect(Collectors.joining("\n"));

            String errorOutput = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                    .lines().collect(Collectors.joining("\n"));

            // Always log the outputs
            context.getLogger().log("Test stdout: " + output);
            context.getLogger().log("Test stderr: " + errorOutput);

            int exitCode = process.waitFor();

            // Parse the test output to extract detailed error messages
            String parsedOutput = parseTestOutput(output, errorOutput);
            String sanitizedOutput = parsedOutput
                .replace("\\", "\\\\")  // escape backslashes first
                .replace("\"", "\\\"")  // escape double quotes
                .replace("\n", "\\n")   // escape newlines
                .replace("\r", "\\r");  // optional: escape carriage returns

            if (exitCode != 0) {
                return "{\"status\": \"test_failure\", \"output\": \"" + sanitizedOutput + "\"}";
            }

            // Format the result as JSON
            return "{\"status\": \"success\", \"output\": \"" + sanitizedOutput + "\"}";
        } catch (Exception e) {
            context.getLogger().log("Test execution exception: " + e.getMessage());
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            context.getLogger().log("Stack trace: " + sw.toString());
            return jsonError("Test execution error: " + e.getMessage());
        }
    }

    // Helper method to parse and enhance the test output
    private String parseTestOutput(String stdout, String stderr) {
        StringBuilder enhancedOutput = new StringBuilder();

        // First add the stdout content
        enhancedOutput.append(stdout);

        // If there are test failures, try to extract more details
        if (stdout.contains("Tests failed:") && stderr.contains("at tests.")) {
            enhancedOutput.append("\n\nDetailed failure information:\n");

            // Extract failure details from stderr
            String[] errorLines = stderr.split("\n");

            int failureCount = 0;
            for (int i = 0; i < errorLines.length; i++) {
                if (errorLines[i].contains("at tests.") && errorLines[i].contains("Tests.test")) {
                    // Look for the exception message, which should be a few lines above
                    for (int j = Math.max(0, i - 5); j < i; j++) {
                        if (errorLines[j].contains("Exception") ||
                                errorLines[j].contains("Error") ||
                                errorLines[j].contains("AssertionError")) {

                            failureCount++;
                            enhancedOutput.append("\nFailure #").append(failureCount).append(": ");

                            // Extract the test method name
                            String testMethod = "unknown";
                            if (errorLines[i].contains("tests.") && errorLines[i].contains(".test")) {
                                int startIdx = errorLines[i].lastIndexOf('.');
                                int endIdx = errorLines[i].indexOf("(", startIdx);
                                if (endIdx > startIdx) {
                                    testMethod = errorLines[i].substring(startIdx + 1, endIdx);
                                }
                            }

                            enhancedOutput.append(testMethod).append(": ");

                            // Add the exception message
                            enhancedOutput.append(errorLines[j]);

                            // Also add the next line which often contains the assertion details
                            if (j + 1 < errorLines.length) {
                                enhancedOutput.append("\n  ").append(errorLines[j + 1]);
                            }

                            break;
                        }
                    }

                    // Move i past this stack trace to avoid duplicate entries
                    while (i < errorLines.length &&
                            (errorLines[i].contains("at ") || errorLines[i].trim().isEmpty())) {
                        i++;
                    }
                    i--; // Adjust for the loop increment
                }
            }
        }

        return enhancedOutput.toString();
    }

    /*
     * ==========================================================
     * Upload results — only store student files
     * ==========================================================
     */
    private String uploadResult(String sourceBucket, String sourceKey,
            String resultJson, Context context, boolean wasZip) {
        try {
            // Extract filename details
            String filename = new File(sourceKey).getName();
            String assignmentName = extractAssignmentName(filename);

            // Create a timestamped folder structure
            String timestamp = String.valueOf(System.currentTimeMillis());
            String resultFolderPrefix = assignmentName + "_" + timestamp + "/";

            // 1. Upload JSON result
            String resultJsonKey = resultFolderPrefix + "result.json";
            context.getLogger().log("Uploading result to bucket: " + RESULTS_BUCKET + ", key: " + resultJsonKey);
            s3Client.putObject(RESULTS_BUCKET, resultJsonKey, resultJson);

            // 2. Upload student files
            if (wasZip) {
                // For ZIP submissions, identify and upload only student submission files
                File submissionDir = new File(tempDir + "/submission");
                if (submissionDir.exists() && submissionDir.isDirectory()) {
                    File[] files = submissionDir.listFiles();
                    if (files != null) {
                        for (File file : files) {
                            if (isStudentFile(file.getName(), assignmentName)) {
                                String targetKey = resultFolderPrefix + file.getName();
                                context.getLogger().log("Uploading student file: " + targetKey);
                                s3Client.putObject(RESULTS_BUCKET, targetKey, file);
                            } else {
                                context.getLogger().log("Skipping interface file: " + file.getName());
                            }
                        }
                    }
                }
            } else {
                // Single file submission - copy the original file
                String originalSubmissionKey = resultFolderPrefix + filename;
                context.getLogger().log("Copying original submission to: " + originalSubmissionKey);
                s3Client.copyObject(sourceBucket, sourceKey, RESULTS_BUCKET, originalSubmissionKey);
            }

            // 3. Delete original
            try {
                s3Client.deleteObject(sourceBucket, sourceKey);
                context.getLogger().log("Deleted original submission from source bucket");
            } catch (Exception e) {
                context.getLogger().log("Warning: Failed to delete original file: " + e.getMessage());
            }

            return "Grading completed. Results stored in " + RESULTS_BUCKET + "/" + resultFolderPrefix;
        } catch (Exception e) {
            context.getLogger().log("Error uploading result: " + e.getMessage());
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            context.getLogger().log("Stack trace: " + sw.toString());
            return jsonError("Upload error: " + e.getMessage());
        }
    }

    /*
     * ==========================================================
     * Helper methods
     * ==========================================================
     */

    // Determines if a file is a student submission (vs interface/resource file)
    private boolean isStudentFile(String fileName, String assignmentName) {
        // 1. Check if it's a common interface file
        String baseAssignment = assignmentName;
        if (assignmentName.endsWith("Hero")) {
            baseAssignment = assignmentName.substring(0, assignmentName.length() - 4);
        }

        // Interface files are typically the base name of the assignment
        if (fileName.equals(baseAssignment + ".java")) {
            return false;
        }

        // 2. Common utility/library files
        if (fileName.startsWith("Std") || fileName.equals("Grader.java") ||
                fileName.equals("RunTests.java") || fileName.equals("GradedTest.java")) {
            return false;
        }

        // 3. Resource files
        if (!fileName.endsWith(".java")) {
            return false;
        }

        // If it's a Java file and we couldn't determine it's an interface
        // or library file, assume it's a student file
        return true;
    }

    // Extract class name from Java content
    private String extractClassName(String content) {
        // Look for "public class Name" or "class Name"
        int classIndex = content.indexOf("class ");
        if (classIndex != -1) {
            // Skip the "class " keyword
            int nameStart = classIndex + 6;
            // Find the end of the class name (whitespace, curly brace, or
            // extends/implements keyword)
            int nameEnd = content.indexOf("{", nameStart);
            int extendsIndex = content.indexOf("extends", nameStart);
            int implementsIndex = content.indexOf("implements", nameStart);

            if (extendsIndex != -1 && extendsIndex < nameEnd) {
                nameEnd = extendsIndex;
            }
            if (implementsIndex != -1 && implementsIndex < nameEnd) {
                nameEnd = implementsIndex;
            }

            // Extract and clean the class name
            return content.substring(nameStart, nameEnd).trim();
        }

        // Default fallback - use the filename without extension
        return "Unknown";
    }

    // Extract package name from Java file
    private String extractPackage(File file) {
        try {
            if (file == null || !file.exists()) {
                return "";
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file)))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.startsWith("package ")) {
                        return line.substring(8, line.indexOf(';')).trim();
                    } else if (!line.isEmpty() && !line.startsWith("//") && !line.startsWith("/*")) {
                        // If we find non-comment code without a package, there's no package
                        break;
                    }
                }
            }
            return "";
        } catch (Exception e) {
            return "";
        }
    }

    // Find a file in directory tree
    private File findFileInDirectory(File dir, String fileName) {
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        File found = findFileInDirectory(file, fileName);
                        if (found != null) {
                            return found;
                        }
                    } else if (file.getName().equals(fileName)) {
                        return file;
                    }
                }
            }
        }
        return null;
    }

    // Find all Java files in directory
    private void findJavaFiles(File dir, List<File> files) {
        if (dir.exists() && dir.isDirectory()) {
            File[] fileList = dir.listFiles();
            if (fileList != null) {
                for (File file : fileList) {
                    if (file.isDirectory()) {
                        findJavaFiles(file, files);
                    } else if (file.getName().endsWith(".java")) {
                        files.add(file);
                    }
                }
            }
        }
    }

    // Print directory structure for debugging
    private void listDirectoryContents(File dir, String indent, Context context) {
        context.getLogger().log(indent + "Dir: " + dir.getName());
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        listDirectoryContents(file, indent + "  ", context);
                    } else {
                        context.getLogger().log(indent + "  File: " + file.getName());
                    }
                }
            }
        }
    }
}