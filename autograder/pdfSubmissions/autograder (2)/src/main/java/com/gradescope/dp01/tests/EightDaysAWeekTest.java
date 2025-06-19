package com.gradescope.dp01.tests;

import org.junit.Test;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import static org.junit.Assert.*;
import com.gradescope.jh61b.grader.GradedTest;
import java.util.LinkedList;

import com.gradescope.dp01.EightDaysAWeek;

public class EightDaysAWeekTest {
    @Test(timeout=1000)
    @GradedTest(name="Test the output from printEightDaysAWeek", max_score=1)
    public void testEightDaysAWeek() {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        System.setOut(new PrintStream(output));
        EightDaysAWeek.printEightDaysAWeek();
        String answer = ("Ooh I need your love babe\n" +
                         "Guess you know it's true\n" +
                         "Hope you need my love babe\n" +
                         "Just like I need you\n" +
                         "Hold me, love me, hold me, love me\n" +
                         "Ain't got nothing but love babe\n" +
                         "Eight days a week\n\n" +
                         "Love you every day girl\n" +
                         "Always on my mind\n" +
                         "One thing I can say girl\n" +
                         "Love you all the time\n" +
                         "Hold me, love me, hold me, love me\n" +
                         "Ain't got nothing but love babe\n" +
                         "Eight days a week\n\n" +
                         "Eight days a week\n" +
                         "I love you\n" +
                         "Eight days a week\n" +
                         "Is not enough to show I care\n\n" +
                         "Ooh I need your love babe\n" +
                         "Guess you know it's true\n" +
                         "Hope you need my love babe\n" +
                         "Just like I need you\n" +
                         "Hold me, love me, hold me, love me\n" +
                         "Ain't got nothing but love babe\n" +
                         "Eight days a week\n\n" +
                         "Eight days a week\n" +
                         "I love you\n" +
                         "Eight days a week\n" +
                         "Is not enough to show I care\n\n" +
                         "Love you every day girl\n" +
                         "Always on my mind\n" +
                         "One thing I can say girl\n" +
                         "Love you all the time\n" +
                         "Hold me, love me, hold me, love me\n" +
                         "Ain't got nothing but love babe\n" +
                         "Eight days a week\n" +
                         "Eight days a week\n" +
                         "Eight days a week\n");
        String result = output.toString();
        assertEquals(answer, result);
    }
}
