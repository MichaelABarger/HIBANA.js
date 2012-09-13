
/*
Particles.js (https://github.com/MichaelABarger/HIBANA.js/src/Particles.js)
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

HIBANA.Emitter.Particles = function ( particle_count, emitter ) {
	this.ref = [];
	this.particle_count = particle_count;
	for ( var i = 0; i < particle_count; i++ )
		this.ref.push( new HIBANA.Particle( {
			vertex: emitter.geometry.vertices[v],
			color:  emitter.geometry.colors[v],
			hidden_point: emitter.hidden_point,
			geo: emitter.bound_geometry,
			parent: emitter
		}));
};
HIBANA.Emitter.Particles.prototype = {

	constructor: HIBANA.Emitter.Particles,

	ref: [],

	next_particle: 0,

	all: function ( method_name, arg ) {
		for ( p in this.ref )
			this.ref[p][method_name]( arg );
	},

	age: function () {
		var current_time = new Date().getTime();
		for ( p in this.ref )
			this.ref[p].age( current_time );
	},

	getNext: function () {
		var result = this.ref[ this.next_particle ];
		if ( ++this.next_particle >= this.particle_count )
			this.next_particle = 0;
		return result;
	}
};
