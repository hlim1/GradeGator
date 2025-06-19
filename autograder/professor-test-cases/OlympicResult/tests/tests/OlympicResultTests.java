package tests;

import org.junit.Test;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

import java.util.*;
import static org.junit.Assert.*;
import tests.GradedTest;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class OlympicResultTests {
    @Test(timeout=1000)
    @GradedTest(name="Testing OlympicResult with [ITA 1 0 0, JPN 0 1 0, AUS 0 0 1, KOR 3 1 0, UKR 0 0 1]", max_score=1.0)
    public void testOlympicResult1() {
        OlympicResult[] medalTable = new OlympicResult[5];
        medalTable[0] = new OlympicResult("ITA", 1, 0, 0);
        medalTable[1] = new OlympicResult("JPN", 0, 1, 0);
        medalTable[2] = new OlympicResult("AUS", 0, 0, 1);
        medalTable[3] = new OlympicResult("KOR", 3, 1, 0);
        medalTable[4] = new OlympicResult("UKR", 0, 0, 1);
        
        Arrays.sort(medalTable);

        assertEquals("[KOR 3 1 0, ITA 1 0 0, JPN 0 1 0, AUS 0 0 1, UKR 0 0 1]",
                     Arrays.toString(medalTable));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing OlympicResult with Sochi 2014 alpine skiing medals", max_score=1.0)
    public void testOlympicResult2() {
        OlympicResult[] medalTable = new OlympicResult[10];        
        medalTable[0] = new OlympicResult("AUT", 3, 4, 2);
        medalTable[1] = new OlympicResult("CAN", 0, 0, 1); 
        medalTable[2] = new OlympicResult("CRO", 0, 1, 0); 
        medalTable[3] = new OlympicResult("FRA", 0, 1, 1); 
        medalTable[4] = new OlympicResult("GER", 1, 1, 1); 
        medalTable[5] = new OlympicResult("ITA", 0, 1, 1); 
        medalTable[6] = new OlympicResult("NOR", 1, 0, 2); 
        medalTable[7] = new OlympicResult("SLO", 2, 0, 0); 
        medalTable[8] = new OlympicResult("SUI", 2, 0, 1); 
        medalTable[9] = new OlympicResult("USA", 2, 1, 2); 
        
        Arrays.sort(medalTable);

        assertEquals("[AUT 3 4 2, USA 2 1 2, SUI 2 0 1, SLO 2 0 0, GER 1 1 1, NOR 1 0 2, FRA 0 1 1, ITA 0 1 1, CRO 0 1 0, CAN 0 0 1]",
                     Arrays.toString(medalTable));
    }

    @Test(timeout=1000)
    @GradedTest(name="Testing OlympicResult with [AAA 1 0 0, BBB 1 1 0, CCC 1 1 1, DDD 1 1 1, EEF 0 0 0, EEE 0 0 0]", max_score=2.0)
    public void testOlympicResult3() {
        OlympicResult[] medalTable = new OlympicResult[6];
        medalTable[0] = new OlympicResult("AAA", 1, 0, 0);
        medalTable[1] = new OlympicResult("BBB", 1, 1, 0);
        medalTable[2] = new OlympicResult("CCC", 1, 1, 1);
        medalTable[3] = new OlympicResult("DDD", 1, 1, 1);
        medalTable[4] = new OlympicResult("EEF", 0, 0, 0);
        medalTable[5] = new OlympicResult("EEE", 0, 0, 0);
        
        Arrays.sort(medalTable);

        assertEquals("[CCC 1 1 1, DDD 1 1 1, BBB 1 1 0, AAA 1 0 0, EEE 0 0 0, EEF 0 0 0]",
                     Arrays.toString(medalTable));
    }
}