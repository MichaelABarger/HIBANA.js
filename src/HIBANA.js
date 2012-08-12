// HIBANA.js
// Particle engine for THREE.js
// loosely based on Sparks.js
// by Michael Barger

HIBANA = function( scene, parameters ) {

	parameters = parameters || {};
	this.scene = scene;
	this.hidden_point = parameters.hidden_point || new THREE.Vector3( -1000, -1000, -1000 );
	this.paused = parameters.paused || true;
	this.particle_size = parameters.particle_size || 4.0;
	this.texture = parameters.texture || __makeDefaultTexture();
	this.global_force = parameters.global_force || new THREE.Vector3( 0.0, -0.05, 0.0 );
	this.global_force_is_active = true;
	
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
		canvas.width = 24;
		canvas.height = 24;

		var context = canvas.getContext( '2d' );
		var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
		gradient.addColorStop( 0, 'rgba(255,255,255,1.0)' );
		gradient.addColorStop( 0.15, 'rgba(255,255,255,.9)' );
		gradient.addColorStop( 0.3, 'rgba(255,255,255,.6)' );
		gradient.addColorStop( 0.5, 'rgba(255,255,255,.3)' );
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
		parameters.particle_count = parameters.particle_count || 300;
		parameters.particle_color = parameters.particle_color || new THREE.Color( 0xFFFFFF );
		parameters.rate = parameters.rate || 75;
		parameters.acceleration = parameters.acceleration || new THREE.Vector3( 0.0, 1.0, 0.0 );
		parameters.particle_life_expectancy_min = parameters.particle_life_expectancy_min || 10;
		parameters.particle_life_expectancy_range = parameters.particle_life_expectancy_range || 25;
		
		
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
		emitter.jitter_factor = parameters.jitter_factor;
		
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
		this.particle_size = this.material.size = new_size;
	},
	
	setRate: function ( new_rate ) {
		for ( e in this.emitters )
			this.emitters[e].rate = new_rate;
	},
	
	setGlobalForce: function ( new_force ) {
		this.global_force = new_force;
	},
	
	toggleGlobalForce: function () {
		this.global_force_is_active = !this.global_force_is_active;
	},
	
	setJitterFactor: function ( new_jitter_factor ) {
		for ( e in this.emitters ) 
			this.emitters[e].jitter_factor = new_jitter_factor;
	},

	age: function () {
		if ( this.paused ) return this;
		
		__generateParticles = function( emitter ) {
			var r = 100 * Math.random();
			for ( var i = 0; i < Math.floor( r / (101.0 - emitter.rate)); i++ ) {
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
				var particle = this.emitters[e].active_particles[p];
				if ( ++particle.age > particle.life_expectancy ) {
					particle.vertex.copy( this.hidden_point );
					particle.color.copy( this.emitters[e].original_color );
					this.emitters[e].active_particles.splice( p, 1 );
				} else {
					this.__jitterVelocity( particle.velocity, this.emitters[e] );
					particle.vertex.addSelf( particle.velocity );
					if ( this.global_force_is_active )
						particle.velocity.addSelf( this.global_force );
				}
			}
			this.emitters[e].geometry.verticesNeedUpdate = true;
			//this.emitters[e].geometry.colorsNeedUpdate = false;
		}	
		return this;
	},
	
	__jitterVelocity : function ( velocity, emitter ) {
		if ( !emitter.jitter_factor || velocity.isZero() )
			return velocity;
		var perpendicular_U = velocity.clone().crossSelf( this.__UNIT ).normalize();
		if ( perpendicular_U.isZero() )
			perpendicular_U = velocity.clone().crossSelf( this.__UNIT.negate() ).normalize();
		var perpendicular_V = perpendicular_U.clone().crossSelf( velocity ).normalize();
		perpendicular_U.multiplyScalar( Math.random() * emitter.jitter_factor * 2 - emitter.jitter_factor );
		perpendicular_V.multiplyScalar( Math.random() * emitter.jitter_factor * 2 - emitter.jitter_factor );
		velocity.addSelf( perpendicular_U );
		velocity.addSelf( perpendicular_V );
		return velocity;
	},

	
	__makeMaterial: function ( texture ) {
		return new THREE.ParticleBasicMaterial( { 	size: this.particle_size,
													color: 0xFFFFFF,
													map: texture,
													blending: THREE.AdditiveBlending,
													vertexColors: true,
													transparent: true,
													overdraw: true,
													depthWrite: false } );
	},
		
	__UNIT: new THREE.Vector3( 1, 1, 1 ).normalize()
}