// HIBANA.js
// Particle engine for THREE.js
// loosely based on Sparks.js
// by Michael Barger

HIBANA = function( scene, hidden_point ) {

var PARTICLE_SIZE = 6.5;
var DEFAULT_HIDDEN_COORD = -1000;
var DEFAULT_HIDDEN_POINT = new THREE.Vector3( DEFAULT_HIDDEN_COORD, DEFAULT_HIDDEN_COORD, DEFAULT_HIDDEN_COORD );

this.scene = scene;
this.hidden_point = hidden_point || DEFAULT_HIDDEN_POINT;

this.emitters = [];

this.paused = true;

this.material = __initialize_material( PARTICLE_SIZE );

	function __initialize_material( particle_size ) {
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
		
		return new THREE.ParticleBasicMaterial( { 	size: particle_size,
													color: 0xEEEEEE,
													map: texture,
													blending: THREE.AdditiveBlending,
													vertexColors: true,
													transparent: true,
													depthTest: false } );
	}
};


HIBANA.prototype = {

	constructor: HIBANA,
	
	addEmitter: function( parameters ) {
	
		parameters = parameters || {};
		parameters.particle_count = parameters.particle_count || 100;
		parameters.particle_color = parameters.particle_color || new THREE.Color( 0xFFFFFF );
		parameters.rate = parameters.rate || 50;
		parameters.acceleration = parameters.acceleration || new THREE.Vector3( 0, 5, 0 );
		parameters.particle_life_expectancy_min = parameters.particle_life_expectancy_min || 5;
		parameters.particle_life_expectancy_range = parameters.particle_life_expectancy_range || 30;
		
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
		/*
		emitter.firstfew = new THREE.Color();
		emitter.firstfew.setRGB( (1.0 - emitter.color.r) / FIRST_FEW_TICKS, (1.0 - emitter.color.g) / FIRST_FEW_TICKS, (1.0 - emitter.color.b) / FIRST_FEW_TICKS );
		emitter.lastfew = new THREE.Color();
		emitter.lastfew.setRGB( emitter.color.r / LAST_FEW_TICKS / 1.3, emitter.color.g / LAST_FEW_TICKS / 1.1, emitter.color.b / LAST_FEW_TICKS );
		*/
		emitter.active_particles = [];
		emitter.next_particle = 0;
		emitter.rate = parameters.rate;
		emitter.acceleration = parameters.acceleration;
		
		this.scene.add( emitter.system );
		this.emitters.push( emitter );
		
		return this;
	},	
	
	pause: function() {
		this.paused = true;
	},
	
	
	play: function() {
		this.paused = false;
	},
	

	age: function() {
		if ( this.paused ) return this;
		
		__generateParticles = function( emitter ) {
			var r = 100 * Math.random();
			for ( var i = 0; i < Math.floor( r / (100.0 - emitter.rate)); i++ ) {
				var new_particle = {};
				
				new_particle.vertex = emitter.geometry.vertices[ emitter.next_particle ];
				new_particle.color = emitter.geometry.colors[ emitter.next_particle ];
				new_particle.vertex.position = new THREE.Vector3().copy( emitter.starting_position[ emitter.next_particle ] );
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
				if ( ++this.emitters[e].active_particles[p].age > this.emitters[e].active_particles[p].lifeExpectancy ) {
					this.emitters[e].active_particles[p].position.copy( this.hidden_point );
					this.emitters[e].active_particles[p].color = this.emitters[e].original_color;
					this.emitters[e].active_particles.splice( p, 1 );
				} else {
					// position/velocity change
					/*
					emitter.active_particles[p].velocity.x += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
					emitter.active_particles[p].velocity.y -= PARTICLE_GRAVITY;
					emitter.active_particles[p].velocity.z += PARTICLE_DRIFT_OFFSET - PARTICLE_DRIFT * Math.random();
					*/
					this.emitters[e].active_particles[p].vertex.position.addSelf( this.emitters[e].active_particles[p].velocity );
					
					// color change
					/*
					var timeRemaining = emitter.particles[p].lifeExpectancy - emitter.particles[p].age;

					if ( emitter.active_particles[p].age <= FIRST_FEW_TICKS ) {
						emitter.active_particles[p].color.r -= emitter.firstfew.r;
						emitter.active_particles[p].color.g -= emitter.firstfew.g;
						emitter.active_particles[p].color.b -= emitter.firstfew.b;
					} else if ( timeRemaining <= LAST_FEW_TICKS ) {
						emitter.active_particles[p].color.r -= emitter.lastfew.r;
						emitter.active_particles[p].color.g -= emitter.lastfew.g;
						emitter.active_particles[p].color.b -= emitter.lastfew.b;
					}
					*/
				}
			}
			this.emitters[e].geometry.verticesNeedUpdate = true;
			this.emitters[e].geometry.colorsNeedUpdate = false;
		}	
		return this;
	}
}