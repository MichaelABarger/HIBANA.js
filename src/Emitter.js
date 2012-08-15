// Emitter.js
// Part of the HIBANA.js open-source project
// by Michael Barger

/*
The MIT License

Copyright (c) 2012 Hibana.js authors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

HIBANA.Emitter = function ( object, parameters ) {
		
		parameters = parameters || {};
		this.particle_count = parameters.particle_count || 400;
		this.particle_color = parameters.particle_color || new THREE.Color( 0xFFFFFF );
		this.rate = parameters.rate || 75;
		this.particle_lifetime_min = parameters.particle_lifetime_min || 10;
		this.particle_lifetime_range = parameters.particle_lifetime_range || 25;
		this.emission_angle = parameters.emission_angle || 0.0;
		this.emission_force = parameters.emission_force || 1.0;
		this.jitter_factor = parameters.jitter_factor || 0.0;
		this.starting_position = THREE.GeometryUtils.randomPointsInGeometry( object.geometry, emitter.particle_count );
		this.original_color = new emitter.particle_color.clone();
		this.hidden_point = parameters.hidden_point || new THREE.Vector3( -1000, -1000, -1000 );

		this.paused = parameters.paused || true;
		this.particle_size = parameters.particle_size || 2.0;
		this.material = this.__makeMaterial( this.texture, this.particle_size ),
		this.texture = parameters.texture || __makeDefaultTexture();

		this.geometry.colors = [];
		for ( var i = 0; i < this.particle_count; i++ ) {
			this.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
			this.geometry.colors.push( new THREE.Color().copy( this.original_color ) );
		}
		this.geometry.dynamic = true;
		
		this.__generateStartingVelocities( this );
		
		this.system = new THREE.ParticleSystem( this.geometry, this.material );
		this.system.position = object.position;
		this.system.sortParticles = true;
		object.parent.add( this.system );
		
		return this;
};

HIBANA.Emitter.prototype = {

	constructor: HIBANA.Emitter,

	active_particles: [],

	next_particle: 0,

	paused: true,

	pause: function () {
		this.paused = true;
		return this;
	},
	
	play: function () {
		this.paused = false;
		return this;
	},

	togglePause: function() {
		this.paused = !this.paused;
		return this;
	},

	geometry: new THREE.Geometry(),

	setJitterFactor: function ( new_jitter_factor ) {
		for ( e in this.emitters ) 
			this.emitters[e].jitter_factor = new_jitter_factor;
	},
	
	setEmissionAngle: function ( new_angle ) {
		for ( e in this.emitters ) {
			this.emitters[e].emission_angle = new_angle;
			this.__generateStartingVelocities( this.emitters[e] );
		}
	},
	
	setEmissionForce: function ( new_force ) {
		for ( e in this.emitters ) {
			this.emitters[e].emission_force = new_force;
			this.__generateStartingVelocities( this.emitters[e] );
		}
	},
	
	setLifetimeMinimum: function ( new_min ) {
		for ( e in this.emitters )
			this.emitters[e].particle_lifetime_min = new_min;
	},
	
	setLifetimeRange: function ( new_range ) {
		for ( e in this.emitters )
			this.emitters[e].particle_lifetime_range = new_range;
	},
		
	clearAll: function ( emitter ) {
		for ( p in emitter.active_particles ) {
			emitter.active_particles[p].vertex.copy( emitter.hidden_point );
			emitter.active_particles[p].color.copy( emitter.original_color );
		}
		emitter.active_particles = [];
	},
			
	__jitterVelocity : function ( velocity, emitter ) {
		if ( !emitter.jitter_factor || velocity.isZero() )
			return velocity;
		var random_offset = Math.random() * emitter.jitter_factor * 2 - emitter.jitter_factor;
		var perpendicular_U = velocity.clone().crossSelf( this.__UNIT ).normalize().multiplyScalar( random_offset );
		if ( perpendicular_U.isZero() )
			perpendicular_U = velocity.clone().crossSelf( this.__UNIT.negate() ).normalize().multiplyScalar( random_offset );
		var perpendicular_V = perpendicular_U.clone().crossSelf( velocity ).normalize().multiplyScalar( random_offset );
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
	
	__generateStartingVelocities : function ( emitter ) {
		emitter.starting_velocity = [];
		if ( emitter.emission_angle == 0.0 ) {
			var linear = new THREE.Vector3( 0, emitter.emission_force, 0 );
			for ( var i = 0; i < emitter.particle_count; i++ )
				emitter.starting_velocity.push( linear.clone() );
		} else {
			for ( var i = 0; i < emitter.particle_count; i++ ) {
				var zenith = Math.random() * emitter.emission_angle * 2 - emitter.emission_angle;
				var azimuth = Math.random() * Math.PI * 2;
				emitter.starting_velocity.push( new THREE.Vector3( 	emitter.emission_force * Math.sin(zenith) * Math.sin(azimuth),
																	emitter.emission_force * Math.cos(zenith),
																	emitter.emission_force * Math.sin(zenith) * Math.cos(azimuth) ) );
			}
		}
	},
		
	__UNIT: new THREE.Vector3( 1, 1, 1 ).normalize()
}
	__makeDefaultTexture: function () {
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
				new_particle.life_expectancy = emitter.particle_lifetime_min + Math.random() * emitter.particle_lifetime_range;
				new_particle.velocity = emitter.starting_velocity[ emitter.next_particle ].clone();
				
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
					particle.vertex.copy( this.emitters[e].hidden_point );
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
	}
};
