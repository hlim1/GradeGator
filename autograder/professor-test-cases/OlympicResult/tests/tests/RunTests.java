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
            
            // Capture input based on test method name
            if (currentTest.equals("testOlympicResult1")) {
                OlympicResult[] medalTable = new OlympicResult[5];
                medalTable[0] = new OlympicResult("ITA", 1, 0, 0);
                medalTable[1] = new OlympicResult("JPN", 0, 1, 0);
                medalTable[2] = new OlympicResult("AUS", 0, 0, 1);
                medalTable[3] = new OlympicResult("KOR", 3, 1, 0);
                medalTable[4] = new OlympicResult("UKR", 0, 0, 1);
                
                results.get(currentTest).input = Arrays.toString(medalTable);
                results.get(currentTest).expectedOutput = "[KOR 3 1 0, ITA 1 0 0, JPN 0 1 0, AUS 0 0 1, UKR 0 0 1]";
                
                // Get actual output
                OlympicResult[] copyTable = new OlympicResult[5];
                for (int i = 0; i < medalTable.length; i++) {
                    copyTable[i] = medalTable[i];
                }
                Arrays.sort(copyTable);
                results.get(currentTest).actualOutput = Arrays.toString(copyTable);
            }
            else if (currentTest.equals("testOlympicResult2")) {
                OlympicResult[] medalTable = new OlympicResult[10];        
                medalTable[0] = new OlympicResult("AUT", 3, 4, 2);
                medalTable[1] = new OlympicResult("CAN", 0, 0, 1); 
                medalTable[2] = new OlympicResult("CRO", 0, 1, 0); 
                medalTable[3] = new OlympicResult("FRA", 0, 1, 1); 
                medalTable[4] = new OlympicResult("GER", 1, 1, 1); 
                medalTable[5] = new OlympicResult("ITA", 0, 1, 1); 
                medalTable[6] = new OlympicResult("NOR", 1, 0, 2); 
                medalTable[7] = new OlympicResult("SLO", 2, 0, 0); 
                medalTable[8] = new OlympicResult("SUI", 2, 0, 1); 
                medalTable[9] = new OlympicResult("USA", 2, 1, 2);
                
                results.get(currentTest).input = Arrays.toString(medalTable);
                results.get(currentTest).expectedOutput = "[AUT 3 4 2, USA 2 1 2, SUI 2 0 1, SLO 2 0 0, GER 1 1 1, NOR 1 0 2, FRA 0 1 1, ITA 0 1 1, CRO 0 1 0, CAN 0 0 1]";
                
                // Get actual output
                OlympicResult[] copyTable = new OlympicResult[10];
                for (int i = 0; i < medalTable.length; i++) {
                    copyTable[i] = medalTable[i];
                }
                Arrays.sort(copyTable);
                results.get(currentTest).actualOutput = Arrays.toString(copyTable);
            }
            else if (currentTest.equals("testOlympicResult3")) {
                OlympicResult[] medalTable = new OlympicResult[6];
                medalTable[0] = new OlympicResult("AAA", 1, 0, 0);
                medalTable[1] = new OlympicResult("BBB", 1, 1, 0);
                medalTable[2] = new OlympicResult("CCC", 1, 1, 1);
                medalTable[3] = new OlympicResult("DDD", 1, 1, 1);
                medalTable[4] = new OlympicResult("EEF", 0, 0, 0);
                medalTable[5] = new OlympicResult("EEE", 0, 0, 0);
                
                results.get(currentTest).input = Arrays.toString(medalTable);
                results.get(currentTest).expectedOutput = "[CCC 1 1 1, DDD 1 1 1, BBB 1 1 0, AAA 1 0 0, EEE 0 0 0, EEF 0 0 0]";
                
                // Get actual output
                OlympicResult[] copyTable = new OlympicResult[6];
                for (int i = 0; i < medalTable.length; i++) {
                    copyTable[i] = medalTable[i];
                }
                Arrays.sort(copyTable);
                results.get(currentTest).actualOutput = Arrays.toString(copyTable);
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
        
        Result result = junit.run(OlympicResultTests.class);
        testResults = listener.getTestResults();
        
        System.out.println("Tests run: " + result.getRunCount());
        System.out.println("Tests failed: " + result.getFailureCount());
        
        // Detailed output for each failure
        for (Failure failure : result.getFailures()) {
            // Print the test method name and the error message
            String testMethod = failure.getDescription().getMethodName();
            String errorMessage = failure.getMessage();
            String exceptionType = failure.getException().getClass().getSimpleName();
            
            // Fixed ternary operator precedence issue
            String message = (errorMessage != null) ? errorMessage : exceptionType;
            System.out.println(testMethod + "(" + failure.getDescription().getClassName() + "): " + message);
            
            // Add stack trace first line for context - helps identify where the failure occurred
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