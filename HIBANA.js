// HIBANA.js
// Particle engine for THREE.js
// loosely based on Sparks.js
// by Michael Barger

'use strict';
var HIBANA = HIBANA || {

particle_mat: [],
particles_playing: false,


initialize: function() {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 16;
	canvas.height = 16;

	var context = canvas.getContext( '2d' );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
	gradient.addColorStop( 0, 'rgba(255,255,255,.8)' );
	gradient.addColorStop( 0.2, 'rgba(255,255,255,.6)' );
	gradient.addColorStop( 0.4, 'rgba(255,255,255,.3)' );
	gradient.addColorStop( 1, 'rgba(0,0,0,0)' );

	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height );
	
	var texture = new THREE.Texture( canvas );
	texture.needsUpdate = true;
	
	this.particle_mat = new THREE.ParticleBasicMaterial( { size: PARTICLE_SIZE,
														color: 0xEEEEEE,
													map: texture,
													blending: THREE.AdditiveBlending,
													vertexColors: true,
													transparent: true,
													depthTest: false } );
},



createEmitter: function ( mesh ) {
	var e = {};
	e.geo = new THREE.Geometry();
	var color = [];
	var original = [];
	for ( var i = 0; i < NUM_PARTICLES; i++ ) {
		var x = rackstats.depth / 2.0 - Math.random() * rackstats.depth;
		var z = rackstats.width / 2.0 - Math.random() * rackstats.width;
		var p = new THREE.Vector3( x, -500, z );
		original.push( new THREE.Vector3( p.x, p.y, p.z ) );
		color.push( new THREE.Color( sys_color ) );
		e.geo.vertices.push( p );
	}
	e.geo.colors = color;
	e.init_pos = original;
	
	e.sys = new THREE.ParticleSystem( e.geo, particle_mat );
	e.sys.position.set( sys_x, sys_y, sys_z );
	e.geo.dynamic = true;
	e.sys.sortParticles = true;
	e.color = new THREE.Color( sys_color );
	e.firstfew = new THREE.Color();
	e.firstfew.setRGB( (1.0 - e.color.r) / FIRST_FEW_TICKS, (1.0 - e.color.g) / FIRST_FEW_TICKS, (1.0 - e.color.b) / FIRST_FEW_TICKS );
	e.lastfew = new THREE.Color();
	e.lastfew.setRGB( e.color.r / LAST_FEW_TICKS / 1.3, e.color.g / LAST_FEW_TICKS / 1.1, e.color.b / LAST_FEW_TICKS );
	e.particles = [];
	e.cur_particle = 0;
	e.rate = 0;
	e.lift = 0;
	
	HIBANA.scene.add( e.sys );
	HIBANA.emitters.push( e );
	cur_rack.emitter = e;
},



generateParticles: function( e ) {
	var r = 100 * Math.random();
	//if ( r  < e.rate ) {
	for ( var i = 0; i < Math.floor( r / (100.0 - e.rate)); i++ ) {
		var new_particle = {};
		
		new_particle.vertex = e.geo.vertices[ e.cur_particle ];
		new_particle.color = e.geo.colors[ e.cur_particle ];
		new_particle.color.setRGB( 1.0, 1.0, 1.0 );
		new_particle.init_pos = e.init_pos[ e.cur_particle ];
		new_particle.vertex.y = 0;
		new_particle.age = 0;
		new_particle.lifeExpectancy = PARTICLE_EXPECTANCY_MIN + Math.random() * PARTICLE_EXPECTANCY_RANGE;
		new_particle.velocity = new THREE.Vector3( 0, e.lift * new_particle.lifeExpectancy / PARTICLE_EXPECTANCY_RANGE, 0 );
		
		e.particles.push( new_particle );
		
		if ( ++e.cur_particle >= NUM_PARTICLES )
			e.cur_particle = 0;
	}
	
},



ageParticles: function( e ) {
	for ( p in e.particles ) {
		if ( ++e.particles[p].age > e.particles[p].lifeExpectancy ) {
			e.particles[p].vertex.x = e.particles[p].init_pos.x;
			e.particles[p].vertex.y = e.particles[p].init_pos.y;
			e.particles[p].vertex.z = e.particles[p].init_pos.z;
			e.particles[p].color = e.color;
			e.particles.splice( p, 1 );
		} else {
			// position/velocity change
			e.particles[p].velocity.x += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
			e.particles[p].velocity.y -= PARTICLE_GRAVITY;
			e.particles[p].velocity.z += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
			
			e.particles[p].vertex.x += e.particles[p].velocity.x;
			e.particles[p].vertex.y += e.particles[p].velocity.y;
			e.particles[p].vertex.z += e.particles[p].velocity.z;
			
			// color change
			var timeRemaining = e.particles[p].lifeExpectancy - e.particles[p].age;

			if ( e.particles[p].age <= FIRST_FEW_TICKS ) {
				e.particles[p].color.r -= e.firstfew.r;
				e.particles[p].color.g -= e.firstfew.g;
				e.particles[p].color.b -= e.firstfew.b;
			} else if ( timeRemaining <= LAST_FEW_TICKS ) {
				e.particles[p].color.r -= e.lastfew.r;
				e.particles[p].color.g -= e.lastfew.g;
				e.particles[p].color.b -= e.lastfew.b;
			}
		}
	}

}

};