
/**  Implementation of a thirty-seven string guitar
 * 
 * Time Spent: 1 hour 30 minutes
 * @author David Yoder
*/

public class Guitar37 implements Guitar {
    GuitarString[] strings; // initializes GuitarString as an array
    // keyboard layout
    public static final String KEYBOARD =  // provides the keys that play different notes
        "q2we4r5ty7u8i9op-[=zxdcfvgbnjmk,.;/' ";
    

/** Guitar 37  method
 *  Creates 37 different strings
 *  each with different frequencies
 * */        

    public Guitar37() {
        strings = new GuitarString[37]; // GuitarString array assigned to strings
        for(int i = 0; i < 37; i++) { // loops through amount of keys to be played
            double freq = 440 * Math.pow(2, ((i-24)/12)); // frequency for each i value is found
            strings[i] = new GuitarString(freq); // frequency is added to corresponding position in strings
        }
}

/** hasString method
 *  Checks to see if user input corresponds
 *  to the keys in the string
 * @returns true if the key is in the string
 *  and false otherwise
 */

    public boolean hasString(char string) {
        for(int i = 0; i < 37; i++) {
            if(string == KEYBOARD.charAt(i)) { // for each character in the string, checks if it is found in keyboard
                return true; // returns true if found
            }
        }
        return false; // false otherwise
    }


/** pluck method
 *  If the user input is not in the keyboard string
 *  throws IllegalArgumentException
 *  Otherwise, the pluck function is called for each string
 */

    public void pluck(char string) {
        if(KEYBOARD.indexOf(string) < 0){
            throw new IllegalArgumentException(); // if the key is not in the keyboard string, throws IllegalArgumentException
        }
        for(int i = 0; i < 37; i++) {
            if(string == KEYBOARD.charAt(i)) { // if the key is found
                strings[i].pluck();  // calls .pluck function for the string at index
            }
        }
    }


/** play method
 *  Each string is added to the sample variable
 *  StdAudio.play is called on the sample
 */

    public void play() {
        double sample = 0; // empty variable
        for(int i = 0; i < 37; i++) {
            sample += strings[i].sample(); // each frequency with .sample called is added to sample
        }
        StdAudio.play(sample); // sample is played
    }

/** tic method
 *  calls .tic for each string
 */
    public void tic() {
        for(int i = 0; i < 37; i++) { // loops through all strings
            strings[i].tic(); // .tic for the string at index is called
        }
    }

        

}

