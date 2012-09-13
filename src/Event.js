/*
Event.js (https://github.com/MichaelABarger/HIBANA.js/src/Event.js)
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

