/*
HIBANA.js (https://github.com/MichaelABarger/HIBANA.js/src/HIBANA.js)
Part of the HIBANA.js open-source project, a WebGL particle engine for Three.js

@author Michael A Barger (mikebarger@gmail.com)

The MIT License

Copyright (c) 2012 HIBANA.js authors.

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

	age: function () { HIBANA.Emitters.all( "age" ); },
	
	Emitters: { 

		ref: [],

		all: function ( method_name, arg ) {
			for ( e in HIBANA.Emitters.ref )
				HIBANA.Emitters.ref[e][method_name]( arg );
		},
		
		add: function ( object, parameters ) {
			var new_emitter = new HIBANA.Emitter( object, parameters );
			HIBANA.Emitters.ref.push( new_emitter );
			return new_emitter;
		},
		
		setDefaultParameters: function ( parameters ) {
			for ( p in parameters )
				HIBANA.Emitters._default_parameters[p] = HIBANA._clone( parameters[p] );
		},

		_default_parameters: {
			paused: true,
			spawn:	new HIBANA.Event( 0.75, new HIBANA.Range(.05, .4)),
			behavior_mods:  [], 
			angle:	0.0,
			hidden_point:	new THREE.Vector3( -1000, -1000, -1000 )
		}
	},
		
		
	Universal:	{

		acceleration: new THREE.Vector3( 0.0, -0.000985, 0.0 ),
		
		is_active: false,
		
		set: function( acceleration ) { HIBANA.Universal.acceleration = acceleration; },

		add: function( acceleration ) { HIBANA.Universal.acceleration.addSelf( acceleration ); },

		remove: function( acceleration ) { HIBANA.Universal.acceleration.subSelf( acceleration ); },
		
		activate: function() { HIBANA.Universal.is_active = true; },
		
		deactivate: function() { HIBANA.Universal.is_active = false; },
		
		toggle: function() { HIBANA.Universal.is_active = !HIBANA.Universal.is_active; }
	}
};
