//
//   Cell_Robot-Model Model 
//   Program to study algorithms for self-organization of swarm robots
//   Project3 Model
//   2024.03.07-
//
var canvas;
var ctx;
var iterate ;        // Itelation Number
let count = 0;       // 

// 空間層の設定
var cellSize = 8;    // Display size of one cell square
var meshNum =100;    // Number of vertical and horizontal cells
var ly = 6 ;         // Number of layers (Max)
var moduleMax =5000 ; // Maximum number of modules  

var x,y ;
var cells   = new Array();   // Cell state [i][j][layer]
var cells_x = new Array();   // x graphic coordinates of cell [i][j]
var cells_y = new Array();   // y graphic coordinates of cell [i][j]
var nextCells = new Array(); // State of cell at next time step [i][j][layer].

var cells_tokn = new Array();        // Number of numbers 1-20 that the cell holds [i][j][1-20]
var cells_tokn_next = new Array();   // Number of numbers 1-20 that the cell holds [i][j][1-20] NextStep


// Variables for calculating potential values
var s  ;       // Inner Neighborhood
var s2 ;       // Outer Neighborhood
var w  ;       // morphological parameter
var w2 ;       // morphological parameter

var cells_p = new Array();   // Potential value of cell [i][j] 

// Module Configuration Values and Variables 
var modulenum = 1 ;              //  
var module_macro= new Array();   // Macro variable of module [1D [module number]; 2D [0]: spare, [1]: module type, [2]: active or dormant, [3]: i-coordinate, [4]: j-coordinate
							
// Define light source and object position, set vector variables for light source direction
var light = 1 ;  // Selection of light source availability 0: No 1: Yes ★★★★
var lightSource = {x: 20, y: 50}; //  Setting the coordinates of the light source  ★★★★
var cellobject  = {x: 70, y: 70, width: 1, height: 1}; // Tentative setting of objects that create shadows
var grid = new Array();      // Vector array [i][j] toward the light source

    // Setting force parameters ★★★★
	var potenoff =8 ;  // 8
	var lightforce =10; // 10
	var randomforce =1 ;//3
	// ********************

// Variables for recording calculation results
var goal=0,goalstep=0;
var potentialArea = new Array();   // One dimension [timestep]
var ModuleNum = new Array();       // One dimension [timestep]
var groupnum1 = new Array();       // One dimension [timestep]
var groupnum2 = new Array();       // One dimension [timestep]
var shapedata = new Array();       // One dimension [timestep]

// Display window settings, button settings 
var buttonStart;
var buttonRandom;
var buttonReset;
var timer1;
var running = false;


// Display window settings, button settings 
window.onload = function()
{
    canvas = document.getElementById('Morph-Model');
    ctx = canvas.getContext('2d');
    initCells();
    buttonStart  = document.getElementById('buttonStart');
    buttonRandom = document.getElementById('buttonRandom');
    buttonReset  = document.getElementById('buttonReset');
    buttonStart.addEventListener('click', onStart, false);       // Start button
    buttonRandom.addEventListener('click', randomCells, false);  // Initial button
    buttonReset.addEventListener('click', initCells, false);     // Reset button
    canvas.addEventListener('click', canvasClick, false);
};
 
// Start-Stop button
function onStart(){
    if(running){
        clearInterval(timer1);
        buttonStart.value = "Start";
        running = false;
    } else {
        nextGeneration();
        timer1 = setInterval("nextGeneration()", 10);
        buttonStart.value = "Stop";
        running = true;
    }
}
 
// Processing at program startup and when the reset button is pressed
function initCells(){
	var ni, nj ;
	
	iterate=0;
    
	// Display calculation area  
    ctx.fillStyle = 'rgb( 0, 60, 110)';   // background color
    ctx.fillRect(0,0, canvas.width, canvas.height);  // Draw background

	// Generation of each array variable
    for(i=0;i<=meshNum;i++){
        cells[i]   = new Array();
        cells_x[i] = new Array();
        cells_y[i] = new Array();
        nextCells[i] = new Array();
        cells_p[i] = new Array();
		grid[i] = new Array();
        cells_tokn[i]   = new Array();
        cells_tokn_next[i]   = new Array();
		
        for(j=0;j<=meshNum;j++){
           cells[i][j] = new Array();
           nextCells[i][j] = new Array();
           cells_tokn[i][j]  = new Array();
           cells_tokn_next[i][j]  = new Array();
		}
	}

    for(i=0;i<=moduleMax;i++){
        module_macro[i] = new Array();   
	}

    // Set the state of each cell to 0 and compute the coordinate values of each cell
	for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
		 	cells_x[i][j]=(0+((j-1)%2)*cellSize/2+(i-1)*cellSize);
		 	cells_y[i][j]=(0+ (j-1)*cellSize*Math.sqrt(3)/2);
			
			for(k=0;k<=ly;k++){
            cells[i][j][k] = 0;
            nextCells[i][j][k] = 0;
			}
		}
    }

	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			for(n=1;n<=20;n++){
	           cells_tokn[x][y][n]=0; 
	           cells_tokn_next[x][y][n]=0; 
			}
		}
	}	
    //  Draw initial state
	redraw(0);
	redraw(1);
	redraw(2);
}
 
// Processing when initial button is pressed; setting initial values
function randomCells(){
    modulenum = 1 ;

    // Layer 2 (module layer); module is set as the initial value for a specific cell
	var ly = 2 ;  //  Layer number to be set
	var xxx =80;  //  x-coordinate of the center of the module to be initially placed ★★★★
	var yyy =50;  //  y-coordinate of the center of the module to be initially placed ★★★★
    ///*
    for(x=1;x<=meshNum;x++){
    for(y=1;y<=meshNum;y++){
	    var rr =Math.sqrt((xxx-x)**2 + ((yyy-y)*Math.sqrt(3)/2)**2);		
		if (rr<=5.0) {  //  Radius of modules to be initially installed ★★★★
			module_macro[modulenum][0]=0;  // spare 
            module_macro[modulenum][1]=1;  // Modele kind
            module_macro[modulenum][2]=1;  // Active =1
            module_macro[modulenum][3]=x;  // x-coordinate
            module_macro[modulenum][4]=y;  // y-coordinate

		    cells[x][y][ly] = modulenum ;  // Places module number in cell space
            modulenum ++ ;
		}
	}
	}

    // Placed stoping modules on the first layer 
	var ly = 1 ;  //  Layer number to be set
    for(x=1;x<=meshNum;x++){
    for(y=1;y<=meshNum;y++){
		if (((Math.random()*10)<=0.0)&&(cells[x][y][2]==0)) {  // Set amount of stoping modules; set 0 to 9★★★★★★★★
            //cells[x][y][1] = Math.round( Math.random())*1;  // Random placement
            module_macro[modulenum][0]=0;  // spare 
            module_macro[modulenum][1]=1;  // Modele kind
            module_macro[modulenum][2]=0;  // Active =1
            module_macro[modulenum][3]=x;  // x-coordinate
            module_macro[modulenum][4]=y;  // y-coordinate

		    cells[x][y][ly] = modulenum ;  // Places module number in cell space
            modulenum ++ ;
		}
    }
    }

	//Whether to install an obstacle wall★★★★
    // Obstacle wall set up on 4th layer
    /*
	for(x=39;x<=43;x++){
    for(y=1 ;y<=100;y++){
       // For a single hole in the wall
       if ((y<48)||(y>52)) cells[x][y][4] = 1;
       // For a double hole in the wall
       //if ((y<47)||(y>54)) cells[x][y][4] = 1;
       //if ((y==50)||(y==51)) cells[x][y][4] = 1;
    }
    }
    */
	
    // Draaw Initial state
    
	redraw(0);
    redraw(1);   // Draw stopping module
    redraw(2);   // Draw Modules
    redraw(4);   // Draw Obstacle wall
    
}
 
// Draw entire k-layer
function redraw(k){
	// Draw background
    if (k==1) {
    ctx.fillStyle = 'rgb( 0, 60, 110)';   // background color
    ctx.fillRect(0,0, canvas.width, canvas.height);  
	}
	// Draw the k-layer
	for(x=1;x<=meshNum;x++){
    for(y=1;y<=meshNum;y++){
        if (cells[x][y][k]>0) drawCell(x, y, k);
    }
    }
	// Draw light source
	if ((k==2)&&(light==1)){
    // Display of light source
	ctx.beginPath();
    ctx.fillStyle = 'rgb( 255, 255, 0)';   // Color of light source
    ctx.arc( cells_x[lightSource.x+1][lightSource.y+1]+cellSize/2,cells_y[lightSource.x+1][lightSource.y+1]+cellSize/2 , cellSize/2, 0 , 2*Math.PI);
	ctx.fill();
	}
	
	// Display of iteration number 
	//if (k==2){
    ctx.fillStyle = 'rgba(0, 120, 220)';        // Fill color (translucent) 
    ctx.fillRect(15, meshNum*cellSize*Math.sqrt(3)/2-30, 65, 20);    // Rectangle Drawing 
		
	ctx.font = '20pt Arial';
	ctx.fillStyle = 'rgba(255,255,255)';
	ctx.fillText(iterate, 20, meshNum*cellSize*Math.sqrt(3)/2-10);

	ctx.closePath();
	ctx.stroke();
	//}
}
 
// Draw each cell
function drawCell(xx, yy, k){
	
    var modulenum = cells[xx][yy][k];
	//if (modulenum>0) {value=module_macro[modulenum][1];}
	if (modulenum>0) {value=1;}
    
	ctx.strokeStyle='rgb(65, 65, 125)';
    ctx.lineWidth= 1;
	ctx.fillStyle = 'rgb(   0, 60,110)';

	// Drawing color settings up to level 4, value is the state number of each cell
    if (k==0) {
	value = cells[xx][yy][k];	
    //if (value==0) {ctx.fillStyle = 'rgb(   0, 60,110)';}  // Same color as background
    //if (value==1) {ctx.fillStyle = 'rgb(   0, 80,130)';}  
    //if (value==2) {ctx.fillStyle = 'rgb(   0,100,160)';}  
    //if (value==3) {ctx.fillStyle = 'rgb( 225,  0,225)';}
    if ((cells_p[xx][yy]>0.0)&&(cells_p[xx][yy]<=2000.0))    {ctx.fillStyle = 'rgb(   0,140,200)';}  // Potential layer color setting
    if ((cells_p[xx][yy]>2000.0)&&(cells_p[xx][yy]<=4000.0)) {ctx.fillStyle = 'rgb(   50,200,50)';}  // Potential layer color setting
    if ((cells_p[xx][yy]>4000.0)&&(cells_p[xx][yy]<=100000.0)){ctx.fillStyle = 'rgb( 200,100,0)';}   // Potential layer color setting
	}
    if (k==1) {
    if (value==0) {ctx.fillStyle = 'rgb(   0, 60,110)';}  // Same color as background
    if (value==1) {ctx.fillStyle = 'rgb( 225,225,225)';}  // Stopping modules color
    if (value==2) {ctx.fillStyle = 'rgb( 225,125,225)';}
    if (value==3) {ctx.fillStyle = 'rgb(   0,255,  0)';}
	}
    if (k==2) {
    if (value==0) {ctx.fillStyle = 'rgb(   0, 60,110)';}   // Same color as background
    if (value==1) {ctx.fillStyle = 'rgb( 255,  0,  0)';}   // Modules clor
    if (value==2) {ctx.fillStyle = 'rgb(   0,  0,255)';}
    if (value==3) {ctx.fillStyle = 'rgb( 125,  0,255)';}
    //if (module_step[modulenum][0][1]==0) {ctx.fillStyle = 'rgb( 125,  0,  0)';}   
    //if (module_step[modulenum][0][1]==1) {ctx.fillStyle = 'rgb( 255,  0,  0)';}   
    //if (module_step[modulenum][0][1]==2) {ctx.fillStyle = 'rgb(   0,  0,255)';}
    //if (module_step[modulenum][0][1]==3) {ctx.fillStyle = 'rgb( 125,  0,255)';}
	}
    if (k==3) {
    if (value==0) {/*ctx.fillStyle = 'rgb(   0, 60,110)'*/;}  // Same color as background
    if (value==1) {ctx.fillStyle = 'rgb( 125, 125, 125)';}  // shadows
	}
    if (k==4) {
    if (value==0) {/*ctx.fillStyle = 'rgb(   0, 60,110)'*/;}  // Same color as background
    if (value==1) {ctx.fillStyle = 'rgb(  25,  160, 80)';}  // Wall
	}
    // Draw cell
	ctx.beginPath();
    ctx.arc( cells_x[xx][yy]+cellSize/2,cells_y[xx][yy]+cellSize/2 , cellSize/2, 0 , 2*Math.PI);
	ctx.fill();
	ctx.closePath();
	ctx.stroke();
}


// Potential value calculation: realized only by exchanging values of neighboring cells; function based on Ishida's longitudinal model
function morph2(k,r,state,state2,w,w2,s,s2,t1,t2,t3){ 
    //morph2(k,r              --> Write the result in layer k, where layer r is the initial value.
	//      state,state2,    --> Count only at the state of state,state2 in layer r
	//      w,w2,            --> Form parameter, set so that w2>w	   
	//      s,s2,            --> Counting range s: inner neighborhood s2: outer neighborhood, set so that s2 > s
	//      t1,t2,t3)        --> State number to be transitioned to when the condition is met
    
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			cells[x][y][k]=0;
		    var modulenum = cells[x][y][r];
            var value=module_macro[modulenum][1]
			if (value==state)  cells[x][y][k]=state ;
			if (value==state2) cells[x][y][k]=state2 ;
		}
	}

	// Emission of tokens from each cell, operations between modules
    // Set the number 1 in the module
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			for (n=1 ; n<=20 ;n++) {
				cells_tokn[x][y][n]= 0 ;
				cells_tokn_next[x][y][n]= 0 ;
			} 
		    if (cells[x][y][k] >0)  cells_tokn[x][y][1]= 1 ;
		}
	}
	
	// Processing "diffusion" of numbers
	for (var n=1 ; n<=20 ;n++) { num_diffuse() ;} 
			
	
	
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			var sum1=0; var sum2=0;
		       
			   // Distribution of values held by each cell
			   for (n=1 ; n<=10 ; n++) {
			   sum2=sum2+ cells_tokn[x][y][n] ;
			   }
			   for (n=1 ; n<=20 ; n++) {
			   sum1=sum1+ cells_tokn[x][y][n] ;
			   }

               // Ishida Model Decision Formula		
			   w=0.20;   // 0.15  0.57
			   w2=0.99 ;
			   let a=1;
               if(sum2== (sum1*w))  {nextCells[x][y][k]=cells[x][y][k] ; } 
               if(sum2>  (sum1*w))  {nextCells[x][y][k]=t1 ; } 
               if(sum2>  (sum1*w2)) {nextCells[x][y][k]=t2 ; a=1 ;} 
               if(sum2<  (sum1*w))  {nextCells[x][y][k]=t3 ; } 
			   // Potential value calculation
			   if (a==-1) cells_p[x][y]=0; else cells_p[x][y]= (sum1*w-sum2)*a*-1;
		   
			   
        }
    }
    
	// 各セルの状態の更新
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
           cells[x][y][k] = nextCells[x][y][k];
		}
	}
	
}

function num_diffuse() {
    
	if ((iterate % 4)==0) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =1;  var jend = meshNum ;
	    var id=1;  	var jd=1;
	}
	if ((iterate % 4)==2) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=1;  	var jd=-1;
	}
	if ((iterate % 4)==3) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =1;  var jend = meshNum ;
	    var id=-1;  	var jd=1;
	}
	if ((iterate % 4)==1) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=-1;  	var jd=-1;
	}
	
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			
			i=istart-id + id * x ;
			j=jstart-jd + jd * y ;
			
            if(cells[i][j][k] >= 1) { // If the status is 1 or higher
 	        // 
                let directions; 
		 		if ((j-1)%2==0) {
                    directions = [[-1, 1], [-1, 0],[-1, -1],[0, -1], [1, 0], [0, 1]]; // Six adjacent directions of a hexagonal lattice
		 		}

		 		if ((j-1)%2==1) {
                    directions = [[0, 1], [-1, 0],[0, -1],[1, -1], [1, 0], [1, 1]]; // Six adjacent directions of a hexagonal lattice
				}
                
					let [dx, dy] = directions[Math.floor(Math.random() * directions.length)]; // Randomly select a direction to move	
					//let [dx, dy] = directions[kk] ;
 					let newX = ((i-1) + dx + meshNum) % meshNum +1; // Processing periodic boundary conditions
					let newY = ((j-1) + dy + meshNum) % meshNum +1; // Processing periodic boundary conditions

					if (cells[newX][newY][k] >= 1) {
				
				    for (var n=1 ; n<=19 ; n++) {
					   //cells_tokn[i][j][n+1] = cells_tokn[i][j][n+1] + cells_tokn[newX][newY][n];	
					   cells_tokn_next[i][j][n+1] = cells_tokn_next[i][j][n+1]+cells_tokn[newX][newY][n];	
					   cells_tokn[newX][newY][n]=0;	
					}
					
					}

			}
		}
	}
    
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			for(n=1;n<=20;n++){
	           cells_tokn[x][y][n]=cells_tokn_next[x][y][n]; 
			}
		}
	}
    	
	
}

// Count the number of n cells in radius r from cell x,y
function countAround(k, x, y, r, n=1){  
    let count = 0;
	var rr ;
    for(i=(r*-1-6);i<=r+6;i++){
        for(j=(r*-1-8);j<=r+8;j++){
	        rr =Math.sqrt((0+i)**2 + ((0+j)*Math.sqrt(3)/2)**2);		
			if (rr<=r) {
			var xx = x + i ;
			var yy = y + j ;
             
			if (xx<=0) { xx = meshNum+x+i; }
			else if (xx>=(meshNum+1)) { xx =(x-meshNum)+i;}
			
			if (yy<=0) { yy = meshNum+y+j;}
			else if (yy>=(meshNum+1)) { yy =(y-meshNum)+j;}
		
			if (cells[xx][yy][k]>=n) {count = count + 1 };
			}
        }
    }
    return count;
}

// Counts the total number of cells within a radius r from cell x,y
function countAroundSum(k, x, y, r){  
    let count = 0;
	var rr ;
    for(i=(r*-1-6);i<=r+6;i++){
        for(j=(r*-1-8);j<=r+8;j++){
	        rr =Math.sqrt((0+i)**2 + ((0+j)*Math.sqrt(3)/2)**2);		
			if (rr<=r) {
			var xx = x + i ;
			var yy = y + j ;
             
			if (xx<=0) { xx = meshNum+x+i; }
			else if (xx>=(meshNum+1)) { xx =(x-meshNum)+i;}
			
			if (yy<=0) { yy = meshNum+y+j;}
			else if (yy>=(meshNum+1)) { yy =(y-meshNum)+j;}
			    count = count + 1;
			}
        }
    }
    return count;
}


//Count the number of cells above 1 in layer k
function countPotentialSum(k){ 
    let count = 0;
    for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
			if (cells[i][j][k]>0) { count = count + 1; }
		}
    }
    return count;
}

// Function to count the number of module clusters (groups)
function countGroups() {

	//const visited = cells.map(row => row.map(() => false));
	
    function isValid(x, y) {
        return x >= 1 && y >= 1 && x <= meshNum && y <= meshNum;
    }

    function dfs(x, y) {
        let dx,dy;
        visited[x][y] = true;
        ct++ ;

		// Coordinates of adjacent cells of a regular hexagonal lattice
		if ((y-1)%2==0) {
			dx = [-1, -1, -1,  0, 1, 0];
			dy = [ 1,  0, -1, -1, 0, 1];
		}
		if ((y-1)%2==1) {
			dx = [ 0, -1,  0,  1, 1, 1];
			dy = [ 1,  0, -1, -1, 0, 1];
		}

        for (let i = 0; i < 6; i++) {
            let newX = x + dx[i];
            let newY = y + dy[i];
            // Application of periodic boundary conditions
            if (newX <= 0) newX = meshNum ;
            if (newY <= 0) newY = meshNum ;
            if (newX > meshNum) newX = 1;
            if (newY > meshNum) newY = 1;
            if (isValid(newX, newY) && cells[newX][newY][2] >= 1 && visited[newX][newY]==false) {
                //ct++ ;
				dfs(newX, newY);
            }
        }
    }

    var ct =0;
    var count = new Array(); 
	count[0]=0;  // Number of module groups
	count[1]=0;  // Number of small groups (less than 3 modules)


    var visited = new Array(); 
	for(let i=0;i<=meshNum;i++){
        visited[i]   = new Array();
	}
	
    for (let i = 1; i <= meshNum; i++) {
        for (let j = 1; j <= meshNum; j++) {
			visited[i][j]=false;
		}
	}

    for (let i = 1; i <= meshNum; i++) {
        for (let j = 1; j <= meshNum; j++) {
  
            if (cells[i][j][2] >= 1 && visited[i][j]==false) {
                ct=0;
				dfs(i, j);
                count[0]++;
				if (ct<=3) count[1]++;   // Count the number of regions less than or equal to 3
            }
        }
    }
    return count;
}

//Calculation of shape evaluation parameters
function CalShape(k){  // Calculate the sum of the distances from the center of gravity of the modules in layer k
    let count =0;
	let sumx =0 ; 
	let sumy =0 ; 
	
	// Calculation of center of gravity
    for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
			if (cells[i][j][k]>0) {
				count = count + 1; 
			    sumx = sumx+ cells_x[i][j]/cellSize;
			    sumy = sumy+ cells_y[i][j]/cellSize;
				}
		}
    }
	
	var cgx = sumx /count ;
	var cgy = sumy /count ;
	
	// Calculation of the distance from the center of gravity of each module
	let dis=0 ;
    for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
			if (cells[i][j][k]>0) {
			    dis = dis + Math.sqrt((cells_x[i][j]/cellSize-cgx)**2 + (cells_y[i][j]/cellSize-cgy)**2);
				}
		}
    }
	dis = dis / count ;
	
    return dis;
}

// ******** Main Loop **********
//  Iterative calculations 
// *****************************
function nextGeneration(){

    //redraw(0);   // Display of potential distribution
    redraw(1); // Display of dormant modules
    redraw(4);  // Display of obstacles
    redraw(2);  // Display Modules
    //redraw(3);  // Display Shadows

	// Exporting Images ★★★★
	/*
	if((iterate % 40)==0) {    //<-- Specify the number of image export iterations
	    var canvas = document.getElementById('Morph-Model');
        saveCanvasAsImageFile(canvas);
	}
	*/
	
	iterate = iterate +1 ;
	console.log("iterate=",iterate);

    // Move the light source (move the light source when the number of iterations meets the condition)  ★★★★
    //if ((Math.floor(iterate / 50)%2)==0) {lightSource = {x: 15, y: 15};} else {lightSource = {x: 85, y: 85};}   

    // 第1層の休止モジュールをランダムに動かす
	randMoveCells(1);
	
	// Calculate the direction of the light source in each grid
	calculateLightIntensityAndDirection(grid, lightSource);

    // Calculate shadows of modules and obstacles
	for(i=1;i<=meshNum;i++){
        for(j=1;j<=meshNum;j++){
			if (cells[i][j][2]>=1) { 
			cellobject={x :i , y:j,	width: 1, height: 1} ;
			//console.log(cellobject.x , cellobject.y);
	        castShadow(grid, lightSource, cellobject,2);
			}
			if (cells[i][j][4]==1) { 
			cellobject={x :i , y:j,	width: 1, height: 1} ;
			//console.log(cellobject.x , cellobject.y);
	        castShadow(grid, lightSource, cellobject,4);
		    }
		}
	}
	
	// Judgment of whether the light source has been reached
	if (countAround(2, lightSource.x+1, lightSource.y+1, 1, 1)>0) {
		if (goal==0) goalstep=iterate ;
		goal=1;
	    console.log("Goal=",goal,"GoalStep=",goalstep) ;
		} 
	
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
		  cells[x][y][0]=0;	  // Reset Potential Layer
		  cells[x][y][3]=0;   // Reset shadow layer
		  if (grid[x-1][y-1].intensity==0) cells[x][y][3]=1;	
		}
	}

	// Calculation of layer 0 (potential layer) based on layer 2 (robot module), at the same time storing real values of potential values in cell_p

	//  Parameters for emergence of replication
	//k=0; r=2; state=1; state2=2, w=0.38; w2=0.85; s=20; s2=10; t1=1; t2=0; t3=0; // 石田モデルによる計算

    //  Standard setting when light-oriented★★★★
    k=0; r=2; state=1; state2=2, w=0.48; w2=1.20; s=20; s2=10; t1=1; t2=1; t3=0; // 石田モデルによる計算
    
	morph2(k,r,state,state2,w,w2,s,s2,t1,t2,t3);

    // Dormant module in the first layer is in the potential region and can be revived if there is a live module adjacent to it.
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			if (cells[x][y][2]==0) {
            // ********************************
            // Dormant module in the first layer is in the potential region and can be revived if there is a live module adjacent to it.
            // ********************************
			Revive(2);
			}
		}
	}

    // Cells in the second layer (robot module) are moved within the potential range
	cellMove4(2);

    // Modules in the second layer whose potential value is below 0 are moved to the first layer (stopped)
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			if (cells[x][y][1]==0) {
            // ********************************
            // Stops if a live module in the second layer is outside the potential region
            // ********************************
			range=0.0 ; // 
			//range= Math.floor( Math.random() * 9 )-7  // 0.1 probability of range falling dormant below 1.
			if ((cells_p[x][y]<range) && (cells[x][y][2]>=1)) {
				 cells[x][y][1]=cells[x][y][2]; cells[x][y][2]=0;
				 module_macro[cells[x][y][2]][2]=0;
				}
		    }
		}
	}
	
	// Counting the number of modules
	var moduNum = countPotentialSum(1)+countPotentialSum(2);
	console.log("Module Num=",moduNum );
	
	// Calculation of area of potential region
	potentialArea[iterate] = countPotentialSum(0);
	
	// Calculation of the number of modules in the potential area
	ModuleNum[iterate] = countPotentialSum(2);
    //console.log("moduleNum=",ModuleNum[iterate],countPotentialSum(2));
	
    // Calculation of the number of module groups
	const [a,b] = countGroups();
	groupnum1[iterate] = a;
	groupnum2[iterate] = b;
	
	// Calculation of shape evaluation parameters
	shapedata[iterate]=CalShape(2);
    //console.log("Shape=",shapedata[iterate]);
	
	// Output module data
	//if (iterate==400) data_download(iterate) ;   // Specify the number of iterations to output data★★★★

}

// ********************************
//  If the stop module in the first layer is in the potential area and there is a live module adjacent to it, it will be resurrected
// ********************************
function Revive(k) {
    let newCells = JSON.parse(JSON.stringify(cells)); // Create an array to store the new state
    var dxv , dyv ;
	var vdot, vdotmax , dxmax, dymax, dxvmax, dyvmax ;

    
	if ((iterate % 4)==0) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =1;  var jend = meshNum ;
	    var id=1;  	var jd=1;
	}
	if ((iterate % 4)==2) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=1;  	var jd=-1;
	}
	if ((iterate % 4)==3) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =1;  var jend = meshNum ;
	    var id=-1;  	var jd=1;
	}
	if ((iterate % 4)==1) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=-1;  	var jd=-1;
	}
	
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			
			i=istart-id + id * x ;
			j=jstart-jd + jd * y ;

            if(cells[i][j][1] >= 1) { 

                let directions;  
                let directions1; 
                let directions2; 
		 		if ((j-1)%2==0) {
                    directions = [[0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0],[-1, -1]]; // Six adjacent directions of a hexagonal lattice
		 		}
		 		if ((j-1)%2==1) {
                    directions = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 0],[0, -1]]; // Six adjacent directions of a hexagonal lattice
				}

				directions1 = directions.filter(([dx, dy]) => { // Squeeze in a direction where the adjacent lattice is not in state 1.
                    let newX = ((i-1) + dx + meshNum) % meshNum +1; // periodic boundary condition
                    let newY = ((j-1) + dy + meshNum) % meshNum +1; // periodic boundary condition

                    return ((cells[i][j][0] >= 0) && (cells[newX][newY][2] >= 2)); // There is a module next to it.
                });
				
                if(directions1.length > 0) { // There is a module next to it.
					cells[i][j][k] = cells[i][j][1]; //Move state to new location
					cells[i][j][1] = 0; // Reset previous position status
				}
            }
        }
    }
}

// ********************************
//  Moving Modules
// ********************************
function cellMove4(k) {
	
    let newCells = JSON.parse(JSON.stringify(cells)); // Create an array to store the new state
    var dxv , dyv ;
	var vdot, vdotmax , dxmax, dymax, dxvmax, dyvmax ;
	var flg, kkd ;
	var kcount=0 ;
    var kconf = new Array();

    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
             newCells[x][y][k]  = cells[x][y][k] ; 
		}
	}   
	if ((iterate % 4)==0) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =1;  var jend = meshNum ;
	    var id=1;  	var jd=1;
	}
	if ((iterate % 4)==2) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=1;  	var jd=-1;
	}
	if ((iterate % 4)==3) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =1;  var jend = meshNum ;
	    var id=-1;  	var jd=1;
	}
	if ((iterate % 4)==1) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=-1;  	var jd=-1;
	}
	
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			
			i=istart-id + id * x ;
			j=jstart-jd + jd * y ;

            if(newCells[i][j][k] >= 1) { // If there is a module in layer k (if there is a live module)

                let directions;  
                let directions1; 
                let directions2; 
		 		if ((j-1)%2==0) {
                    directions = [[0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0],[-1, -1]]; 
		 		}
		 		if ((j-1)%2==1) {
                    directions = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 0],[0, -1]]; 
				}
				// Calculate the number kcount and placement of surrounding modules
                kcount=0 ; 
				for (var kk=0; kk<directions.length;kk++){
	                 
					let [dx, dy] = directions[kk] ;
 					let newX = ((i-1) + dx + meshNum) % meshNum +1; // Processing periodic boundary conditions
					let newY = ((j-1) + dy + meshNum) % meshNum +1; // Processing periodic boundary conditions

					if (cells[newX][newY][k] >= 1) {
						kcount= kcount+1 ;
				        kconf[kk] = 1 ;  		
						} else {
						kconf[kk] = 0 ;
						}
				}
				// Identify placements that cannot be moved
				var pattern =0 ;
				var nomove=0;
				if (kcount==2){   // If there are two modules adjacent to each other
					var mv=0;	
                    var pattern =0 ;	
					var kk = Math.floor( Math.random() * 6 );					
					for (var kn=0; kn<directions.length;kn++){
		                kk = kk +kn ;  if (kk<0)  kk =kk+6 ; if (kk>=6)  kk =kk-6 ;

                        kkk  = kk-0 ; if (kkk<0)  kkk =kkk+6 ; if (kkk>=6)   kkk =kkk-6 ;
                        kkk2 = kk-1 ; if (kkk2<0) kkk2=kkk2+6 ;if (kkk2>=6)  kkk2 =kkk2-6 ;
	                    kkk3 = kk-2 ; if (kkk3<0) kkk3=kkk3+6 ;if (kkk3>=6)  kkk3 =kkk3-6 ;
						mv = mv +  kconf[kkk]*kconf[kkk2];
						if ((kconf[kkk]==1)&&(kconf[kkk2]==0)&&(kconf[kkk3]==1)) {pattern=2 ; kkd=kkk2 ;}
						if ((kconf[kkk]==1)&&(kconf[kkk2]==1)) {pattern=1 ;}
					}
					//if  ((pattern==0)&&(mv==0)) nomove=1;
					if  (pattern==0) nomove=1;
				}

				if (kcount==3){   // If there are three modules adjacent to each other
					var mv=0;
                    var pattern =0 ;					
					var kk = Math.floor( Math.random() * 6 );					
					for (var kk=0; kk<directions.length;kk++){
		                kk = kk +kn ;  if (kk<0)  kk =kk+6 ; if (kk>=6)  kk =kk-6 ;

                        kkk  = kk-0 ; if (kkk<0)  kkk =kkk+6 ; if (kkk>=6)  kkk =kkk-6 ;
                        kkk2 = kk-1 ; if (kkk2<0) kkk2=kkk2+6 ;if (kkk2>=6)  kkk2 =kkk2-6 ;
                        kkk3 = kk-2 ; if (kkk3<0) kkk3=kkk3+6 ;if (kkk3>=6)  kkk3 =kkk3-6 ;
                        kkk4 = kk-3 ; if (kkk4<0) kkk4=kkk4+6 ;if (kkk4>=6)  kkk4 =kkk4-6 ;
						mv = mv +  kconf[kkk]*kconf[kkk2]*kconf[kkk3];
						//if ((kconf[kkk]==0)&&(kconf[kkk2]==1)&&(kconf[kkk3]==1)) { pattern=2 ; kkd=kkk ;}
						if ((kconf[kkk]==1)&&(kconf[kkk2]==1)&&(kconf[kkk3]==0)&&(kconf[kkk4]==1)) { pattern=2 ; kkd=kkk3 ;}
						if ((kconf[kkk]==1)&&(kconf[kkk2]==0)&&(kconf[kkk3]==1)&&(kconf[kkk4]==1)) { pattern=2 ; kkd=kkk2 ;}
						if ((kconf[kkk]==1)&&(kconf[kkk2]==1)&&(kconf[kkk3]==1)) { pattern=1 ; }
					}
					///if ((pattern==0)&&(mv==0)) nomove=1;
					if  (pattern==0) nomove=1;
				}

                // Find the adjacent module and see if the one next to it is available.
				flg =0 ; 
				
				if (pattern==2) { 
					let [dx, dy] = directions[kkd] ;
 					let newX = ((i-1) + dx + meshNum) % meshNum +1; 
					let newY = ((j-1) + dy + meshNum) % meshNum +1; 
 			        if ((cells[newX][newY][k] == 0)&&(cells[newX][newY][4] == 0)) {flg=1;}
				}					
				else {
				kkd =0 ; dxmax=0 ; dymax=0;
				var kk = Math.floor( Math.random() * 6 );	
				for (var kn=0; kn<directions.length;kn++){
			        kk = kk +kn ;  if (kk<0)  kk =kk+6 ; if (kk>=6)  kk =kk-6 ;
					
					let [dx, dy] = directions[kk] ;
 					let newX = ((i-1) + dx + meshNum) % meshNum +1; 
					let newY = ((j-1) + dy + meshNum) % meshNum +1; 

					if (cells[newX][newY][k] >= 1) {
						if ((j-1)%2==0) {
						if (Math.floor( Math.random() * 2)==0) {
 				        var kkf = kk-1; if (kkf<0)  kkf=kkf+6 ; 
					    let [dx, dy] = directions[kkf] ;
  					    let newX2 = ((i-1) + dx + meshNum) % meshNum +1; 
					    let newY2 = ((j-1) + dy + meshNum) % meshNum +1; 
					    if ((cells[newX2][newY2][k] == 0)&&(cells[newX2][newY2][4] == 0)) {kkd = kkf ; dxmax=dx; dymax=dy; flg=1 ;} 
						} else {
						var kkb = kk+1; if (kkb>=6) kkb=kkb-6 ; 
						let [dx, dy] = directions[kkb] ;
						let newX2 = ((i-1) + dx + meshNum) % meshNum +1; 
						let newY2 = ((j-1) + dy + meshNum) % meshNum +1; 
						if ((cells[newX2][newY2][k] == 0)&&(cells[newX2][newY2][4] == 0)) {kkd = kkb ; dxmax=dx; dymax=dy; flg=1 ;} 
						} 
					    }

						if ((j-1)%2==1) {
						if (Math.floor( Math.random() * 2)==0) {
						var kkb = kk+1; if (kkb>=6) kkb=kkb-6 ; 
						let [dx, dy] = directions[kkb] ;
						let newX2 = ((i-1) + dx + meshNum) % meshNum +1; 
						let newY2 = ((j-1) + dy + meshNum) % meshNum +1; 
						if ((cells[newX2][newY2][k] == 0)&&(cells[newX2][newY2][4] == 0)) {kkd = kkb ; dxmax=dx; dymax=dy; flg=1 ;} 
						} else {
 				        var kkf = kk-1; if (kkf<0)  kkf=kkf+6 ; 
					    let [dx, dy] = directions[kkf] ;
  					    let newX2 = ((i-1) + dx + meshNum) % meshNum +1; 
					    let newY2 = ((j-1) + dy + meshNum) % meshNum +1; 
					    if ((cells[newX2][newY2][k] == 0)&&(cells[newX2][newY2][4] == 0)) {kkd = kkf ; dxmax=dx; dymax=dy; flg=1 ;} 
					    } 
					    }
						
					}
				}
				}
				
                if (nomove==1) flg=0 ;
                // Obtain the direction of movement into the free space
				if (flg==1) {  // There is a direction to the vacant area; kkd is the way to move
				// Calculation of forces along the direction of possible movement
				    var force =0 ;
					
					// Attractive force from adjacent modules
 				    kkf = kkd-1; if (kkf<0)  kkf=kkf+6 ; 
				    let [dx, dy] = directions[kkf] ;
				    let newX = ((i-1) + dx + meshNum) % meshNum +1; 
					let newY = ((j-1) + dy + meshNum) % meshNum +1; 
					var potenrate = (cells_p[newX][newY] - cells_p[i][j])/cells_p[i][j] ;
					potenrate = potenrate* potenoff ;
					if (cells[newX][newY][k] >= 1) { force = force +1*1.732/2.0 *(1+potenrate) ;} 
					
 				    kkf = kkd-2; if (kkf<0)  kkf=kkf+6 ; 
				    [dx, dy] = directions[kkf] ;
				    newX = ((i-1) + dx + meshNum) % meshNum +1; 
					newY = ((j-1) + dy + meshNum) % meshNum +1; 
					var potenrate = (cells_p[newX][newY] - cells_p[i][j])/cells_p[i][j] ;
					potenrate = potenrate* potenoff ;
					if (cells[newX][newY][k] >= 1) { force = force -1*1.732/2.0 *(1+potenrate);} 

 				    kkf = kkd-3; if (kkf<0)  kkf=kkf+6 ; 
				    [dx, dy] = directions[kkf] ;
				    newX = ((i-1) + dx + meshNum) % meshNum +1; 
					newY = ((j-1) + dy + meshNum) % meshNum +1; 
					var potenrate = (cells_p[newX][newY] - cells_p[i][j])/cells_p[i][j] ;
					potenrate = potenrate* potenoff ;
					if (cells[newX][newY][k] >= 1) { force = force -1*1 *(1+potenrate);} 

				
					kkb = kkd+1; if (kkb>=6) kkb=kkb-6 ; 
					[dx, dy] = directions[kkb] ;
					newX = ((i-1) + dx + meshNum) % meshNum +1; 
					newY = ((j-1) + dy + meshNum) % meshNum +1; 
					var potenrate = (cells_p[newX][newY] - cells_p[i][j])/cells_p[i][j] ;
					potenrate = potenrate* potenoff ;
					if (cells[newX][newY][k] >= 1) { force = force +1*1.732/2.0 *(1+potenrate);} 

					kkb = kkd+2; if (kkb>=6) kkb=kkb-6 ; 
					[dx, dy] = directions[kkb] ;
					newX = ((i-1) + dx + meshNum) % meshNum +1; 
					newY = ((j-1) + dy + meshNum) % meshNum +1; 
					var potenrate = (cells_p[newX][newY] - cells_p[i][j])/cells_p[i][j] ;
					potenrate = potenrate* potenoff ;
					if (cells[newX][newY][k] >= 1) { force = force -1*1.732/2.0 *(1+potenrate);} 
					
					// Force toward the source of light
					vdotmax = -999999.9; 
					var kd =0;
	 				for (var kk=0; kk<directions.length;kk++){
			  
					    let [dx, dy] = directions[kk]; // Direction of movement

					   //  Calculate the direction vector of dx,dy
                        dxv=0 ; dyv=0;
					    if ((j-1)%2==0) {
					        if (dy==0) {dxv=dx ; dyv=0; }
					        if (dx==0) {dxv=0.5;     } else if (dx==-1) {dxv=-0.5; }
					        if (dy==-1) {dyv=-0.866; } else if (dy==1)  {dyv=0.866; }
						}
					    if ((j-1)%2==1) {
					        if (dy==0) {dxv=dx ; dyv=0; }
					        if (dx==1) {dxv=0.5;     } else if (dx==0) {dxv=-0.5; }
					        if (dy==-1) {dyv=-0.866; } else if (dy==1)  {dyv=0.866; }
						}
					    //  Find the inner product of the direction vector and the light source direction vector
					    vdot = grid[i-1][j-1].direction.x * dxv + grid[i-1][j-1].direction.y * dyv ;
					    //  Find the direction in which the inner product is maximized
					    if ((vdot>0.0)&&(vdot>vdotmax)) {kd=kk; vdotmax=vdot;  dxmax=dx, dymax=dy ; dxvmax=dxv, dyvmax=dyv ;}
					}
 				    if (vdotmax>0) { 
						/*
						if (kkd ==kd) {force = force + vdotmax*10;} 
						if ((kkd+1)>5) kkd=0; if (kkd==kd) {force = force + 5;} 
						if ((kkd-1)<0) kkd=5; if (kkd==kd) {force = force + 5;} 
						*/
						if ((Math.abs(kkd - kd)<=1)||(Math.abs(kkd - kd)>=5)) {force = force + vdotmax*lightforce;} else {force = force - vdotmax*1/lightforce;}
					} 
					// Total force + Disturbance force
                    force = force + (Math.floor(Math.random() * 3)-1)*randomforce ;
				
				
                // If the force is greater toward an empty module, it will move.
				if(force > 0) { 
				    let [dx, dy] = directions[kkd] ;
					let newX = ((i-1) + dx + meshNum) % meshNum +1; 
					let newY = ((j-1) + dy + meshNum) % meshNum +1; 
                        if (newCells[newX][newY][k]==0) {
						newCells[newX][newY][k] = cells[i][j][k]; // Move state to new location
						newCells[i][j][k] = 0; // Reset previos position status
						cells[newX][newY][k] = cells[i][j][k];
						
						cells[i][j][k] = 0; // Reset previos position status
						}
					} else { // If there is no direction of movement available
					
					    newCells[i][j][k] = cells[i][j][k]; // stay in the original position
					} 
			 
            } else { // If there is no direction of movement available
					
					    newCells[i][j][k] = cells[i][j][k]; // stay in the original position
					}
			}					
        }
    }
	
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
            cells[x][y][k] = newCells[x][y][k] ; // Update new state to current state
		}
	}
	
}

// Randomly move k-layer modules
function randMoveCells(k) {
    let newCells = JSON.parse(JSON.stringify(cells)); // Create an array to store the new state
    
	if ((iterate % 4)==0) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =1;  var jend = meshNum ;
	    var id=1;  	var jd=1;
	}
	if ((iterate % 4)==2) {
	    var istart =1;  var iend = meshNum ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=1;  	var jd=-1;
	}
	if ((iterate % 4)==3) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =1;  var jend = meshNum ;
	    var id=-1;  	var jd=1;
	}
	if ((iterate % 4)==1) {
	    var istart =meshNum;  var iend = 1 ;
	    var jstart =meshNum;  var jend = 1 ;
	    var id=-1;  	var jd=-1;
	}
	
	for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
			
			i=istart-id + id * x ;
			j=jstart-jd + jd * y ;
			
            if(cells[i][j][k] >= 1) { // If the status is 1 or higher

                let directions; 
		 		if ((j-1)%2==0) {
                    directions = [[-1, 1], [-1, 0],[-1, -1],[0, -1], [1, 0], [0, 1]]; // Six adjacent directions of a hexagonal lattice
		 		}

		 		if ((j-1)%2==1) {
                    directions = [[0, 1], [-1, 0],[0, -1],[1, -1], [1, 0], [1, 1]]; // Six adjacent directions of a hexagonal lattice
				}
                
				directions = directions.filter(([dx, dy]) => { // Squeeze in a direction where the adjacent lattice is not in state 1.
                    let newX = ((i-1) + dx + meshNum) % meshNum +1; // Processing periodic boundary conditions
                    let newY = ((j-1) + dy + meshNum) % meshNum +1; // Processing periodic boundary conditions
                    return (cells[newX][newY][k] === 0 && newCells[newX][newY][k] == 0)&&((cells[newX][newY][2]==0)&&(cells[newX][newY][4]==0));
                });
                if(directions.length > 0) { // 移動可能な方向がある場合
                    let [dx, dy] = directions[Math.floor(Math.random() * directions.length)]; // Randomly select a direction to move
                    let newX = ((i-1) + dx + meshNum) % meshNum +1; // Processing periodic boundary conditions
                    let newY = ((j-1) + dy + meshNum) % meshNum +1; // Processing periodic boundary conditions
                    newCells[newX][newY][k] = cells[i][j][k]; // Move module to new location
                    newCells[i][j][k] = 0; // Reset module in previous position
                    cells[i][j][k] = 0; // Reset module in previous position
					module_macro[cells[i][j][k]][3]=newX;
					module_macro[cells[i][j][k]][4]=newY;
                } 
				else { // If there is no direction of movement available
                    newCells[i][j][k] = cells[i][j][k]; // Retain original position state
				}
            }
        }
    }
    for(x=1;x<=meshNum;x++){
        for(y=1;y<=meshNum;y++){
            cells[x][y][k] = newCells[x][y][k] ; // Update new state to current state
		}
	}
}


// Function to calculate the intensity and direction of light
function calculateLightIntensityAndDirection(grid, lightSource) {
    for (let i = 0; i < meshNum; i++) {
        for (let j = 0; j < meshNum; j++) {
			if (light==1) {
            let dx = i - lightSource.x;
            let dy = j - lightSource.y;
            let distance = Math.sqrt(dx*dx + dy*dy);

            // Light intensity is inversely proportional to distance
            let intensity = 1 / distance *100;

            // Calculate the vector indicating the direction of light
            let direction = {x: dx*(-1) / distance, y: dy*(-1) / distance};

            // Light intensity and direction are stored in the lattice
            grid[i][j] = {intensity: intensity, direction: direction};
			
			} else {
			let direction = {x: 0, y: 0}
            grid[i][j] = {intensity: 0, direction: direction};
			
			}
		
		}
    }
}

// Function to scan each cell in a straight line from the light source to the object
function castShadow(grid, lightSource, object, objectkind) {
    let dx = object.x - lightSource.x;
    let dy = object.y - lightSource.y;

    let stepX = dx / Math.abs(dx);
    let stepY = dy / Math.abs(dx);
    let x = lightSource.x;
    let y = lightSource.y;

    //while (Math.floor(x) != object.x || Math.floor(y) != object.y) {
    var flg =0 ;
	while ((Math.floor(x) < meshNum-1) && (Math.floor(x) >=0) && (Math.floor(y) < meshNum-1) && (Math.floor(y) >=0)) {
        x += stepX;
        y += stepY;
        if (Math.floor(x) == object.x && Math.floor(y) == object.y) {flg=1; }
	
        if ((flg==1)&&(x<(meshNum-1))&&(y<(meshNum-1))&&(x>=0)&&(y>=0)) {
		//var intent =grid[Math.floor(x)][Math.floor(y)].intensity *0.01 ;
		//console.log(Math.floor(x),Math.floor(y),grid[Math.floor(x)][Math.floor(y)].intensity);
	    if (objectkind==4) {
		grid[Math.floor(x)][Math.floor(y)] = {intensity: 0, direction: {x: 0, y: 0}};
		}
		// Modules that are not illuminated by a light source reduce the light intensity to 1/10
	    if (objectkind==2) {
		grid[Math.floor(x)][Math.floor(y)].intensity = grid[Math.floor(x)][Math.floor(y)].intensity *0.0;
		}
		}

    }
}

// Canvas click
function canvasClick(e){
    var xx = e.clientX - canvas.offsetLeft;
    var yy = e.clientY - canvas.offsetTop;
    var col = Math.floor(xx / cellSize)+1 ;
    var row = Math.floor(yy / (cellSize*(Math.sqrt(3)/2)))+1 ;
    if (cells[col][row][0]==0)  cells[col][row][0]=1; else cells[col][row][0]=0;
	drawCell(col, row,0);
}

// Download image files
function saveCanvasAsImageFile(canvas) {
    // Convert Canvas content to data URL (PNG image data in Base64 format)
    var dataUrl = canvas.toDataURL('image/png');

    // Create link elements for download
    var link = document.createElement('a');
    link.download = 'canvas'+iterate+'.png';  //  <-- Specify the file name of the image to be saved here
    link.href = dataUrl;

    // Start downloading
    link.click();

}

// CSV output of module data
function data_download(data_len) {

    var str = "";      // Create empty string

    str += "Goal="+","+goal+","+"GoalStep="+","+goalstep+"\n" ;
    str += "potenoff="+","+potenoff+","+"lightforce="+","+lightforce+","+"randomforce="+","+randomforce+"\n" ;

    for(var i = 1; i<=data_len; i++){
        str += i+","+potentialArea[i]+","+ModuleNum[i]+","+groupnum1[i]+","+groupnum2[i]+","+shapedata[i]+"\n"; // Generate output data 出力データを作成
    }
	
    
	var blob =new Blob([str],{type:"text/csv"}); //Set the above string(str) in the array
    var link =document.createElement('a');
    link.href = URL.createObjectURL(blob); 
    link.download ="tempdate.csv";
    link.click();
	
}



