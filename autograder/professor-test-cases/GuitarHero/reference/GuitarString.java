import java.util.*;

/** GuitarString class that models a vibrating guitar string
 *
 * Time Spent: 2 hours
 * @author David Yoder
 */

public class GuitarString {

// Instance variables

    Queue<Double> RingBuffer;
    int time;
    int n;
    
/** GuitarString constructor that checks if the frequency
 *  and ring buffer are of proper value
 *  Creates ring buffer of desired frequency
 *  takes in @param frequency
 */

    public GuitarString(double frequency) {
        time = 0; // 0 assigned to time
        if (frequency <= 0) {
            throw new IllegalArgumentException(); // throws Exception if frequency is not of adequate amount
        }
        n = (int) Math.round(StdAudio.SAMPLE_RATE / frequency); // a value is given to n, sampling rate divided by frequency
        if (n < 2) { 
            throw new IllegalArgumentException(); // throws Exception if n is of adequate amount
        }
        RingBuffer = new LinkedList<Double>(); // Assigns a linked list to RingBuffer
        for (int i = 0; i <= n; i++) {
            RingBuffer.add(0.0); // adds to RingBuffer n times
        }
}

/** GuitarString testing constrictor */


    public GuitarString(double[] init) {
        time = 0; // 0 assigned to time
        RingBuffer = new LinkedList<Double>(); // linked list assigned to buffer
        n = init.length; // length of initilize assigned to n
        if(n < 2) {
            throw new IllegalArgumentException(); // checks to see if n is of adequate length
        }
        for (int i = 0; i < n; i++) {
            RingBuffer.add(init[i]); // the init at the current index is added to RingBuffer
        }

    }
    
/** pluck method
 *  Replaces the n elements in the buffer 
 *  with n number of random values between -0.5 and +0.5
 */

    public void pluck() {
        RingBuffer.clear(); // RingBuffer is cleared
        for(int i = 1; i <= n; i++) { // loops n times
            RingBuffer.add(Math.random() - 0.5); // random values between -0.5 and +0.5 are added to the buffer
        }
    }

/** tic method
 *  Applies the Karplus-Strong update
 */

    public void tic() {
        double t1 = RingBuffer.remove(); // deletes sample at front of buffer
        double t2 = RingBuffer.peek(); // gets first value of buffer
        RingBuffer.add(((t1 + t2) * 0.5) * 0.996); // finds the average of the first two and multiplies by the decay factor
        time++; // time is incrimented by one
    }

/** sample method
 * @returns The current value in RingBuffer
 */

    public double sample() {
        return RingBuffer.peek(); // gets value at the beginning of the buffer
    }

/** time method
 * @returns the number of times tic has been called
 */

    public int time() {
        return time;
    }

}
