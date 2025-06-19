package com.gradescope.dp01.tests;

import org.junit.Test;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import static org.junit.Assert.*;
import com.gradescope.jh61b.grader.GradedTest;

import com.gradescope.dp01.NumericTriangle;

public class NumericTriangleTests {
    @Test(timeout=1000)
    @GradedTest(name="Testing drawNumericTriangle on height = 5", max_score=1)
    public void testHeight5() {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        NumericTriangle.drawNumericTriangle(5);
        String answer = ("    1\n" +
                         "   22\n" +
                         "  333\n" +
                         " 4444\n" +
                         "55555\n");
        assertEquals(answer, output.toString());
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing drawNumericTriangle on height = 1", max_score=1)
    public void testHeight1() {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        NumericTriangle.drawNumericTriangle(1);
        String answer = "1\n";
        assertEquals(answer, output.toString());
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing drawNumericTriangle on height = 9", max_score=1)
    public void testHeight9() {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        NumericTriangle.drawNumericTriangle(9);
        String answer = ("        1\n" +
                         "       22\n" +
                         "      333\n" +
                         "     4444\n" +
                         "    55555\n" +
                         "   666666\n" +
                         "  7777777\n" +
                         " 88888888\n" +
                         "999999999\n");
        assertEquals(answer, output.toString());
    }
}
