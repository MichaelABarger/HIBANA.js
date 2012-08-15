// HIBANA.js
// (Particle engine for THREE.js)
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

var HIBANA = {

	emitters: [],

	global_force: new THREE.Vector3( 0.0, -0.05, 0.0 ),

	global_force_is_active: false,
	
	// thanks to Alteredq for inspiration on particle shader code!
	// I'm not currently using these, but they are stored here for future reference
	// ///////////////////////////////////////
	vertex_shader:
		"uniform float amplitude;" +
		"attribute float size;" +
		"attribute vec3 custom_color;" +
		"varying vec3 vColor" +
		"void main() {" +
			"vertex_color = custom_color;" +
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );" +
			"gl_PointSize = size * (300.0 / length( mvPosition.xyz ));" +
			"gl_Position = projectionMatrix * mvPosition;" +
		"}",

	fragment_shader:
		"uniform vec3 color;" +
		"uniform sampler2D texture;" +
		"varying vec3 vertex_color;" +
		"void main() {" +
			"gl_FragColor = vec4( color * vColor, 1.0 );" +
			"gl_FragColor *= texture2D( texture, gl_PointCoord );" +
		"}",

	attributes:  {
		size: 			{ type: 'f', value: [] },
		custom_color:	{ type: 'c', value: [] }
	},

	uniforms: {
		amplitude:		{ type: 'f', value: 1.0 },
		color:			{ type: 'c', value: new THREE.Color( 0xFFFFFF ) },
		texture:		{ type: 't', value: 0, texture: this.texture }
	},

	setGlobalForce: function ( global_force ) {
		this.global_force = global_force;
		return this;
	},

	getGlobalForce: function () {
		return this.global_force;
	},

	enableGlobalForce: function() {
		this.global_force_is_active = true;
	},

	disableGlobalForce: function() {
		this.global_force_is_active = false;
	},

	toggleGlobalForce: function() {
		this.global_force_is_active = !this.global_force_is_active;
	},

	allEmitters: function( method_name ) {
		var result = [];

		for ( e in this.emitters )
			result.push( this.emitters[e][method_name]() );

		return result;
	},

	addEmitter: function( object, parameters ) {
		var new_emitter = new HIBANA.Emitter( object, parameters ); 
		this.emitters.push( new_emitter );
		return new_emitter;
	}
};
