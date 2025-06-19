package com.gradescope.dp01.tests;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runner.JUnitCore;
import org.junit.runner.Result;
import com.gradescope.jh61b.grader.GradedTestListenerJSON;

import com.gradescope.dp01.tests.EightDaysAWeekTest;
import com.gradescope.dp01.tests.NumericTriangleTests;
import com.gradescope.dp01.tests.NumberGameTests;


@RunWith(Suite.class)
@Suite.SuiteClasses({
        EightDaysAWeekTest.class,
        NumericTriangleTests.class,
        NumberGameTests.class
    })
public class RunTests {
    public static void main(String[] args) {
        JUnitCore runner = new JUnitCore();
        runner.addListener(new GradedTestListenerJSON());
        Result r = runner.run(RunTests.class);
    }
}
