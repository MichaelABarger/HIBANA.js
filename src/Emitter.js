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
    var p;

    if ( object instanceof THREE.Mesh )
        this.bound_geometry = object.geometry;
    else if ( object instanceof THREE.Geometry )
        this.bound_geometry = object;
    else if ( object instanceof THREE.Face3 || object instanceof THREE.Face4 )
        this.bound_face = object;

    parameters = parameters || {};
	for ( p in HIBANA.Emitters._defaultParameters )
		this[p] = HIBANA.Emitters._defaultParameters[p];
	for ( p in parameters )
		this[p] = HIBANA._clone(parameters[p]);
    this.spawn = HIBANA._clone( this.spawn );

    this._makeMaterial();
    this._initializeParticles();

    this.position = object.position;

	this.system = new THREE.ParticleSystem( this.geometry, this.material );
	this.system.position = new THREE.Vector3( 0, 0, 0 );
	this.system.sortParticles = true;
	object.parent.add( this.system );

	return this;
};


HIBANA.Emitter.prototype = {

	constructor: HIBANA.Emitter,

	clear: function() {
        for ( var p in this.particles )
            this.particles[p].die();
	},

	age: function () {
		if ( this.paused ) return this;

	    this.spawn.doAccordingToRate( this, function( that, magnitude, t ) {

            that.particles[that.next_particle].beBorn( magnitude, t );

            if ( ++that.next_particle >= that.particle_count )
                that.next_particle = 0;
        });

        var current_time = new Date().getTime();
        for ( var p in this.particles )
            this.particles[p].age( current_time );

		this.geometry.verticesNeedUpdate = true;
		this.geometry.colorsNeedUpdate = true;
		return this;
	},

    addBehaviorModifier: function( modifier ) {
        this.behavior_mods.push( modifier );
    },

    allParticles: function( method_name, arg ) {
        for ( p in this.particles )
		    this.particles[p][method_name]( arg );
    },

	pause: function () { this.paused = true; return this; },
	play: function () { 
		this.paused = false;
        this.spawn.resetTime();
        var current_time = new Date().getTime();
        this.allParticles( "resetTime", current_time );
		return this;
       	},
	togglePause: function() {
		this.paused = !this.paused;
        this.spawn.resetTime();
        var current_time = new Date().getTime();
        this.allParticles( "resetTime", current_time );
		return this;
	},
//
//	setParticleColor: function ( particle_color ) {
//		this.particle_color = particle_color;
//		this._makeMaterial();
//		this.system.material = this.material;
//		return this;
//	},
//	setParticleTexture: function ( texture ) {
//		this.texture = texture;
//		this._makeMaterial();
//		this.system.material = this.material;
//		return this;
//	},
//	setParticleSize: function ( particle_size ) {
//		this.particle_size = particle_size;
//		this._makeMaterial();
//		this.system.material = this.material;
//		return this;
//	},
//	setParticleLifetimeMin: function ( min ) { this.particle_life_min = min * 1000; return this; },
//	setParticleLifetimeRange: function ( range ) { this.particle_life_range = range * 1000; return this; },
//
//	setRate: function ( particles_per_second ) {
//		this.rate = particles_per_second / 1000.0;
//		return this;
//       	},
//	setAngle: function ( angle ) {
//		this.angle = angle;
//		this._generateInitialVelocities();
//		return this;
//	},
//	setForceMin: function ( feet_per_second ) {
//		this.force_min = feet_per_second / 1000.0;
//		this._generateInitialVelocities();
//		return this;
//	},
//	setForceRange: function ( feet_per_second ) {
//		this.force_range = feet_per_second / 1000.0;
//		this._generateInitialVelocities();
//		return this;
//	},

    _initializeParticles: function () {
        this.particles = [];
        this.next_particle = 0;
        this.geometry = new THREE.Geometry();
        this.geometry.colors = [];
        for ( var i = 0; i < this.particle_count; i++ ) {
            this.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
            this.geometry.colors.push( new THREE.Color( this.particle_color.getValue() ) );
        }
        this.geometry.dynamic = true;
        for ( var v in this.geometry.vertices )  {
            this.particles.push( new HIBANA.Particle( {
                vertex: this.geometry.vertices[v],
                color:  this.geometry.colors[v],
                hidden_point: this.hidden_point,
                geo: this.bound_geometry,
                parent: this
            }));
        }
    },

    _getBirthPosition: function () {
        var face = this.bound_face || this.bound_geometry.faces[
                        Math.round((this.bound_geometry.faces.length - 1) * Math.random())];
        var result = THREE.GeometryUtils.randomPointInFace( face, this.bound_geometry, false );
        return result.addSelf( this.position );
    },

    _getForce: function () {
        if ( this.angle == 0.0 )
            return new THREE.Vector3( 0, 1, 0 );
        else {
            var zenith = Math.random() * this.angle * 2 - this.angle;
            var azimuth = Math.random() * Math.PI * 2;
            return new THREE.Vector3( Math.sin(zenith) * Math.sin(azimuth),
                                      Math.cos(zenith),
                                      Math.sin(zenith) * Math.cos(azimuth) );
        }
    },

    _getLifespan: function () {
        return this.particle_life.getValue();
    },

	_makeMaterial: function () {
		this.material = new THREE.ParticleBasicMaterial( {
           size: this.particle_size.getValue(),
           color: 0xFFFFFF,
           map: this.texture,
           blending: THREE.AdditiveBlending,
           vertexColors: true,
           transparent: true,
           overdraw: true,
           depthWrite: false } );
	}
};

HIBANA.Emitters._defaultParameters = {
        paused: true,
        particle_count:	2000,
        spawn:			new HIBANA.Event( 0.75, new HIBANA.Range(.05, .4)),
        behavior_mods:  [],
        particle_life:	new HIBANA.Range( 250, 250 ),
        angle:			0.0,
        hidden_point:	new THREE.Vector3( -1000, -1000, -1000 ),
        particle_size:	new HIBANA.Range( 2.0, 0.0 ),
        particle_color:	new HIBANA.Range( 0x0000FF, 0xFF0000 ),
        texture: 		(function () {
            var canvas = document.createElement( 'canvas' );
            canvas.width = 50;
            canvas.height = 50;

            var context = canvas.getContext( '2d' );
            var gradient = context.createRadialGradient( canvas.width / 2,
                canvas.height / 2, 0, canvas.width / 2,
                canvas.height / 2, canvas.width / 2 );
            gradient.addColorStop( 0, 'rgba(255,255,255,1.0)' );
            gradient.addColorStop( 0.15, 'rgba(255,255,255,.9)' );
            gradient.addColorStop( 0.3, 'rgba(255,255,255,.6)' );
            gradient.addColorStop( 0.5, 'rgba(255,255,255,.3)' );
            gradient.addColorStop( 0.7, 'rgba(255,255,255,.1)' );
            gradient.addColorStop( 1, 'rgba(0,0,0,0)' );

            context.fillStyle = gradient;
            context.fillRect( 0, 0, canvas.width, canvas.height );

            var texture = new THREE.Texture( canvas );
            texture.needsUpdate = true;

            return texture;
        }())
};

