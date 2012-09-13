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
		this[p] = HIBANA._clone( HIBANA.Emitters._default_parameters[p] );
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
		this.particles.all( "die" );
	},

	age: function () {
		if ( this.paused ) return this;

		this.spawn.doAccordingToRate( this, function( that, magnitude, t ) {
			that.particles.getNext().beBorn( magnitude, t );
		});

		this.particles.age();

		this.geometry.verticesNeedUpdate = true;
		this.geometry.colorsNeedUpdate = true;
		return this;
	},

	addBehaviorModifier: function( modifier ) {
		this.behavior_mods.push( modifier );
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

    _initializeParticles: function () {
        this.particles = new HIBANA.Emitter.Particles( this.particle_count, this );
        this.geometry = new THREE.Geometry();
        this.geometry.colors = [];
        for ( var i = 0; i < this.particle_count; i++ ) {
            this.geometry.vertices.push( new THREE.Vector3().copy( this.hidden_point ) );
            this.geometry.colors.push( new THREE.Color( this.particle_color.getValue() ) );
        }
        this.geometry.dynamic = true;
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


