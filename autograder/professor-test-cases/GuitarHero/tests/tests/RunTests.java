package tests;

import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import org.junit.runner.Description;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

import tests.GuitarHeroTests.TestData;
import java.util.*;

/**
 * Runs all JUnit tests in GuitarHeroTests and prints:
 *
 *   Tests run: <n>
 *   Tests failed: <m>
 *   { ...json summary... }
 *
 * Stdout therefore matches the format your grader expects.
 */
public class RunTests {

    /* ---------- small POJO that becomes a JSON row ---------- */
    private static class TestResult {
        String  testName;
        boolean passed = true;          // default true
        String  input = "";
        String  expectedOutput = "";
        String  actualOutput   = "";

        String toJson() {
            return String.format(
                "    {\n" +
                "      \"testName\": \"%s\",\n" +
                "      \"passed\": %s,\n" +
                "      \"input\": \"%s\",\n" +
                "      \"expectedOutput\": \"%s\",\n" +
                "      \"actualOutput\": \"%s\"\n" +
                "    }",
                escape(testName), passed,
                escape(input), escape(expectedOutput), escape(actualOutput));
        }
        private static String escape(String s) {
            return s == null ? "" : s.replace("\"", "\\\"");
        }
    }

    /* ---------- custom RunListener that harvests data ---------- */
    private static class Listener extends RunListener {
        private final Map<String,TestResult> map = new LinkedHashMap<>();

        @Override
        public void testStarted(Description d) {
            map.put(d.getMethodName(), new TestResult());
            map.get(d.getMethodName()).testName = d.getMethodName();
        }

        @Override
        public void testFailure(Failure f) {
            map.get(f.getDescription().getMethodName()).passed = false;
        }

        @Override
        public void testFinished(Description d) {
            String name = d.getMethodName();
            TestResult tr = map.get(name);
            if (tr == null) return;  // safety

            /* pull extra info the test stored */
            TestData td = GuitarHeroTests.currentTestData.get();
            if (td == null) {
                td = GuitarHeroTests.lastData;     // cross-thread fallback
            }
            if (td != null) {
                tr.input          = td.input;
                tr.expectedOutput = td.expectedOutput;
                tr.actualOutput   = td.actualOutput;
            }

            // Clean up ThreadLocal to avoid leaks
            GuitarHeroTests.currentTestData.remove();
        }

        /* give main() the list of rows */
        List<TestResult> getResults() { return new ArrayList<>(map.values()); }
    }

    /* --------------------------- main --------------------------- */
    public static void main(String[] args) {
        JUnitCore junit   = new JUnitCore();
        Listener  listener = new Listener();
        junit.addListener(listener);

        Result result = junit.run(GuitarHeroTests.class);
        List<TestResult> tests = listener.getResults();

        /* (1) human-readable summary */
        System.out.println("Tests run: "   + result.getRunCount());
        System.out.println("Tests failed: " + result.getFailureCount());

        /* (2) JSON summary */
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"passed\": ").append(result.wasSuccessful()).append(",\n");
        sb.append("  \"total\": ").append(result.getRunCount()).append(",\n");
        sb.append("  \"failed\": ").append(result.getFailureCount()).append(",\n");
        sb.append("  \"testResults\": [\n");

        for (int i = 0; i < tests.size(); i++) {
            sb.append(tests.get(i).toJson());
            sb.append(i < tests.size() - 1 ? ",\n" : "\n");
        }
        sb.append("  ]\n}");
        System.out.println(sb.toString());

        System.exit(result.wasSuccessful() ? 0 : 1);
    }
}
