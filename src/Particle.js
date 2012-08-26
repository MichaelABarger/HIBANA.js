/*
Particle.js (https://github.com/MichaelABarger/HIBANA.js/src/Particle.js)
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

HIBANA.Particle = function ( parameters ) {
    parameters = parameters || {};
    for ( p in parameters )
        this[p] = parameters[p];
    this.dead = true;
};

HIBANA.Particle.prototype = {

	constructor: HIBANA.Particle,

    beBorn: function ( magnitude, current_time ) {
        this.vertex.copy( this.parent._getBirthPosition() );
        this.velocity = this.parent._getForce().multiplyScalar( magnitude );
        this.life = this.parent._getLifespan();
        this.last_time = current_time;
        this.dead = false;
    },

	age: function ( current_time ) {

        if ( this.dead )
            return;

        var dt = current_time - this.last_time;
        this.life -= dt;
        if ( this.life <= 0 ) {
            this.die();
        } else {
            for ( m in this.behavior_mods )
                this.behavior_mods[m].doModification( this );
            if ( HIBANA.Universal.is_active )
                this.velocity.addSelf( HIBANA.Universal.acceleration.clone().multiplyScalar(dt) );
            this.vertex.addSelf( this.velocity );
        }
        this.last_time = current_time;
	},

    resetTime: function ( current_time ) {
        this.last_time = current_time;
    },

	die: function () {
        this.dead = true;
		this.vertex.copy( this.hidden_point );
		this.color.copy( this.color );
	}
};
