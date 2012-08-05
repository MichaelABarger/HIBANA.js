


// global constants
var WIDTH, HEIGHT, VIEW_ANGLE = 65, ASPECT, NEAR = 5, FAR = 100;
var ROOM_DIM = 50, OBJECT_SIZE = 2.5, OBJECT_DETAIL = 30;
var MAX_CAMERA_ANGLE = Math.PI / 5;
var CAMERA_RADIUS = ROOM_DIM / 2 - OBJECT_SIZE;
var CAMERA_HOME = new THREE.Vector3( 0, 0, ROOM_DIM / 2 - OBJECT_SIZE );
var CAMERA_TARGET = new THREE.Vector3( 0, 0, 0 );
var AZIMUTH_RANGE = OBJECT_SIZE; 
var MOUSE_SPEED = 0.0001

// global variables
var azimuth = 0, zenith = 0, mouse_x = 0, mouse_y = 0, mouse_decay = true, mouse_is_down = false;
var renderer, composer, camera, scene;
var mouse_decay;
var objects;
var hibana;


// ****** Executes as soon as the window has loaded
$(window).load( function() {
	// initialize the 3D engine
	init3D();
	
	$("#main3d").mousedown( function() {
		mouse_decay = false;
		mouse_is_down = true;
		mouse_x = mouse_y = 0;
		$("#main3d").bind( "mousemove", function( event ) {
			mouse_is_down = true;
			mouse_x = event.pageX - $("#main3d").position().left - $("#main3d").width() / 2;
			mouse_y = event.pageY - $("#main3d").position().top - $("#main3d").height() / 2;
		});
	});
	
	$("body").mouseup( function() {
		mouse_decay = true;
		mouse_is_down = false;
		$("#main3d").unbind( "mousemove" );
	});
	
	$("#main3d").mouseleave( function() {
		mouse_decay = true;
		mouse_is_down = false;
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
	WIDTH = $("#main3d").width(); HEIGHT = $("#main3d").height(); ASPECT = WIDTH / HEIGHT;
	
	// initialize renderer
	renderer = new THREE.WebGLRenderer( { antialias : true, shadowMapEnabled : true, shadowMapSoft : true, gammaInput : true, gammaOutput : true } );
    renderer.setSize( WIDTH, HEIGHT );
	renderer.setClearColorHex( 0xFFFFFF, 1 );
    $("#main3d").append( renderer.domElement );

    scene = new THREE.Scene();

	createRoom();
	createCamera();	
	
	hibana = new HIBANA( scene, new THREE.Vector3( -100, -100, -100 ) );
	
	createObjects( 25 );
	createEmitters();
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

function createCamera() {
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	camera.position = new THREE.Vector3().copy( CAMERA_HOME );
	camera.lookAt( CAMERA_TARGET );
    scene.add( camera );
}

function createObjects( objectCount ) {
	objects = [];
	for ( var i = 0; i < objectCount; i++ ) {
		var object = new THREE.Mesh( new THREE.SphereGeometry( OBJECT_SIZE, OBJECT_DETAIL, OBJECT_DETAIL ),
				new THREE.MeshPhongMaterial( { color: 0xFF0000, metal: true, opacity: 0.8 } ) );
		object.position = createRandomPositionWithinRoom();
		scene.add( object );
		objects.push( object );
	}
}

function createEmitters() {
	for ( o in objects ) {
		hibana.addEmitter( { mesh: objects[o], particle_color: new THREE.Color( 0xFF9999 ) } )
	}
	hibana.play();
}

function createRandomPositionWithinRoom() {
	var x = createRandomCoordinateWithinRoom();
	var y = createRandomCoordinateWithinRoom();
	var z = createRandomCoordinateWithinRoom();
	
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




// ****** Animation loop function
function animate() {
	
	requestAnimationFrame( animate );
	render();
	
}



// ****** Rendering function executed every refresh, responsible also for moving the camera
function render() {
	////////////////   UPDATE CAMERA POSITION   ///////////////
	azimuth = calculateCameraAngleFromMouse( azimuth, mouse_x );
	zenith = calculateCameraAngleFromMouse( zenith, mouse_y );
	
	decayCameraRotationalVelocity();
	
	camera.position.x = CAMERA_RADIUS * Math.sin( azimuth );
	camera.position.y = CAMERA_RADIUS * -Math.sin( zenith );
	camera.lookAt( CAMERA_TARGET );
	
	hibana.age();
	
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

function calculateCameraAngleFromMouse( angle, mouse ) {
	if ( mouse != 0 && angle != 0 )
		return angle + mouse * MOUSE_SPEED *  ( 1 - ((mouse * angle) / Math.abs(mouse * angle))  * (Math.abs(angle)/ MAX_CAMERA_ANGLE) );
	else
		return angle + mouse * MOUSE_SPEED * ( 1 - (Math.abs(angle) / MAX_CAMERA_ANGLE) );
}

function decayCameraRotationalVelocity() {
	if ( mouse_decay ) {
		if ( Math.abs( mouse_x ) > 0.1 && Math.abs( mouse_y ) > 0.1 ) {
			mouse_x /= 1.1;
			mouse_y /= 1.1;
		} else {
			mouse_decay = false;
			mouse_x = mouse_y = 0;
		}
	} else if ( !mouse_is_down ) {
		var difference_x = CAMERA_HOME.x - camera.position.x;
		var difference_y = CAMERA_HOME.y - camera.position.y;
		mouse_x = Math.abs(difference_x) > 0.1 ? (difference_x / 10.0) * 6.0 : 0;
		mouse_y = Math.abs(difference_y) > 0.1 ? -(difference_y / 10.0) * 6.0 : 0;
	}
}