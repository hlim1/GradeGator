
import java.util.*;

/** Solutions to the recursive exercises from HW 5.
  * 
  * @author RR
  */
public class Recursion {
    
    /** Returns the value of the McCarthy 91 function for a given integer.
      * 
      * @param n the input integer.
      * @return the McCarthy 91 value of n.
      */
    public static int mcCarthy91(int n ) {
        
        if (n > 100)
            return (n - 10);
        
        return mcCarthy91(mcCarthy91(n + 11));
        
    }
    
    
    /** Returns the base-2 expansion of a given integer as a String.
      * 
      * @param n the base-10 number we wish to convert to binary (>= 0).
      * @return the binary expansion of n.
      */
    public static String toBinary(int n) {
        
        if (n == 0)
            return "0";
        
        if (n == 1)
            return "1";
        
        return toBinary(n / 2) + (n % 2);
    }
    
    
    /** Returns the number of ways a staircase can be climbed using 1 or 2 
      * steps at a time.
      * 
      * @param numStairs the total height of the staircase (>= 1).
      * @return the number of ways to climb the entire flight of stairs.
      */
    public static int countWays(int numStairs) {
        
        if (numStairs == 1)
            return 1;
        
        if (numStairs == 2)
            return 2;
        
        return countWays(numStairs - 1) + countWays(numStairs - 2);
    }
           
    
    /** Returns whether the given marker puzzle is solvable.
      * 
      * The puzzle consists of an array of positive integers, with a marker 
      * that starts off at position 0. A move consists of moving the marker by 
      * the number of steps indicated in the current position, either to the 
      * left or the right. The goal is to determine whether there exists a 
      * sequence of moves that brings the marker to the right-most position in 
      * the array (i.e., whether the puzzle is solvable).
      * 
      * @param board the board state.
      * @return true iff the puzzle is solvable.
      */
    public static boolean solvable(int[] board) {
        return solvable(board, 0);
    }
    
    
    /** Helper method for the solvable method above.
      * 
      * @param board the board state.
      * @param position the current position of the marker on the board.
      * @return true iff the puzzle is solvable from the given position.
      */
    private static boolean solvable(int[] board, int position) {
        // Marker is out of bounds
        if ((position < 0) || (position >= board.length))
            return false;
        
        // We've returned to a position from our history and created a loop.
        // If a solution exists, then it must be possible to execute it without
        // loops, so look for that one instead.
        if (board[position] < 0)
            return false;
        
        // Solved!
        if (position == board.length - 1)
            return true;
        
        // Mark the current position, search both left and right, and then 
        // unmark.
        board[position] *= -1;
        boolean retVal = (solvable(board, position - board[position]) 
                              || solvable(board, position + board[position]));
        board[position] *= -1;
        
        return retVal;            
    }
    
    
    /** Returns whether the given marker puzzle is solvable.
      * 
      * The puzzle consists of an array of positive integers, with a marker 
      * that starts off at position 0. A move consists of moving the marker by 
      * the number of steps indicated in the current position, either to the 
      * left or the right. The goal is to determine whether there exists a 
      * sequence of moves that brings the marker to the right-most position in 
      * the array (i.e., whether the puzzle is solvable).
      * 
      * @param board the board state.
      * @return true iff the puzzle is solvable.
      */
    public static boolean iterativeSolvable(int[] board) {
        
        Stack<Integer> choicePoints = new Stack<Integer>();
        boolean retVal = false;
        
        choicePoints.push(0); // initial placement of marker
        
        while (!choicePoints.empty()) {
            int position = choicePoints.pop();
            
            // Solved!
            if (position == board.length - 1) {
                retVal = true;
                break;
            }
            
            // If the marker position is in-bounds and not a position we've
            // already visited before (so we're not stuck in a loop), then
            // add its successors to the list of positions to visit next.
            if ((position >= 0) && (position < board.length) 
                    && (board[position] > 0)) {
                board[position] *= -1;
                choicePoints.push(position - board[position]);
                choicePoints.push(position + board[position]);
            }
        }
        
        // restore original board
        for (int i = 0; i < board.length; i++) {
            if (board[i] < 0)
                board[i] *= -1;
        }
        
        return retVal;        
    }
           
}
