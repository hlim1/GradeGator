package tests;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;
import java.util.*;

public class RunTests {
    private static List<TestResult> testResults = new ArrayList<>();
    
    // Inner class to hold test results
    private static class TestResult {
        String testName;
        boolean passed;
        String input;
        String expectedOutput;
        String actualOutput;
        
        public TestResult(String testName) {
            this.testName = testName;
            this.passed = true;
        }
        
        public String toJson() {
            return "    {\n" +
                   "      \"testName\": \"" + testName + "\",\n" +
                   "      \"passed\": " + passed + ",\n" +
                   "      \"input\": \"" + (input != null ? input.replace("\"", "\\\"") : "") + "\",\n" +
                   "      \"expectedOutput\": \"" + (expectedOutput != null ? expectedOutput.replace("\"", "\\\"") : "") + "\",\n" +
                   "      \"actualOutput\": \"" + (actualOutput != null ? actualOutput.replace("\"", "\\\"") : "") + "\"\n" +
                   "    }";
        }
    }
    
    // Custom listener to capture test events
    private static class TestResultListener extends RunListener {
        private Map<String, TestResult> results = new HashMap<>();
        private String currentTest;
        
        @Override
        public void testStarted(Description description) {
            currentTest = description.getMethodName();
            results.put(currentTest, new TestResult(currentTest));
            
            // Set test-specific inputs and expected outputs
            if (currentTest.equals("test00McCarthyPositiveN")) {
                results.get(currentTest).input = "n = 17";
                results.get(currentTest).expectedOutput = "91";
                try {
                    int result = Recursion.mcCarthy91(17);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test01McCarthyNegativeN")) {
                results.get(currentTest).input = "n = -17";
                results.get(currentTest).expectedOutput = "91";
                try {
                    int result = Recursion.mcCarthy91(-17);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test02McCarthyLargeN")) {
                results.get(currentTest).input = "n = 255";
                results.get(currentTest).expectedOutput = "245";
                try {
                    int result = Recursion.mcCarthy91(255);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test03ToBinaryMixedRepr")) {
                results.get(currentTest).input = "n = 1000";
                results.get(currentTest).expectedOutput = "1111101000";
                try {
                    String result = Recursion.toBinary(1000);
                    results.get(currentTest).actualOutput = result;
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test04ToBinaryAllOnes")) {
                results.get(currentTest).input = "n = 15";
                results.get(currentTest).expectedOutput = "1111";
                try {
                    String result = Recursion.toBinary(15);
                    results.get(currentTest).actualOutput = result;
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test05ToBinaryOn0")) {
                results.get(currentTest).input = "n = 0";
                results.get(currentTest).expectedOutput = "0";
                try {
                    String result = Recursion.toBinary(0);
                    results.get(currentTest).actualOutput = result;
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test06ToBinaryOn1")) {
                results.get(currentTest).input = "n = 1";
                results.get(currentTest).expectedOutput = "1";
                try {
                    String result = Recursion.toBinary(1);
                    results.get(currentTest).actualOutput = result;
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test07CountWaysOnSingleStair")) {
                results.get(currentTest).input = "n = 1";
                results.get(currentTest).expectedOutput = "1";
                try {
                    int result = Recursion.countWays(1);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test08CountWaysOnTwoStairs")) {
                results.get(currentTest).input = "n = 2";
                results.get(currentTest).expectedOutput = "2";
                try {
                    int result = Recursion.countWays(2);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test09CountWaysOnRecursiveCase")) {
                results.get(currentTest).input = "n = 5";
                results.get(currentTest).expectedOutput = "8";
                try {
                    int result = Recursion.countWays(5);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test10CountWaysOnLargeInput")) {
                results.get(currentTest).input = "n = 17";
                results.get(currentTest).expectedOutput = "2584";
                try {
                    int result = Recursion.countWays(17);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test11SolvableOnMinimalBoard")) {
                int[] board = {0};
                results.get(currentTest).input = "board = {0}";
                results.get(currentTest).expectedOutput = "true";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test12SolvableOnSolvableBoard")) {
                int[] board = {3, 6, 4, 1, 3, 4, 2, 5, 3, 0};
                results.get(currentTest).input = "board = {3, 6, 4, 1, 3, 4, 2, 5, 3, 0}";
                results.get(currentTest).expectedOutput = "true";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test13SolvableOnUnsolvableBoard")) {
                int[] board = {3, 1, 2, 3, 0};
                results.get(currentTest).input = "board = {3, 1, 2, 3, 0}";
                results.get(currentTest).expectedOutput = "false";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test14SolvableOnSolvableLoopyBoard")) {
                int[] board = {5, 3, 1, 3, 1, 4, 1, 0};
                results.get(currentTest).input = "board = {5, 3, 1, 3, 1, 4, 1, 0}";
                results.get(currentTest).expectedOutput = "true";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test15SolvableOnLinearSolution")) {
                int[] board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0};
                results.get(currentTest).input = "board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0}";
                results.get(currentTest).expectedOutput = "true";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test16SolvableOnBoardRequiringMultipleBacktracks")) {
                int[] board = {16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};
                results.get(currentTest).input = "board = {16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0}";
                results.get(currentTest).expectedOutput = "true";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
            else if (currentTest.equals("test17SolvableOnUnsolvableBoardRequiringExhaustiveSearch")) {
                int[] board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};
                results.get(currentTest).input = "board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0}";
                results.get(currentTest).expectedOutput = "false";
                try {
                    boolean result = Recursion.solvable(board);
                    results.get(currentTest).actualOutput = String.valueOf(result);
                } catch (Exception e) {
                    results.get(currentTest).actualOutput = "Exception: " + e.getMessage();
                }
            }
        }
        
        @Override
        public void testFailure(Failure failure) {
            if (results.containsKey(currentTest)) {
                results.get(currentTest).passed = false;
            }
        }
        
        public List<TestResult> getTestResults() {
            return new ArrayList<>(results.values());
        }
    }
    
    public static void main(String[] args) {
        JUnitCore junit = new JUnitCore();
        TestResultListener listener = new TestResultListener();
        junit.addListener(listener);
        
        Result result = junit.run(RecursionTests.class);
        testResults = listener.getTestResults();
        
        System.out.println("Tests run: " + result.getRunCount());
        System.out.println("Tests failed: " + result.getFailureCount());
        
        // Detailed output for each failure
        for (Failure failure : result.getFailures()) {
            // Print the test method name and the error message
            String testMethod = failure.getDescription().getMethodName();
            String errorMessage = failure.getMessage();
            String exceptionType = failure.getException().getClass().getSimpleName();
            
            String message = (errorMessage != null) ? errorMessage : exceptionType;
            System.out.println(testMethod + "(" + failure.getDescription().getClassName() + "): " + message);
            
            // Add stack trace first line for context
            if (failure.getTrace().contains("\n")) {
                String firstLine = failure.getTrace().substring(0, failure.getTrace().indexOf("\n"));
                System.out.println("  at " + firstLine.trim());
            }
        }
        
        // Create a detailed JSON summary with test results
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{\n");
        jsonBuilder.append("  \"passed\": ").append(result.wasSuccessful()).append(",\n");
        jsonBuilder.append("  \"total\": ").append(result.getRunCount()).append(",\n");
        jsonBuilder.append("  \"failed\": ").append(result.getFailureCount()).append(",\n");
        jsonBuilder.append("  \"testResults\": [\n");
        
        for (int i = 0; i < testResults.size(); i++) {
            jsonBuilder.append(testResults.get(i).toJson());
            if (i < testResults.size() - 1) {
                jsonBuilder.append(",\n");
            } else {
                jsonBuilder.append("\n");
            }
        }
        
        jsonBuilder.append("  ]\n");
        jsonBuilder.append("}");
        
        System.out.println(jsonBuilder.toString());
        
        // Exit with appropriate status code
        System.exit(result.wasSuccessful() ? 0 : 1);
    }
}