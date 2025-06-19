package tests;

import org.junit.Test;
import java.io.*;                  // for FileNotFoundException
import java.util.*;                // for Scanner
import static org.junit.Assert.*;  // requires JUnit 4.13 for assertThrows
import tests.GradedTest;

// Direct imports instead of package imports
import GuitarString;
import Guitar37;
import Guitar;
import StdAudio;

public class GuitarHeroTests {
    // Add TestData class for storing test information
    public static class TestData {
        public String input;
        public String expectedOutput;
        public String actualOutput;
    }
    
    // Add ThreadLocal for RunTests.java to access
    public static ThreadLocal<TestData> currentTestData = new ThreadLocal<>();
    
    public static volatile TestData lastData;
    // Helper method to set test information
    private void setTestInfo(String input, String expected, String actual) {
        TestData data = new TestData();
        data.input = input;
        data.expectedOutput = expected;
        data.actualOutput = actual;
        currentTestData.set(data);

        lastData = data;
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing GuitarString with frequency -1.0", max_score=0.5)
    public void testNegativeFreq() {
        assertThrows(IllegalArgumentException.class, () -> {
            GuitarString gs = new GuitarString(-1.0);
        });
        setTestInfo("frequency = -1.0", 
                   "throws IllegalArgumentException", 
                   "throws IllegalArgumentException");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing GuitarString with frequency 44100.0", max_score=0.5)
    public void testSmallBuffer() {
        assertThrows(IllegalArgumentException.class, () -> {
            GuitarString gs = new GuitarString(44100.0);
        });
        setTestInfo("frequency = 44100.0", 
                   "throws IllegalArgumentException", 
                   "throws IllegalArgumentException");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing GuitarString with array [1]", max_score=0.5)
    public void testFreqArraySize() {
        assertThrows(IllegalArgumentException.class, () -> {
            GuitarString gs = new GuitarString(new double[1]);
        });
        setTestInfo("array = [1]", 
                   "throws IllegalArgumentException", 
                   "throws IllegalArgumentException");
    }
 
    @Test(timeout=1000)
    @GradedTest(name="Testing Guitar37 with key press '6'", max_score=0.5)
    public void testIllegalKeyPress() {
        assertThrows(IllegalArgumentException.class, () -> {
            Guitar g = new Guitar37();
            g.pluck('6');
        });
        setTestInfo("key = '6'", 
                   "throws IllegalArgumentException", 
                   "throws IllegalArgumentException");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing GuitarString with frequency 10000.0", max_score=3)
    public void testWithFrequency() {

        GuitarString gs = new GuitarString(10000.0);

        Queue<Double> expected = new LinkedList<Double>();
        Queue<Double> result = new LinkedList<Double>();

        int size = (int)Math.round(StdAudio.SAMPLE_RATE / 10000.0);

        for (int i = 0; i < size; i++) {
            result.add(gs.sample());
            expected.add(0.0);
            gs.tic();
        }

        assertEquals(expected, result);
        setTestInfo("frequency = 10000.0", 
                   "All samples should be 0.0", 
                   "All samples were 0.0");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing GuitarString with array {0.0, 0.25, 0.5, 0.375}", max_score=3)
    public void testWithArray() throws FileNotFoundException {

        double[] data = new double[] {0.0, 0.25, 0.5, 0.375};
        GuitarString gs = new GuitarString(data);
        boolean mismatch = false;
        double sample = 0.0;
    
        // Updated file path to match new structure
        Scanner input = new Scanner(new File("string-array.txt"));

        for (int time = 0; time < 10 * data.length; time++) {
            double sample2 = gs.sample();
            sample = input.nextDouble();
            if (Math.abs(sample - sample2) > 1E-12) {
                mismatch = true;
                break;
            }
            gs.tic();
        }

        assertFalse("Mismatch on sample: " + sample, mismatch);  
        setTestInfo("array = {0.0, 0.25, 0.5, 0.375}", 
                   "Values from string-array.txt", 
                   "Matching sample values");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing time() with array {0.0, 0.25, 0.5, 0.375}", max_score=3)
    public void testCountTics() throws FileNotFoundException {

        double[] data = new double[] {0.0, 0.25, 0.5, 0.375};
        GuitarString gs = new GuitarString(data);
        boolean mismatch = false;
        int time;
    
        for (time = 0; time < 10 * data.length; time++) {
            if (time != gs.time()) {
                mismatch = true;
                break;
            }
            gs.tic();
        }

        assertFalse("Mismatch at time: " + time, mismatch);  
        setTestInfo("array = {0.0, 0.25, 0.5, 0.375}", 
                   "time() should match tic count", 
                   "time() correctly matches tic count");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing pluck() with frequency 10000.0", max_score=3)
    public void testPluck() {
        GuitarString gs = new GuitarString(10000.0);
        int size = (int)Math.round(StdAudio.SAMPLE_RATE / 10000.0);
        boolean range = true;
        boolean zeroes = true;

        gs.pluck();

        for (int i = 0; i < size; i++) {
            if (gs.sample() < -0.5 || gs.sample() > 0.5) {
                range = false;
            }
            if (gs.sample() != 0.0) {
                zeroes = false;
            }
            gs.tic();
        }

        assertTrue(range && !zeroes);
        setTestInfo("frequency = 10000.0, then pluck()", 
                   "Samples between -0.5 and 0.5, not all 0", 
                   "Samples were in range and not all 0");
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing tic() with array {0.0, 0.25}", max_score=3)
    public void testTic() {
        GuitarString gs = new GuitarString(new double[] {0.0, 0.25});
        gs.tic();
        gs.tic();
        double expected = (0.0 + 0.25) * 0.996 / 2.0;
        assertEquals(expected, gs.sample(), 0);
        setTestInfo("array = {0.0, 0.25}, tic() twice", 
                   "sample() = " + expected, 
                   "sample() = " + gs.sample());
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing Guitar37 with key press 'y'", max_score=1)
    public void testGuitar37() {
        Guitar g = new Guitar37();
        assertTrue(g.hasString('y'));
        setTestInfo("Guitar37 object, key = 'y'", 
                   "hasString('y') returns true", 
                   "hasString('y') returned true");
    }
}