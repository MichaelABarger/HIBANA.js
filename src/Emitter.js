/*
Emitter.js (https://github.com/MichaelABarger/HIBANA.js/src/Emitter.js)
Part of the HIBANA.js open-source project, a WebGL particle engine for Three.js

@author Michael A Barger (mikebarger@gmail.com)

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

	for ( p in HIBANA.Emitters._defaultParameters )
		this[p] = HIBANA.Emitters._defaultParameters[p];		
	for ( p in parameters )
		this[p] = HIBANA._clone(parameters[p]);

	this.time = new Date().getTime();
	this.active_particles = [];
	this.next_particle = 0;
	this.overflow = 0;
	this.jitter_overflow = 0;
	this.random_overflow = 0;
	this.waviness_overflow = 0;

	this.starting_position = THREE.GeometryUtils.randomPointsInGeometry( object.geometry, this.particle_count );
	
	this.geometry = new THREE.Geometry()
	this.geometry.colors = [];
	for ( var i = 0; i < this.particle_count; i++ ) {
		this.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
		this.geometry.colors.push( this.particle_color.clone() );
	}
	this.geometry.dynamic = true;
	

	this._generateInitialVelocities();
	this._makeMaterial();
	
	this.system = new THREE.ParticleSystem( this.geometry, this.material );
	this.system.position = object.position;
	this.system.sortParticles = true;
	object.parent.add( this.system );

	return this;
};


HIBANA.Emitter.prototype = {

	constructor: HIBANA.Emitter,

	clear: function() {
		for ( p in this.active_particles ) {
			this.active_particles[p].vertex.copy( this.hidden_point );
			this.active_particles[p].color.copy( this.particle_color );
		}
		this.active_particles = [];
	},

	age: function () {
		if ( this.paused ) return this;

		var current_time = new Date().getTime();
		var dt = current_time - this.time;
		this.time = current_time;	 
		var new_particle_count = Math.floor( dt * this.rate + this.overflow );
		this.overflow = (dt * this.rate + this.overflow) - new_particle_count;

		// generate new particles	
		for ( var i = 0; i < new_particle_count; i++ ) {
			if ( this.active_particles.length > this.particle_count )
				break;

			this.active_particles.push( new HIBANA.Particle( {
				vertex: this.geometry.vertices[ this.next_particle ],
				color:  this.geometry.colors[ this.next_particle ],
				life:	Math.round(this.particle_life_min + Math.random() * this.particle_life_range),
				initial_velocity: this.initial_velocity[ this.next_particle ].clone(),
				starting_position: this.starting_position[ this.next_particle ],
				home: this.hidden_point
			} );
			
			if ( ++this.next_particle >= this.particle_count )
				this.next_particle = 0;
		}
	
		// age active particles
		for ( p in this.active_particles ) {
			var particle = this.active_particles[p];
			particle.life -= dt;
			if ( particle.life <= 0 ) {
				particle.age += dt;
				particle.vertex.copy( this.hidden_point );
				particle.color.copy( this.particle_color );
				this.active_particles.splice( p, 1 );
			} else {
				if ( this.jitter > 0.0 && this.jitter_rate > 0.0 ) {
					var jitter_count = Math.floor( dt * this.jitter_rate + this.jitter_overflow );
					this.jitter_overflow = (dt * this.jitter_rate + this.jitter_overflow) - jitter_count;
					for ( i = 0; i < jitter_count; i++ )
						particle.vertex.addSelf( particle.normal_plane.randomVector( this.jitter ) );
				},
				if ( this.random > 0.0 && this.random_rate > 0.0 ) {
					var random_count = Math.floor( dt * this.random_rate + this.random_overflow );
					this.random_overflow = (dt * this.random_rate + this.random_overflow) - random_count;
					for ( i = 0; i < random_count; i++ )
						particle.velocity.addSelf( particle.velocity.getNormalPlane().randomVector( this.random ) );
				}
				if ( this.waviness > 0.0 && this.waviness_rate > 0.0 ) {
					var waviness_count = Math.floor( dt * this.waviness_rate + this.waviness_overflow );
					this.waviness_overflow = (dt * this.waviness_rate + this.waviness_overflow) - waviness_count;
					for ( i = 0; i < waviness_count; i++ )
						particle.velocity.addSelf( particle.normal_plane.randomVector( this.waviness ) );
				}
				if ( HIBANA.Universal.is_active )
					particle.velocity.addSelf( HIBANA.Universal.force.clone().multiplyScalar(dt) );
				particle.vertex.addSelf( particle.velocity );
			}
		}
		this.geometry.verticesNeedUpdate = true;
		this.geometry.colorsNeedUpdate = true;
		return this;
	},

	
	pause: function () { this.paused = true; return this; },
	play: function () { 
		this.paused = false;
		this.time = new Date().getTime();
		return this;
       	},
	togglePause: function() {
		this.paused = !this.paused;
	       	this.time = new Date().getTime();
		return this;
	},

	setParticleColor: function ( particle_color ) {
		this.particle_color = particle_color;
		this._makeMaterial();
		this.system.material = this.material;
		return this;
	},
	setParticleTexture: function ( texture ) {
		this.texture = texture;
		this._makeMaterial();
		this.system.material = this.material;
		return this;
	},
	setParticleSize: function ( particle_size ) {
		this.particle_size = particle_size;
		this._makeMaterial();
		this.system.material = this.material;
		return this;
	},
	setParticleLifetimeMin: function ( min ) { this.particle_life_min = min * 1000; return this; },
	setParticleLifetimeRange: function ( range ) { this.particle_life_range = range * 1000; return this; },

	setRate: function ( particles_per_second ) { 
		this.rate = particles_per_second / 1000.0; 
		return this;
       	},
	setAngle: function ( angle ) { 
		this.angle = angle;
		this._generateInitialVelocities();
		return this; 
	},
	setForceMin: function ( feet_per_second ) { 
		this.force_min = feet_per_second / 1000.0;
		this._generateInitialVelocities();
		return this;
	},
	setForceRange: function ( feet_per_second ) {
		this.force_range = feet_per_second / 1000.0;
		this._generateInitialVelocities();
		return this;
	},
	setJitter: function ( jitter ) { this.jitter = jitter; return this; },
	setJitterRate: function ( jitters_per_second ) { this.jitter_rate = jitters_per_second / 1000.0; return this; },
	setRandom: function ( random ) { this.random = random; return this; },
	setRandomRate: function ( randoms_per_second ) { this.random_rate = randoms_per_second / 1000.0; return this; },
	setWaviness: function ( waviness ) { this.waviness = waviness; return this; },
	setWavinessRate: function ( wavies_per_second ) { this.waviness_rate = wavies_per_second / 1000.0; return this; },

	_generateInitialVelocities: function () {
		this.initial_velocity = [];
		if ( this.angle == 0.0 ) {
			var linear = new THREE.Vector3( 0, 1, 0 );
			for ( i = 0; i < this.particle_count; i++ ) {
				var force = this.force_min + this.force_range * Math.random(); 
				this.initial_velocity.push( linear.clone().multiplyScalar( force ) );
			}
		} else {
			for ( i = 0; i < this.particle_count; i++ ) {
				var force = this.force_min + this.force_range * Math.random();
				var zenith = Math.random() * this.angle * 2 - this.angle;
				var azimuth = Math.random() * Math.PI * 2;
				this.initial_velocity.push( new THREE.Vector3( force * Math.sin(zenith) * Math.sin(azimuth),
							force * Math.cos(zenith),
							force * Math.sin(zenith) * Math.cos(azimuth) ) );
			}
		}
	},

	_makeMaterial: function () {
		this.material = new THREE.ParticleBasicMaterial( { size: this.particle_size,
								   color: 0xFFFFFF,
								   map: this.texture,
								   blending: THREE.AdditiveBlending,
								   vertexColors: true,
								   transparent: true,
								   overdraw: true,
								   depthWrite: false } );
	}
};
