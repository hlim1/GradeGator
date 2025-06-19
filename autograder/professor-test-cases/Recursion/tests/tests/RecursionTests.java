package tests;

import org.junit.Test;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

import java.util.*;
import static org.junit.Assert.*;
import tests.GradedTest;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class RecursionTests {

    // --------------------------------------------------------------------
    // mcCarthy91 tests
    @Test(timeout=1000)
    @GradedTest(name="Testing mcCarthy91 with n = 17", max_score=1.0)
    public void test00McCarthyPositiveN() {
        assertEquals(91, Recursion.mcCarthy91(17));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing mcCarthy91 with n = -17", max_score=0.5)
    public void test01McCarthyNegativeN() {
        assertEquals(91, Recursion.mcCarthy91(-17));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing mcCarthy91 with n = 255", max_score=0.5)
    public void test02McCarthyLargeN() {
        assertEquals(245, Recursion.mcCarthy91(255));
    }
    // --------------------------------------------------------------------

    // --------------------------------------------------------------------
    // toBinary tests
    @Test(timeout=1000)
    @GradedTest(name="Testing toBinary with n = 1000", max_score=1.0)
    public void test03ToBinaryMixedRepr() {
        assertEquals("1111101000", Recursion.toBinary(1000));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing toBinary with n = 15", max_score=1.0)
    public void test04ToBinaryAllOnes() {
        assertEquals("1111", Recursion.toBinary(15));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing toBinary with n = 0", max_score=1.0)
    public void test05ToBinaryOn0() {
        assertEquals("0", Recursion.toBinary(0));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing toBinary with n = 1", max_score=1.0)
    public void test06ToBinaryOn1() {
        assertEquals("1", Recursion.toBinary(1));
    }
    // --------------------------------------------------------------------

    // --------------------------------------------------------------------
    // countWays tests
    @Test(timeout=1000)
    @GradedTest(name="Testing countWays with 1 stair", max_score=1.0)
    public void test07CountWaysOnSingleStair() {
        assertEquals(1, Recursion.countWays(1));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing countWays with 2 stairs", max_score=1.0)
    public void test08CountWaysOnTwoStairs() {
        assertEquals(2, Recursion.countWays(2));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing countWays with 5 stairs", max_score=2.0)
    public void test09CountWaysOnRecursiveCase() {
        assertEquals(8, Recursion.countWays(5));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing countWays with 17 stairs", max_score=2.0)
    public void test10CountWaysOnLargeInput() {
        assertEquals(2584, Recursion.countWays(17));
    }
    // --------------------------------------------------------------------

    // --------------------------------------------------------------------
    // solvable tests
    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {0}", max_score=0.5)
    public void test11SolvableOnMinimalBoard() {
        int[] board = {0};
        int[] boardDuplicate = {0};

        assertEquals(true, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {3, 6, 4, 1, 3, 4, 2, 5, 3, 0}", max_score=1.5)
    public void test12SolvableOnSolvableBoard() {
        int[] board = {3, 6, 4, 1, 3, 4, 2, 5, 3, 0};
        int[] boardDuplicate = {3, 6, 4, 1, 3, 4, 2, 5, 3, 0};

        assertEquals(true, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {3, 1, 2, 3, 0}", max_score=1.5)
    public void test13SolvableOnUnsolvableBoard() {
        int[] board = {3, 1, 2, 3, 0};
        int[] boardDuplicate = {3, 1, 2, 3, 0};

        assertEquals(false, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {5, 3, 1, 3, 1, 4, 1, 0}", max_score=1.0)
    public void test14SolvableOnSolvableLoopyBoard() {
        int[] board = {5, 3, 1, 3, 1, 4, 1, 0};
        int[] boardDuplicate = {5, 3, 1, 3, 1, 4, 1, 0};

        assertEquals(true, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0}", max_score=1.0)
    public void test15SolvableOnLinearSolution() {
        int[] board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0};
        int[] boardDuplicate = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0};

        assertEquals(true, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0}", max_score=1.5)
    public void test16SolvableOnBoardRequiringMultipleBacktracks() {
        int[] board = {16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};
        int[] boardDuplicate = {16, 16, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};

        assertEquals(true, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing solvable with board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0}", max_score=1.0)
    public void test17SolvableOnUnsolvableBoardRequiringExhaustiveSearch() {
        int[] board = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};
        int[] boardDuplicate = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0};

        assertEquals(false, Recursion.solvable(board));
        assertArrayEquals("solvable() modifies original board", 
                          boardDuplicate, board);
    }
    // --------------------------------------------------------------------
}