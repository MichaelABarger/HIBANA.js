// HIBANA.js
// Particle engine for THREE.js
// loosely based on Sparks.js
// by Michael Barger

HIBANA = function( scene, parameters ) {

	parameters = parameters || {};
	this.scene = scene;
	this.hidden_point = parameters.hidden_point || new THREE.Vector3( -1000, -1000, -1000 );
	this.texture = parameters.texture || __makeDefaultTexture();
	this.paused = parameters.paused || true;
	this.particle_size = parameters.particle_size || 4.0;
	
	// thanks to Alteredq for inspiration on particle shader code!
	this.vertex_shader =
		"uniform float amplitude;" +
		"attribute float size;" +
		"attribute vec3 custom_color;" +
		
		"varying vec3 vColor" +
		
		"void main() {" +
			"vertex_color = custom_color;" +
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );" +
			"gl_PointSize = size * (300.0 / length( mvPosition.xyz ));" +
			"gl_Position = projectionMatrix * mvPosition;" +
		"}";
	this.fragment_shader =
		"uniform vec3 color;" +
		"uniform sampler2D texture;" +
		"varying vec3 vertex_color;" +
		"void main() {" +
			"gl_FragColor = vec4( color * vColor, 1.0 );" +
			"gl_FragColor *= texture2D( texture, gl_PointCoord );" +
		"}";
	this.attributes = {
		size: 			{ type: 'f', value: [] },
		custom_color:	{ type: 'c', value: [] }
	};
	this.uniforms = {
		amplitude:		{ type: 'f', value: 1.0 },
		color:			{ type: 'c', value: new THREE.Color( 0xFFFFFF ) },
		texture:		{ type: 't', value: 0, texture: this.texture }
	};
		
	this.material = this.__makeMaterial( this.texture, this.particle_size );
	this.emitters = [];
	
	function __makeDefaultTexture () {
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
		
		return texture;
	}

};


HIBANA.prototype = {

	constructor: HIBANA,
	
	addEmitter: function( parameters ) {
	
		parameters = parameters || {};
		parameters.particle_count = parameters.particle_count || 200;
		parameters.particle_color = parameters.particle_color || new THREE.Color( 0xFFFFFF );
		parameters.rate = parameters.rate || 75;
		parameters.acceleration = parameters.acceleration || new THREE.Vector3( 0, 0.25, 0 );
		parameters.particle_life_expectancy_min = parameters.particle_life_expectancy_min || 5;
		parameters.particle_life_expectancy_range = parameters.particle_life_expectancy_range || 35;
		
		var emitter = {};
		emitter.geometry = new THREE.Geometry();
		emitter.starting_position = THREE.GeometryUtils.randomPointsInGeometry( parameters.mesh.geometry, parameters.particle_count );
		emitter.original_color = new THREE.Color().copy( parameters.particle_color );
		
		emitter.geometry.colors = [];
		for ( var i = 0; i < parameters.particle_count; i++ ) {
			emitter.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
			emitter.geometry.colors.push( new THREE.Color().copy( emitter.original_color ) );
		}
		emitter.geometry.dynamic = true;
		
		emitter.system = new THREE.ParticleSystem( emitter.geometry, this.material );
		emitter.system.position = parameters.mesh.position;
		emitter.system.sortParticles = true;
		emitter.active_particles = [];
		emitter.next_particle = 0;
		emitter.rate = parameters.rate;
		emitter.acceleration = parameters.acceleration;
		emitter.particle_life_expectancy_min = parameters.particle_life_expectancy_min;
		emitter.particle_life_expectancy_range = parameters.particle_life_expectancy_range;
		
		this.scene.add( emitter.system );
		this.emitters.push( emitter );
		
		return this;
	},	
	
	pause: function () {
		this.paused = true;
	},
	
	play: function () {
		this.paused = false;
	},

	togglePause: function() {
		this.paused = !this.paused;
	},
	
	setParticleSize: function ( new_size ) {
		this.material.size = new_size;
	},
	
	setRate: function ( new_rate ) {
		for ( e in this.emitters )
			this.emitters[e].rate = new_rate;
	},

	age: function () {
		if ( this.paused ) return this;
		
		__generateParticles = function( emitter ) {
			var r = 100 * Math.random();
			for ( var i = 0; i < Math.floor( r / (100.5 - emitter.rate)); i++ ) {
				var new_particle = {};
				
				new_particle.vertex = emitter.geometry.vertices[ emitter.next_particle ];
				new_particle.color = emitter.geometry.colors[ emitter.next_particle ];
				new_particle.vertex.copy( emitter.starting_position[ emitter.next_particle ] );
				new_particle.age = 0;
				new_particle.life_expectancy = emitter.particle_life_expectancy_min + Math.random() * emitter.particle_life_expectancy_range;
				new_particle.velocity = new THREE.Vector3().copy( emitter.acceleration );
				
				emitter.active_particles.push( new_particle );
				
				if ( ++emitter.next_particle >= emitter.geometry.vertices.length )
					emitter.next_particle = 0;
			}
			
			return this;
		}

		
		for ( e in this.emitters ) {
			__generateParticles( this.emitters[e] );
			for ( p in this.emitters[e].active_particles ) {
				if ( ++this.emitters[e].active_particles[p].age > this.emitters[e].active_particles[p].life_expectancy ) {
					this.emitters[e].active_particles[p].vertex.copy( this.hidden_point );
					this.emitters[e].active_particles[p].color.copy( this.emitters[e].original_color );
					this.emitters[e].active_particles.splice( p, 1 );
				} else {
					// position/velocity change
					/*
					emitter.active_particles[p].velocity.x += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
					emitter.active_particles[p].velocity.y -= PARTICLE_GRAVITY;
					emitter.active_particles[p].velocity.z += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
					*/
					this.emitters[e].active_particles[p].vertex.addSelf( this.emitters[e].active_particles[p].velocity );
				}
			}
			this.emitters[e].geometry.verticesNeedUpdate = true;
			this.emitters[e].geometry.colorsNeedUpdate = false;
		}	
		return this;
	},
	
	__makeMaterial: function ( texture, particle_size ) {
		return new THREE.ParticleBasicMaterial( { 	size: particle_size,
													color: 0xFFFFFF,
													map: texture,
													blending: THREE.AdditiveBlending,
													vertexColors: true,
													transparent: true,
													overdraw: true,
													depthWrite: false } );
	}
}