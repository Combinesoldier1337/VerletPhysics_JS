const canvas = document.getElementById("myCanvas");
const screenCenter = [canvas.width/2,canvas.height/2];
canvas.addEventListener("e", handleClick);
var ctx = canvas.getContext("2d");
const bgColorInput = document.getElementById('bgColorInput');
const voidColorInput = document.getElementById('voidColorInput');
const dotColorInput = document.getElementById('dotColorInput');
const enumGravity = document.getElementById('enumGravity');
const enumBorder = document.getElementById('enumBorder');
const updateButton = document.getElementById('updateButton');
const fpsInput = document.getElementById('fpsInput');
const borderRadiusInput = document.getElementById('borderRadiusInput');
const physxIterationsInput = document.getElementById('physxIterationsInput');
const airDragInput = document.getElementById('airDragInput');
const customGravityInputX = document.getElementById('customGravityInputX');
const customGravityInputY = document.getElementById('customGravityInputY');
const gravityRadiusInput = document.getElementById('gravityRadiusInput');
const gravitySpeedInput = document.getElementById('gravitySpeedInput');
const RadiusMinInput = document.getElementById('RadiusMinInput');
const RadiusMaxInput = document.getElementById('RadiusMaxInput');
updateButton.addEventListener('click', () => {
        UpdateSettings();
      })

const gravity = [0,1];
var gravityPos = [canvas.width/2,canvas.height/2];
var gravityState = 0;

const gravity_type = [
    "Default",
    "Center",
    "Follow dot",
    "Custom vector",
	"Custom point"
]

const border_type = [
    "Circle",
    "Box",
    "Floor",
    "None",
]

onStart();

function onStart(){
	bgColorInput.value = "#000000";
	voidColorInput.value = "#262626";
	dotColorInput.value = "#FF3030";
	
	fpsInput.value = 75;
	borderRadiusInput.value = 250;
	physxIterationsInput.value = 10;
	airDragInput.value = 0.01;
	customGravityInputX.value = 0;
	customGravityInputY.value = -1;
	gravityRadiusInput.value = 30;
	gravitySpeedInput.value = 1;
	RadiusMinInput.value = 5;
	RadiusMaxInput.value = 15;
	
	appendEnum(enumGravity, gravity_type);
	appendEnum(enumBorder, border_type);
	
	enumGravity.value = 0;
	enumBorder.value = 0;
}

var PhysicsObjects = [
	new VerletObject(screenCenter, Vector2Add(screenCenter,[5,2]),[0,0]),  
]; 

function VerletObject(current, old, accel) 
{
	this.pos_current = current;
	this.pos_old = old;
	this.acceleration = accel;
	this.radius = getRandomInt(RadiusMinInput.value,RadiusMaxInput.value);
	this.mass = this.radius;
	this.color = getRandomColor();
	this.accelerate = function(acc)
	{
		this.acceleration = Vector2Add(this.acceleration,acc);
	}
	this.updatePosition = function(dt)
	{
		let velocity = Vector2Multiply(Vector2Subtract(this.pos_current,this.pos_old),1-airDragInput.value);
		this.pos_old = this.pos_current;
		this.pos_current = Vector2Add(Vector2Add(this.pos_current,velocity),Vector2Multiply(this.acceleration,dt * dt));
		this.acceleration = [0,0];
	}
}

function applyGravity(index)
{
	switch(enumGravity.value*1)
	{
		case 0: //gravity down
			PhysicsObjects[index].accelerate(gravity);
			break;		
		case 1: //gravity center
			PhysicsObjects[index].accelerate(Vector2Multiply(Vector2Subtract(screenCenter,PhysicsObjects[index].pos_current),1));
			break;
		case 2: // follow dot
			PhysicsObjects[index].accelerate(Vector2Multiply(Vector2Subtract(gravityPos,PhysicsObjects[index].pos_current),0.06));
			break;		
		case 3:
			// custom vector
			PhysicsObjects[index].accelerate([customGravityInputX.value*1, customGravityInputY.value*1]);
			break;	
		case 4:
			// custom point
			PhysicsObjects[index].accelerate(Vector2Multiply(Vector2Subtract([customGravityInputX.value*1, customGravityInputY.value*1],PhysicsObjects[index].pos_current),1));
			break;
	}
}

function applyConstrain(index)
{
	switch(enumBorder.value*1)
	{
		case 0: 
			circleConstrain(index);
			break;		
		case 1: 
			boxConstrain(index);
			break;
		case 2: 
			floorConstrain(index);		
			break;		
		case 3: 
			// none			
			break;
	}
}

function circleConstrain(index)
{
	let to_obj = Vector2Subtract(PhysicsObjects[index].pos_current, screenCenter);
	let dist = Vector2Lenght(to_obj);
	if (dist + PhysicsObjects[index].radius > borderRadiusInput.value)
	{
		let n = Vector2Divide(to_obj, dist);
		PhysicsObjects[index].pos_current = Vector2Add(screenCenter, Vector2Multiply(n, borderRadiusInput.value -PhysicsObjects[index].radius));
	}
}

function boxConstrain(index)
{
	let boolX = Math.abs(PhysicsObjects[index].pos_current[0] - screenCenter[0]) > borderRadiusInput.value -PhysicsObjects[index].radius;
	let boolY = Math.abs(PhysicsObjects[index].pos_current[1] - screenCenter[1]) > borderRadiusInput.value -PhysicsObjects[index].radius;
	if (boolX)
	{
		PhysicsObjects[index].pos_current[0] = screenCenter[0] + Math.sign(PhysicsObjects[index].pos_current[0] - screenCenter[0]) * (borderRadiusInput.value -PhysicsObjects[index].radius);
	}
	if (boolY)
	{
		PhysicsObjects[index].pos_current[1] = screenCenter[1] + Math.sign(PhysicsObjects[index].pos_current[1] - screenCenter[1]) * (borderRadiusInput.value -PhysicsObjects[index].radius);
	}
}

function floorConstrain(index)
{
	if (Math.abs(PhysicsObjects[index].pos_current[0]-screenCenter[0]) > screenCenter[0])//+PhysicsObjects[index].radius)
	{
		var diff = PhysicsObjects[index].pos_current[0] - PhysicsObjects[index].pos_old[0];
		PhysicsObjects[index].pos_current[0] = PhysicsObjects[index].pos_current[0] < 0? canvas.width : 0;
		PhysicsObjects[index].pos_old[0] = PhysicsObjects[index].pos_current[0] - diff;
	}
	if (PhysicsObjects[index].pos_current[1] - screenCenter[1] > borderRadiusInput.value -PhysicsObjects[index].radius)
	{
		PhysicsObjects[index].pos_current[1] = screenCenter[1] + (borderRadiusInput.value -PhysicsObjects[index].radius);
	}
}

function animate() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  ctx.fillStyle = bgColorInput.value;
	  ctx.fillRect(0, 0, canvas.width, canvas.height);
	  drawConstrain();
	  RotateGravityPoint();
	  for (var i = 0; i < PhysicsObjects.length; i++) {
		for (var x = 0; x < physxIterationsInput.value; x++)
		{
			applyGravity(i);
			applyConstrain(i);
			//collisions:
			for (var j = 0; j < PhysicsObjects.length; j++)
			{			
				var col_axis = Vector2Subtract(
					PhysicsObjects[i].pos_current,
					PhysicsObjects[j].pos_current);
				var dist = Vector2Lenght(col_axis); 
				if (dist <= PhysicsObjects[i].radius + PhysicsObjects[j].radius)
				{
					var delta = PhysicsObjects[j].radius+PhysicsObjects[i].radius - dist;
					var result = Vector2Multiply(Vector2Divide(col_axis, dist), delta / 2);
					PhysicsObjects[i].pos_current = Vector2Add(PhysicsObjects[i].pos_current,Vector2Multiply(result,(PhysicsObjects[j].mass/PhysicsObjects[i].mass)));
					PhysicsObjects[j].pos_current = Vector2Subtract(PhysicsObjects[j].pos_current,Vector2Multiply(result,(PhysicsObjects[i].mass/PhysicsObjects[j].mass)));
				}
				//PhysicsObjects[j].accelerate(Vector2Multiply(Vector2Divide(col_axis, dist),(PhysicsObjects[i].mass/PhysicsObjects[j].mass)));///Math.max(1, dist)));
			}
		}
		PhysicsObjects[i].updatePosition(1/physxIterationsInput.value);
		
		ctx.fillStyle = PhysicsObjects[i].color;
		ctx.beginPath();
		ctx.arc(PhysicsObjects[i].pos_current[0], PhysicsObjects[i].pos_current[1], PhysicsObjects[i].radius, 0, Math.PI * 2);
		ctx.fill();
	  }
	  
	  DrawGravityPoint();
	setTimeout(() => {
		requestAnimationFrame(animate);
	}	, 1000 / fpsInput.value*1);
	}
	animate();
	
	function UpdateSettings()
	{

	}
	
	function handleClick(e)
	{
		if (e.ctrlKey)
		{
			PhysicsObjects.pop();
		}
		else
		{
			PhysicsObjects.push(
				new VerletObject(
					[e.pageX-10, e.pageY-10],
					[e.pageX-10, e.pageY-10],
					//[e.clientX-10-pad_L,e.clientY-10],
					//[e.clientX-10-pad_L,e.clientY-10],
					//[0, 0]
					[0, 0]
				)
			);
		}
	}
	function drawConstrain()
	{
		ctx.fillStyle = voidColorInput.value;
		ctx.beginPath();
		
		switch(enumBorder.value*1)
		{
			case 0: 
				ctx.arc(screenCenter[0], screenCenter[1], borderRadiusInput.value, 0, Math.PI*2);
				break;		
			case 1: 
				ctx.rect(screenCenter[0] - borderRadiusInput.value, screenCenter[1] - borderRadiusInput.value, borderRadiusInput.value * 2, borderRadiusInput.value *2);
				break;
			case 2: 
				ctx.rect(0, 0, canvas.width, canvas.height - (screenCenter[1] - borderRadiusInput.value));		
				break;		
			case 3: 
				// none			
				break;
		}
		ctx.fill();
	}
	function DrawGravityPoint()
	{
		ctx.fillStyle = dotColorInput.value;
		ctx.beginPath();
		ctx.arc(gravityPos[0], gravityPos[1], 3, 0, Math.PI*2);
		ctx.fill();
	}
	function RotateGravityPoint()
	{
		gravityState = gravityState > Math.PI*2? 0 : gravityState += 0.1 * gravitySpeedInput.value;
		gravityPos[0] = screenCenter[0] + Math.sin(gravityState)*gravityRadiusInput.value*1;
		gravityPos[1] = screenCenter[1] - Math.cos(gravityState)*gravityRadiusInput.value*1;
	}
	function Vector2Add(vec1,vec2)
	{
		return [vec1[0]+vec2[0],vec1[1]+vec2[1]];
	}
	function Vector2Subtract(vec1,vec2)
	{
		return [vec1[0]-vec2[0],vec1[1]-vec2[1]];
	}
	function Vector2Multiply(vec1,vec2)
	{
		return [vec1[0]*vec2[0],vec1[1]*vec2[1]];
	}
	function Vector2Multiply(vec,number)
	{
		return [vec[0]*number,vec[1]*number];
	}
	function Vector2Divide(vec,number)
	{
		return [vec[0]/Clamp(number,1,number+1),vec[1]/Clamp(number,1,number+1)];
	}
	function Vector2Lenght(vec)
	{
		return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
	}
	function Vector2Normalize(vec)
	{
		if (Math.abs(vec[0]) > Math.abs(vec[1]))
		{
			return [1, vec[1]/vec[0]];
		}
		else
		{
			return [vec[0]/vec[1], 1];
		}
	}
	function Clamp(number,min,max)
	{
		return Math.min(Math.max(number,min),max);
	}
	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) 
		{
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
	function getRandomInt(max) 
	{
		return Math.floor(Math.random() * max);
	}
	function getRandomInt(min, max) 
	{
		return Math.floor(Clamp(Math.random() * max, min, max));
	}
	
	function appendEnum(dropdown, enumerable)
	{
		for (var i = 0; i < enumerable.length; i++)
		{
			var option = document.createElement('option');
			option.value = i;
			option.innerHTML = enumerable[i];
			dropdown.appendChild(option);
		}
	}