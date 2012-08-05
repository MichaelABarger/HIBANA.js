


// global constants
var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;
var ROOM_DIM = 50, OBJECT_SIZE = 2.5, OBJECT_DETAIL = 30;
var MAX_AZIMUTH = Math.PI / 2; 
var MOUSE_SPEED = 0.0001

// global variables
var azimuth, zenith, mouse_x, mouse_y, camera;
var renderer, composer, camera_radius, camera_home, scene;
var mouse_decay;
var objects;


// ****** Executes as soon as the window has loaded
$(window).load( function() {
	// initialize the 3D engine
	init3D();
	
	$("#main3d").mousedown( function() {
		mouse_decay = false;
		mouse_x = 0;
		$("#main3d").bind( "mousemove", function( event ) {
			mouse_x = event.pageX - $("#main3d").position().left - $("#main3d").width() / 2;
		});
	});
	
	$("body").mouseup( function() {
		mouse_decay = true;
		$("#main3d").unbind( "mousemove" );
	});
	
	$("#main3d").mouseleave( function() {
		mouse_decay = true;
		$("#main3d").unbind( "mousemove" );
	});
	
});

// ****** Makes sure the 3D draws properly even if the browser window is resized
$(window).resize( function() {

	WIDTH = $("#main3d").width(); HEIGHT = $("#main3d").height();
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
	renderer.setSize( WIDTH, HEIGHT );
	
});




// ****** Initializes the 3D environment
function init3D() {

	// initialize 3d globals
	WIDTH = $("#main3d").width(); HEIGHT = $("#main3d").height();
	VIEW_ANGLE = 65; ASPECT = WIDTH / HEIGHT; NEAR = 1; FAR = 100;	// camera setup vars
	azimuth = 0, mouse_x = 0, mouse_decay = true;
	
	// initialize renderer
	renderer = new THREE.WebGLRenderer( { antialias : true, shadowMapEnabled : true, shadowMapSoft : true, gammaInput : true, gammaOutput : true } );
    renderer.setSize( WIDTH, HEIGHT );
	renderer.setClearColorHex( 0xFFFFFF, 1 );
    $("#main3d").append( renderer.domElement );

    scene = new THREE.Scene();

	createRoom();
	createCamera();	
	createObjects( 25 );
	createLights();
	
	// start animation
	$("#main3d img").css( "visibility", "hidden" );
	animate();
	
}

function createRoom() {
	var geo = new THREE.CubeGeometry( ROOM_DIM,  ROOM_DIM,  ROOM_DIM, 10, 10, 10 );
	var materials = [	new THREE.MeshPhongMaterial( { color : 0xBBBBFF, shading : THREE.FlatShading, shininess : 3, specular: 0xFFFFFF } ),
				new THREE.MeshBasicMaterial( { color : 0x444444, shading : THREE.FlatShading, wireframe : true, wireframeLinewidth : 4, opacity : 0.3, transparent : true } ) ];
			
	var room_mesh = THREE.SceneUtils.createMultiMaterialObject( geo, materials );
	room_mesh.position.set( 0, 0, 0 );
	room_mesh.children[0].doubleSided = true;
	room_mesh.children[1].doubleSided = true;
	scene.add( room_mesh );
}

function createObjects( objectCount ) {
	objects = [];
	for ( var i = 0; i < objectCount; i++ ) {
		var object = new THREE.Mesh( new THREE.SphereGeometry( OBJECT_SIZE, OBJECT_DETAIL, OBJECT_DETAIL ),
				new THREE.MeshPhongMaterial( { color : 0xFF0000 } ) );
		object.position = createRandomPositionWithinRoom();
		scene.add( object );
		objects.push( object );
	}
}

function createRandomPositionWithinRoom() {
	var x = createRandomCoordinateWithinRoom();
	var y = createRandomCoordinateWithinRoom();
	var z;
	do {
		z = createRandomCoordinateWithinRoom();
	} while ( z > camera.position.z - OBJECT_SIZE * 5 ); 
	
	return new THREE.Vector3( x, y, z );
}

function createRandomCoordinateWithinRoom() {
	var maxDistanceFromCenter = ROOM_DIM / 2 - OBJECT_SIZE * 2;
	return Math.random() * 2 * maxDistanceFromCenter - maxDistanceFromCenter;
}

function createLights() {
	var point_light = new THREE.PointLight( 0xFFFFFF, 0.6);
	point_light.position.set( 0, 0, 0 );
	scene.add( point_light );
	var camera_light = new THREE.PointLight( 0xFFFFFF, 0.3);
	camera_light.position = camera.position;
	scene.add( camera_light );
	var ambient_light = new THREE.AmbientLight( 0x333333 );
	scene.add( ambient_light );	
}

function createCamera() {
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	camera.position.set( 0, 0, ROOM_DIM / 2 - OBJECT_SIZE );
	camera_radius = 15;
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
    scene.add( camera );
}



// ****** Animation loop function
function animate() {
	
	requestAnimationFrame( animate );
	render();
	
}



// ****** Rendering function executed every refresh, responsible also for moving the camera
function render() {
	/*
	////////////////   UPDATE CAMERA POSITION   ///////////////
	if ( mouse_x != 0 && azimuth != 0 )
		azimuth += mouse_x * MOUSE_SPEED *  ( 1 - ((mouse_x * azimuth) / Math.abs(mouse_x * azimuth))  * (Math.abs(azimuth)/ MAX_AZIMUTH) );
	else
		azimuth += mouse_x * MOUSE_SPEED * ( 1 - (Math.abs(azimuth) / MAX_AZIMUTH) );
	
	if ( mouse_decay == true ) {
		if ( Math.abs( mouse_x ) < 0.1 ) {
			mouse_decay = false;
			mouse_x = 0;
		}
		mouse_x /= 1.1;
	}
	
	camera.position.x = target.x + camera_radius * Math.sin( azimuth );
	camera.position.z = target.z + camera_radius * Math.cos( azimuth );
	camera.lookAt( target );
	*/
	
	//////////////   PARTICLES   ////////////////
	/*
	if ( particles_playing == true ) {
		for ( e in emitter ) {
			generateParticles( emitter[e] );
			ageParticles( emitter[e] );
			emitter[e].geo.verticesNeedUpdate = true;
			emitter[e].geo.colorsNeedUpdate = true;
		}
	}
	*/
	
	//////////////   RENDER   ///////////////////
	renderer.render( scene, camera );
	
}