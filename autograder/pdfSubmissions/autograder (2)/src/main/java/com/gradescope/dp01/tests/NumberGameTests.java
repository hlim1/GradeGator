package com.gradescope.dp01.tests;

import org.junit.Test;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import static org.junit.Assert.*;
import com.gradescope.jh61b.grader.GradedTest;

import com.gradescope.dp01.NumberGame;

public class NumberGameTests {
    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=1, b=2, c=3", max_score=0.5)
    public void testAddition() {
        assertTrue(NumberGame.isPossible(1, 2, 3));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=1, b=2, c=-1", max_score=0.5)
    public void testSubtraction() {
        assertTrue(NumberGame.isPossible(1, 2, -1));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=9, b=16, c=7", max_score=0.5)
    public void testReverseSubtraction() {
        assertTrue(NumberGame.isPossible(9, 16, 7));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=4, b=3, c=12", max_score=0.5)
    public void testMultiplication() {
        assertTrue(NumberGame.isPossible(4, 3, 12));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=24, b=8, c=3", max_score=0.5)
    public void testDivision() {
        assertTrue(NumberGame.isPossible(24, 8, 3));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=8, b=24, c=3", max_score=0.5)
    public void testReverseDivision() {
        assertTrue(NumberGame.isPossible(8, 24, 3));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=7, b=9, c=-15", max_score=0.5)
    public void testImpossible() {
        assertFalse(NumberGame.isPossible(7, 9, -15));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing isPossible on a=5, b=3, c=1", max_score=0.5)
    public void testIntegerDivisionCornerCase() {
        assertFalse(NumberGame.isPossible(5, 3, 1));
    }
}
