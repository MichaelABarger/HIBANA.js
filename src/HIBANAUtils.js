/*
HIBANAUtils.js (https://github.com/MichaelABarger/HIBANA.js/src/HIBANAUtils.js)
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

THREE.Vector3.prototype.UNIT = new THREE.Vector3( 1, 1, 1 ).normalize();
THREE.Vector3.prototype.getNormalPlane = function () {
	var P = new THREE.Vector3().cross( this, this.clone().addSelf( this.UNIT ) ).normalize();
	var Q = new THREE.Vector3().cross( P, this ).normalize();
	return new HIBANA.NormalPlane( P, Q );
};

HIBANA.NormalPlane = function ( P, Q ) {
	this.P = P;
	this.Q = Q;
	return this;
};
HIBANA.NormalPlane.prototype = {

	constructor:	HIBANA.NormalPlane,
	
	randomVector:	function ( factor ) {	
		var P = this.P;
		var Q = this.Q;
		P.multiplyScalar( Math.random() * factor - factor / 2.0 );
		Q.multiplyScalar( Math.random() * factor - factor / 2.0 );
		return new THREE.Vector3().add( P, Q );
	}
};

HIBANA.Range = function ( min, max ) {
	this.min = min;
    this.max = Math.max( min, max );
    this._recalculateRange();
	return this;
};
HIBANA.Range.prototype = {
	
	constructor:	HIBANA.Range,

	getValue: 	function () {
		return this.min + Math.random() * this.range;
	},

	setMin:		function ( min ) {
		this.min = min;
        this._recalculateRange();
		return this;
	},

	setMax: 	function ( max ) {
		this.max = Math.max( max, this.min );
        this._recalculateRange();
        return this;
	},

    _recalculateRange: function () {
        this.range = this.max - this.min;
    }
};

HIBANA.Event = function ( rate, magnitude ) {
	this.rate = rate;
    if ( magnitude instanceof HIBANA.Range )
        this.magnitude = magnitude;
    else
        this.magnitude = new HIBANA.Range( magnitude.min, magnitude.max );
	this.overflow = 0;
	this.time = new Date().getTime();
	return this;
};
HIBANA.Event.prototype = {

	constructor: HIBANA.Event,

	resetTime: function () {
		this.time = new Date().getTime();
		return this;
	},

	setRate: function ( rate ) {
		this.rate = rate;
		return this;
	},

    setMagnitude: function ( magnitude ) {
        this.magnitude = magnitude;
    },

	doAccordingToRate: function ( object, func ) {
		var current_time = new Date().getTime();
		var dt = current_time - this.time;
		var iteration_count = Math.floor( dt * this.rate + this.overflow );
        var time_per_iteration = dt / (iteration_count + 1.0);
		this.overflow = (dt * this.rate + this.overflow) - iteration_count;
		for ( var i = 0; i < iteration_count; i++ )
			func( object, this.magnitude.getValue(), current_time - time_per_iteration * i );
		this.time = current_time;
		return this;
	}
};

// JavaScript Clone code found on Keith Devens' blog, as written by him in collaboration with his readers
HIBANA._clone = function ( obj ) {
    if ( obj == null || typeof(obj) != 'object' )
        return obj;
    var temp = {};
    for ( var key in obj )
        temp[key] = HIBANA._clone( obj[key] );
    return temp;
};

