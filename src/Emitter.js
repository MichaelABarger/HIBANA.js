/*
Emitter.js (https://github.com/MichaelABarger/HIBANA.js/src/Emitter.js)
part of the HIBANA.js open-source project
@author Michael A Barger

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

	for ( p in parameters )
		this[p] = parameters[p];
		
	this.starting_position = THREE.GeometryUtils.randomPointsInGeometry( object.geometry, this.particle_count );
	
	this.texture = this.texture || this.__makeDefaultTexture(),
	this.__makeMaterial(),
	
	this.geometry.colors = [];
	for ( var i = 0; i < this.particle_count; i++ ) {
		this.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
		this.geometry.colors.push( this.particle_color.clone() );
	}
	this.geometry.dynamic = true;
	
	this.__generateStartingVelocities();
	
	this.system = new THREE.ParticleSystem( this.geometry, this.material );
	this.system.position = object.position;
	this.system.sortParticles = true;
	object.parent.add( this.system );
	
	return this;
};

HIBANA.Emitter.prototype = {

	constructor: 		HIBANA.Emitter,

	active_particles: 	[],

	next_particle: 		0,
	
	geometry: 			new THREE.Geometry(),

	paused: 			true,
	
	particle_count:		400,
	
	particle_color:		new THREE.Color( 0xFFFFFF ),
	
	rate:				75,
	
	particle_life_min:	10,
	
	particle_life_range:25,
	
	angle:				0.0,
	
	force:				1.0,
	
	jitter:				0.0,
	
	hidden_point:		new THREE.Vector3( -1000, -1000, -1000 ),
	
	paused:				true,
	
	particle_size:		2.0,
	

	
	
	clear: function() {
		for ( p in this.active_particles ) {
			this.active_particles[p].vertex.copy( this.hidden_point );
			this.active_particles[p].color.copy( this.particle_color );
		}
		this.active_particles = [];
	},

	age: function () {
		if ( this.paused ) return this;
		
		this.__generateNewParticles();
		this.__ageActiveParticles();
		
		this.geometry.verticesNeedUpdate = true;
		this.geometry.colorsNeedUpdate = false;
		return this;
	},
	
	
	
	pause: function () { this.paused = true; return this; },
	play: function () { this.paused = false; return this; },
	togglePause: function() { this.paused = !this.paused; return this; },
	
	setParticleColor: function ( particle_color ) {
		this.particle_color = particle_color;
		this.__makeMaterial();
		return this;
	},
	getParticleColor: function () { return this.particle_color; },
	
	setRate: function ( rate ) { this.rate = rate; return this; },
	getRate: function () { return this.rate; },
	
	setParticleLifetimeMin: function ( min ) { this.particle_life_min = min; return this; },
	getParticleLifetimeMin: function () { return this.particle_life_min },
	
	setParticleLifetimeRange: function ( range ) { this.particle_life_range = range; return this; },
	getParticleLifetimeRange: function () { return this.particle_life_range; },
	
	setAngle: function ( angle ) { this.angle = angle; return this; },
	getAngle: function () { return this.angle; },
	
	setForce: function ( force ) { this.force = force; return this; },
	getForce: function () { return this.force; },
	
	setJitter: function ( jitter ) { this.jitter = jitter; return this; },
	getJitter: function () { return this.jitter; },
	
	setHiddenPoint: function ( hidden_point ) { this.hidden_point = hidden_point; return this; },
	getHiddenPoint: function () { return hidden_point; },
	
	setParticleSize: function ( particle_size ) {
		this.particle_size = particle_size;
		this.__makeMaterial();
		return this;
	},
	getParticleSize: function () { return particle_size; },
	
	setTexture: function ( texture ) {
		this.texture = texture;
		this.__makeMaterial();
		return this;
	},
	getTexture: function () { return this.texture; },
	
	
	
	__generateNewParticles: function () {
		var r = 100 * Math.random();
		for ( var i = 0; i < Math.floor( r / (101.0 - this.rate)); i++ ) {
			var new_particle = {};
			
			new_particle.vertex = this.geometry.vertices[ this.next_particle ];
			new_particle.color = this.geometry.colors[ this.next_particle ];
			new_particle.vertex.copy( this.starting_position[ this.next_particle ] );
			new_particle.age = 0;
			new_particle.life_expectancy = this.particle_lifetime_min + Math.random() * this.particle_lifetime_range;
			new_particle.velocity = this.starting_velocity[ this.next_particle ].clone();
			
			this.active_particles.push( new_particle );
			
			if ( ++this.next_particle >= this.geometry.vertices.length )
				this.next_particle = 0;
		}
	},
	
	__ageActiveParticles: function () {
		for ( p in this.active_particles ) {
			var particle = this.active_particles[p];
			if ( ++particle.age > particle.life_expectancy ) {
				particle.vertex.copy( this.hidden_point );
				particle.color.copy( this.particle_color );
				this.active_particles.splice( p, 1 );
			} else {
				this.__jitterVelocity( particle.velocity );
				particle.vertex.addSelf( particle.velocity );
				if ( HIBANA.Universal.is_active )
					particle.velocity.addSelf( HIBANA.Universal.force );
			}
		}
	},

	__jitterVelocity : function ( velocity ) {
		if ( !this.jitter || velocity.isZero() )
			return velocity;
		var random_offset = Math.random() * this.jitter * 2 - this.jitter;
		var perpendicular_U = velocity.clone().crossSelf( this.__UNIT ).normalize().multiplyScalar( random_offset );
		if ( perpendicular_U.isZero() )
			perpendicular_U = velocity.clone().crossSelf( this.__UNIT.negate() ).normalize().multiplyScalar( random_offset );
		var perpendicular_V = perpendicular_U.clone().crossSelf( velocity ).normalize().multiplyScalar( random_offset );
		velocity.addSelf( perpendicular_U );
		velocity.addSelf( perpendicular_V );
		return velocity;
	},
	
	__makeMaterial: function () {
		this.material = new THREE.ParticleBasicMaterial( { 	size: this.particle_size,
															color: 0xFFFFFF,
															map: this.texture,
															blending: THREE.AdditiveBlending,
															vertexColors: true,
															transparent: true,
															overdraw: true,
															depthWrite: false } );
	},
	
	__generateStartingVelocities : function () {
		this.starting_velocity = [];
		if ( this.angle == 0.0 ) {
			var linear = new THREE.Vector3( 0, this.force, 0 );
			for ( i = 0; i < this.particle_count; i++ )
				this.starting_velocity.push( linear.clone() );
		} else {
			for ( i = 0; i < this.particle_count; i++ ) {
				var zenith = Math.random() * this.angle * 2 - this.angle;
				var azimuth = Math.random() * Math.PI * 2;
				this.starting_velocity.push( new THREE.Vector3( this.force * Math.sin(zenith) * Math.sin(azimuth),
																this.force * Math.cos(zenith),
																this.force * Math.sin(zenith) * Math.cos(azimuth) ) );
			}
		}
	},
	
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
		
	__UNIT: new THREE.Vector3( 1, 1, 1 ).normalize()
};
