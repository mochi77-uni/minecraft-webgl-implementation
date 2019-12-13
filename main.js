var gl;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var paused = 0;
var depthTest = 1;

// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var moonRotationMatrix = mat4();

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }

    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = newX - lastMouseX;
    var newRotationMatrix = rotate(deltaX/10, 0, 1, 0);

    var deltaY = newY - lastMouseY;
    newRotationMatrix = mult(rotate(deltaY/10, 1, 0, 0), newRotationMatrix);

    moonRotationMatrix = mult(newRotationMatrix, moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}

// event handlers for button clicks
function rotateX() {
	paused = 0;
    axis = xAxis;
};
function rotateY() {
	paused = 0;
	axis = yAxis;
};
function rotateZ() {
	paused = 0;
	axis = zAxis;
};

// --------------------------------
// Define the grid as an object.
// --------------------------------
function grid()
{
	var N = 20;
	var step = 2.0/N;
	var x, z;
	var i, j;

    var coords = [];
    var normals = [];
    var colors = [];
	var texCoords = [];
    var indices = [];
    var wave;
	
	function meshPoint(x, y, z) {
		coords.push(vec3(x, y, z));
		normals.push(vec3(0.0, 1.0, 0.0));
        wave = 0.5+0.5*Math.cos((x+z)*Math.PI*5.0);
		colors.push(vec3(wave, wave, 0.0));
	}
	
    function addIndices(x, z) {
		indices.push(x+z*(N+1));
	}

		
	// Set up the vertices and attributes;
	// (N+1) * (N+1) vertices are produced.
	for (j=0,z=-1.0; j<=N; j++, z+=step) {
		for (i=0, x=-1.0; i<=N; i++, x+=step) {
			meshPoint(x, 0.0, z);
		}			
	}
	
	// Set up the indices;
	// N*N*2 triangles are produced.
	for (j=0; j<N; j++) {
		for (i=0; i<N; i++) {
			addIndices(i, j);
			addIndices(i+1, j);
			addIndices(i, j+1);
			addIndices(i, j+1);
			addIndices(i+1, j);
			addIndices(i+1, j+1);			
		}			
	}

   return {
      vertexPositions: new Float32Array(flatten(coords)),
      vertexNormals: new Float32Array(flatten(normals)),
      vertexColors: new Float32Array(flatten(colors)),
      vertexTextureCoords: new Float32Array(flatten(texCoords)),
      indices: new Uint16Array(indices)
   }

}

function setColor(obj, R, G, B)
{
    for (i=0; i < obj.vertexColors.length; i+=3) {
        obj.vertexColors[i]   = R;
        obj.vertexColors[i+1] = G;
        obj.vertexColors[i+2] = B;
    }
}

function unitize(obj)
{
    var vertices = obj.vertexPositions;
	var maxCorner = vertices[0];
	var minCorner = vertices[0];
	var center = vertices[0];
 
	for (i = 1; i < vertices.length; i++) { 
		maxCorner = Math.max(vertices[i], maxCorner);
		minCorner = Math.min(vertices[i], minCorner);
	}
	for (j=0; j<3; j++) {
		center = (maxCorner+minCorner)/2.0;
	}
		
	for (i = 0; i < vertices.length; i++) { 
		vertices[i] = (vertices[i] - center) * 2.0 / (maxCorner - minCorner);
	}		
}

// ModelView and Projection matrices
var vPosition, vNormal, vColor;
var modelingLoc, viewingLoc, projectionLoc, transformLoc;

var eyePosition   = vec4( 0.0, 0.0, 2.0, 1.0 );
var lightPosition = vec4( 10.0, 10.0, 0.0, 1.0 );

var materialAmbient = vec4( 0.25, 0.25, 0.25, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 0.0, 1.0 );
var materialShininess = 30.0;


// var testObject = new cube();
// var testObject = new ring();
// var testObject = new uvSphere();
var testObject = new uvTorus();
// var testObject = new uvCylinder();
// var testObject = new uvCone();
unitize(teapotModel); // Make teapot unit sized
var floor = new grid();

function setupAttribute(buffer, bufferData, attribPos, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bufferData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribPos);
    gl.vertexAttribPointer(attribPos, size, gl.FLOAT, false, 0, 0); 
}

function renderObject( obj )
{
	// ***HW4 hint: Set up the vertex attributes (positions, colors, normals) and the indices here.
	
	// ***HW4 Hint: You also need to set up the modeling matrix properly 
	//    so that the objects may be scaled correctly and appear at the desired locations.
    if(obj.buffer == null) {
        obj.buffer = {
            positionBuffer: gl.createBuffer(),
            normalBuffer: gl.createBuffer(),
            colorBuffer: gl.createBuffer(),
            indexBuffer: gl.createBuffer()
        };
    }
    // setup attribute buffers
    setupAttribute(obj.buffer.positionBuffer, flatten(obj.vertexPositions), vPosition, 3);
    setupAttribute(obj.buffer.colorBuffer, flatten(obj.vertexColors), vColor, 3);
    setupAttribute(obj.buffer.normalBuffer, flatten(obj.vertexNormals), vNormal, 3);
    // setup index buffer to current object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.indices, gl.STATIC_DRAW);
    // setup uniform buffers
    gl.uniformMatrix4fv(modelingLoc, false, flatten(obj.transform)) ;
    gl.drawElements( gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0 );
}


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    vPosition = gl.getAttribLocation(program, "vPosition");
    vNormal = gl.getAttribLocation(program, "vNormal");
    vColor = gl.getAttribLocation(program, "vColor");

	// uniform variables in shaders
    modelingLoc   = gl.getUniformLocation(program, "modelingMatrix"); 
    viewingLoc    = gl.getUniformLocation(program, "viewingMatrix"); 
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix"); 

    gl.uniform4fv( gl.getUniformLocation(program, "eyePosition"), 
       flatten(eyePosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),
       flatten(materialAmbient));
    gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),
       flatten(materialDiffuse) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"), 
       flatten(materialSpecular) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess);
    
    // Add vertexColors member to the objects
    testObject.vertexColors = new Float32Array(testObject.vertexNormals);
    setColor( testObject, 1.0, 0.0, 0.0);
    teapotModel.vertexColors = new Float32Array(teapotModel.vertexNormals);
    setColor( teapotModel, 0.0, 1.0, 0.0);


    //event listeners for buttons 
    document.getElementById( "xButton" ).onclick = rotateX;
    document.getElementById( "yButton" ).onclick = rotateY;
    document.getElementById( "zButton" ).onclick = rotateZ;
    document.getElementById( "pButton" ).onclick = function() {paused=!paused;};
    document.getElementById( "dButton" ).onclick = function() {depthTest=!depthTest;};
	
	// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
	canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    render();
};

function render() {
	var modeling = mult(rotate(theta[xAxis], 1, 0, 0),
	                mult(rotate(theta[yAxis], 0, 1, 0),rotate(theta[zAxis], 0, 0, 1)));

	if (paused)	modeling = moonRotationMatrix;
	
	var viewing = lookAt(vec3(eyePosition), [0,0,0], [0,1,0]);

	var projection = perspective(60, 1.0, 0.5, 10.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    if (! paused) theta[axis] += 2.0;
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
	
    gl.uniformMatrix4fv( modelingLoc,   0, flatten(modeling) );
    gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );

	// Set the modeing transformation so that the object is shrinked and moved to the left.
    testObject.transform = mult( translate(-0.5, 0, 0), mult(scale(0.5, 0.5, 0.5), modeling) );
    renderObject( testObject );
    
	// Set the modeing transformation so that the teapot is shrinked and moved to the right.
    teapotModel.transform = mult( translate(0.5, 0, 0), mult(scale(0.5, 0.5, 0.5), modeling) );
    renderObject( teapotModel );
	
	// Set the modeing transformation so that the floor is lower.
	floor.transform = translate(0, -0.5, 0);
	renderObject( floor );
	
    requestAnimFrame( render );
}
