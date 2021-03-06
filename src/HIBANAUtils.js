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

// JavaScript Clone code found on Keith Devens' blog, as written by him in collaboration with his readers
HIBANA._clone = function ( obj ) {
    if ( obj == null || typeof(obj) != 'object' )
        return obj;
    var temp = {};
    for ( var key in obj )
        temp[key] = HIBANA._clone( obj[key] );
    return temp;
};

