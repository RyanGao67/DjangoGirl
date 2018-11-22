package HomeworkTwo;

import java.awt.*;
import java.awt.geom.*;
import java.io.*;
import robocode.*;
//import HomeworkOne.BackPropagationLearning;

public class MartinRobot extends AdvancedRobot
{
	public static final double PI = Math.PI;
	private RobotTarget target;
	//private QTable table;
	//private QLearning learner;
	private NNLearner nnlearner;
	
	private double reinforcement = 0.0;
	private double firePower;
	private int isHitWall = 0;
	private int isHitByBullet = 0;

	//Change parameters to control the learning process.
	//Input "0" for Q (off-policy), and "1" for SARSA (on-policy).
	//Input epsilon (between 0 and 1) to control exploration.
	//Input the test time.
	//private int policy = 0;
	//private double explorationRate = 0.0;
	public static int NumTest = 1000;
	
	//Set the parameters for output files
	static int total = 0;
	static int total2 = 0;
	private static double diffQSum = 0.0;
	private static int diffQTime = 0;
	private static double diffQValueArray[] = new double[NumTest];
	private static double diffQValueArray2[] = new double[30000];
	private static double newSpecificQDiff = 0.0;
	//private static double oldSpecificQDiff = 0.0;
	
	//************************************************************
	//Start running the game...
    //************************************************************
	public void run()
	{
		//table = new QTable();
	    //loadData();
	    //learner = new QLearning(table);
		nnlearner = new NNLearner();
		loadWeightData1();
		loadWeightData2();
	    target = new RobotTarget();
	    target.distance = 100000;

	    setColors(Color.yellow, Color.green, Color.red);
	    setAdjustGunForRobotTurn(true); //Set the gun to turn independent from the robot's turn
	    setAdjustRadarForGunTurn(true); //Set the radar to turn independent from the gun's turn
	    turnRadarRightRadians(2 * PI);
	    
	    while (true)
	    {
	    	robotMovement();
	    	firePower = 400 / target.distance;
	    	if (firePower > 3)
	    	{
	    		firePower = 3;
	    	}
	    	radarMovement();
	        gunMovement();
	        if (getGunHeat() == 0) 
	        {
	        	setFire(firePower);
	        }
	        execute();
	    }
	}  
	
	//************************************************************
	//Movement of the robot, radar, gun...
	//************************************************************
	private void robotMovement()
	{  
		//nnlearner.initialiseWeight(getDataFile("weightIH.txt"), getDataFile("weightHO.txt"));
		int state = getState();
		//System.out.println(state);
		//nnlearner.learn(state, getDataFile("weightIH.txt"), getDataFile("weightHO.txt"));
		nnlearner.loadInputs(state);
		nnlearner.forwardFeed();
		int action = nnlearner.selectAction();
		//System.out.println(action);
		
		nnlearner.learn(state, action, reinforcement);
		nnlearner.backPropagation();
		
		
	    //int action = learner.selectAction(state, explorationRate, total);
	    //out.println("Action selected: " + action);
	    //learner.learn(state, action, reinforcement, policy);
	    
		diffQSum += Math.abs(nnlearner.returnQDiff());
		//System.out.println(diffQSum);
	    diffQTime += 1;
	    nnlearner.saveQValue();
	    
	    newSpecificQDiff = nnlearner.returnSpecificQDiff(state);
	    if (state == 152){
	    	System.out.println(newSpecificQDiff);
	    	diffQValueArray2[total2] = newSpecificQDiff;
	    	total2++;
	    	saveDifferenceQ2();
	    }
	    
	    reinforcement = 0.0;
	    isHitWall = 0;
	    isHitByBullet = 0;

	    switch (action)
	    {
	        case RobotAction.RobotAhead:
	             setAhead(RobotAction.RobotMoveDistance1);
	             break;
	        case RobotAction.RobotBack:
	             setBack(RobotAction.RobotMoveDistance2);
	             break;
	        case RobotAction.TurnLeft:
	             setTurnLeft(RobotAction.RobotTurnDegree);
	             break;
	        case RobotAction.TurnRight:
	             setTurnRight(RobotAction.RobotTurnDegree);
	             break;
	    }
	}

	private void radarMovement()
	{
	    double radarOffset;
	    if (getTime() - target.ctime > 4) 
	    { 
	    	//If we haven't seen anybody for a bit....
	    	//rotate the radar to find a target
	    	radarOffset = 4*PI;
	    } 
	    else 
	    {
	        //Next is the amount we need to rotate the radar by to scan where the target is now
	        radarOffset = getRadarHeadingRadians() 
	        		- (Math.PI/2 - Math.atan2(target.y - getY(),target.x - getX()));
	        
	        //This adds or subtracts small amounts from the bearing for the radar
	        //and make sure we don't lose the target
	        radarOffset = NormaliseBearing(radarOffset);
	        
	        if (radarOffset < 0)
	        	radarOffset -= PI/10;
	        else
	            radarOffset += PI/10;
	    }
	    //Turn the radar
	    setTurnRadarLeftRadians(radarOffset);
	}
	
	private void gunMovement()
	{
	    long time;
	    long nextTime;
	    Point2D.Double p;
	    p = new Point2D.Double(target.x, target.y);
	    for (int i = 0; i < 20; i++)
	    {
	    	nextTime = (int)Math.round((getrange(getX(),getY(),p.x,p.y)/(20-(3*firePower))));
	        time = getTime() + nextTime - 10;
	        p = target.guessPosition(time);
	    }
	    //Offsets the gun by the angle to the next shot based on linear targeting provided by the enemy class
	    double gunOffset = getGunHeadingRadians() - (Math.PI/2 - Math.atan2(p.y - getY(),p.x -  getX()));
	    setTurnGunLeftRadians(NormaliseBearing(gunOffset));
	}
		
	//************************************************************
    //Functions used in movement function of robot, radar, gun
    //************************************************************
	//get the state of robot
	private int getState()
	{
	    int heading = RobotState.getHeading(getHeading());
	    int targetDistance = RobotState.getTargetDistance(target.distance);
	    int targetBearing = RobotState.getTargetBearing(target.bearing);
	    //out.println("State(" + heading + ", " + targetDistance + ", " + targetBearing + ", " + isHitWall + ", " + isHitByBullet + ")");
	    int state = RobotState.Mapping[heading][targetDistance][targetBearing][isHitWall][isHitByBullet];
	    return state;
	}
	
	//bearing is within the -pi to pi range
	double NormaliseBearing(double ang) 
	{
		if (ang > PI)
			ang -= 2*PI;
	    if (ang < -PI)
	        ang += 2*PI;
	    return ang;
	}

	//returns the distance between two x,y coordinates
	public double getrange(double x1, double y1, double x2, double y2)
	{
	    double xo = x2 - x1;
	    double yo = y2 - y1;
	    double h = Math.sqrt(xo * xo + yo * yo);
	    return h;
	}
	
	//************************************************************
    //Events of the robot...
    //************************************************************
	//When the bullet hit another robot...
	public void onBulletHit(BulletHitEvent e)
	{
	    if (target.name == e.getName())
	    {
	        reinforcement += 6;
	    }
	}
    
	//When the bullets hit each other...
	public void onBulletHitBullet(BulletHitBulletEvent e)
	{
		//
	}

	//When the bullet doesn't hit another robot...
	public void onBulletMissed(BulletMissedEvent e)
	{
	    reinforcement += -3;
	}

	//When the robot is hit by bullet...
	public void onHitByBullet(HitByBulletEvent e)
	{
	    reinforcement += -6;
	    isHitByBullet = 1;
	}

	//When the robot hits another robot...
	public void onHitRobot(HitRobotEvent e)
	{
	    reinforcement += -3;
	}

	//When the robot hits the wall...
	public void onHitWall(HitWallEvent e)
	{
	    reinforcement += -2;
	    isHitWall = 1;
	}
	
	//************************************************************
    //onScannedRobot: What to do when you see another robot
    //************************************************************
	public void onScannedRobot(ScannedRobotEvent e)
	{
	    if ((e.getDistance() < target.distance)||(target.name == e.getName()))
	    {
	    	//Gets the absolute bearing to the point where the robot is
	        double absbearing_rad = (getHeadingRadians() + e.getBearingRadians()) % (2 * PI);
	        
	        //Sets all the information about our target
	        target.name = e.getName();
	        double h = NormaliseBearing(e.getHeadingRadians() - target.heading);
	        h = h / (getTime() - target.ctime);
	        target.changeHeading = h;
	        target.x = getX() + Math.sin(absbearing_rad) * e.getDistance(); 
	        target.y = getY() + Math.cos(absbearing_rad) * e.getDistance(); 
	        target.bearing = e.getBearingRadians();
	        target.heading = e.getHeadingRadians();
	        target.ctime = getTime(); //game time at which this scan was produced
	        target.speed = e.getVelocity();
	        target.distance = e.getDistance();
	        target.energy = e.getEnergy();
	    }
	}
	
	//************************************************************
    //When the robot wins or dies (round ends)...
	//************************************************************
	public void onRobotDeath(RobotDeathEvent e)
	{
		if (e.getName() == target.name)
			target.distance = 10000;
	}

	public void onWin(WinEvent event)
	{
	    //saveData();
		saveWeightData1();
		saveWeightData2();
	    reinforcement += 15;
	}

	public void onDeath(DeathEvent event)
	{
	    //saveData();
		saveWeightData1();
		saveWeightData2();
	    reinforcement += -15;
	}

	public void onRoundEnded(RoundEndedEvent event)
	{
		diffQValueArray[total] = diffQSum / diffQTime;
		diffQSum = 0;
		diffQTime = 0;
		total++;
		saveDifferenceQ();
	}

	//************************************************************
	//Save the data of Q difference
	//************************************************************
	public void saveDifferenceQ() {
		try {
			saveDifferenceQFunction(getDataFile("differenceQ.dat"));
		} catch (Exception e) {
			out.println("Exception trying to write: " + e);
		}
	}

	public void saveDifferenceQFunction(File file) {
		PrintStream q = null;
		try {
			q = new PrintStream(new RobocodeFileOutputStream(file));
			for (int i = 0; i < NumTest; i++)
				q.println(new Double(diffQValueArray[i]));

			if (q.checkError())
				System.out.println("Could not save the data!");
			q.close();
		} catch (IOException e) {
			System.out.println("IOException trying to write: " + e);
		} finally {
			try {
				if (q != null)
					q.close();
			} catch (Exception e) {
				System.out.println("Exception trying to close witer: " + e);
			}
		}
	}
	
	public void saveDifferenceQ2() {
		try {
			saveDifferenceQFunction2(getDataFile("differenceQ2.dat"));
		} catch (Exception e) {
			out.println("Exception trying to write: " + e);
		}
	}

	public void saveDifferenceQFunction2(File file) {
		PrintStream q = null;
		try {
			q = new PrintStream(new RobocodeFileOutputStream(file));
			for (int i = 0; i < NumTest; i++)
				q.println(new Double(diffQValueArray2[i]));

			if (q.checkError())
				System.out.println("Could not save the data!");
			q.close();
		} catch (IOException e) {
			System.out.println("IOException trying to write: " + e);
		} finally {
			try {
				if (q != null)
					q.close();
			} catch (Exception e) {
				System.out.println("Exception trying to close witer: " + e);
			}
		}
	}
	
	//************************************************************
	//Load and save the data of the Q table...
	//************************************************************
/*	public void loadData()
	{
		try
	    {
			table.loadData(getDataFile("movement.dat"));
	    }
	    catch (Exception e)
		{
	    }
	}

	public void saveData()
	{
		try
	    {
	    	table.saveData(getDataFile("movement.dat"));
	    }
	    catch (Exception e)
	    {
	        out.println("Exception trying to write: " + e);
	    }
	}
*/

	public void loadWeightData1()
	{
		try
	    {
			nnlearner.loadWeightIH(getDataFile("weightIH.txt"));
	    }
	    catch (Exception e)
		{
	    }
	}
	
	public void loadWeightData2()
	{
		try
	    {
			nnlearner.loadWeightHO(getDataFile("weightHO.txt"));
	    }
	    catch (Exception e)
		{
	    }
	}
	
	public void saveWeightData1()
	{
		try
	    {
	    	nnlearner.saveWeightIH(getDataFile("weightIH.txt"));
	    }
	    catch (Exception e)
	    {
	        out.println("Exception trying to write: " + e);
	    }
	}
	
	public void saveWeightData2()
	{
		try
	    {
			nnlearner.saveWeightHO(getDataFile("weightHO.txt"));
	    }
	    catch (Exception e)
	    {
	        out.println("Exception trying to write: " + e);
	    }
	}

} //End of MartinRobot
