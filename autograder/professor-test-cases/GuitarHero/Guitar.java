
/** An interface defining the behavioral contract of an abstract guitar.
  * 
  * This interface specifies a set of methods that must be supported by any
  * stringed instrument, that can play various notes when certain keys are
  * pressed. 
  * 
  * @author Stuart Reges
  * @author Raghuram Ramanujan
*/

public interface Guitar {
    
    /** Returns whether there is a string that corresponds to this character. 
      *
      * @param key the key on the keyboard to look up
      * @return true iff the suppleid key maps to a string in this instrument
    */
    public boolean hasString(char key);

    /** Plucks the string corresponding to the key pressed by the user.
      * 
      * @param key the key pressed by the user
    */
    public void pluck(char key);

    /** Plays the current sound (the sum of all strings) */
    public void play();

    /** Advances the string simulation by having each string tic forward */
    public void tic();
    
}