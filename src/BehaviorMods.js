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

HIBANA.Jitter = function( rate, magnitude_range ) {
    this.rate = rate;
    this.magnitude_range = magnitude_range;
    this.overflow = 0;
    this.time = new Date().getTime();
    return this;
};
HIBANA.Jitter.prototype = Object.create( HIBANA.Event );

HIBANA.Jitter.prototype.constructor = HIBANA.Jitter;

HIBANA.Jitter.prototype.doModification = function ( particle ) {
    this.doAccordingToRate( particle, function ( particle, magnitude ) {
        particle.vertex.addSelf( particle.velocity.getNormalPlane().randomVector( magnitude ) );
    });
};



HIBANA.Random = function( rate, magnitude_range ) {
    this.rate = rate;
    this.magnitude_range = magnitude_range;
    this.overflow = 0;
    this.time = new Date().getTime();
    return this;
};
HIBANA.Random.prototype = Object.create( HIBANA.Event );

HIBANA.Random.prototype.constructor = HIBANA.Random;

HIBANA.Random.prototype.doModification = function ( particle ) {
    this.doAccordingToRate( particle, function ( particle, magnitude ) {
        particle.velocity.addSelf( particle.velocity.getNormalPlane().randomVector( magnitude ) );
    });
};



HIBANA.Waviness = function( rate, magnitude_range ) {
    this.rate = rate;
    this.magnitude_range = magnitude_range;
    this.overflow = 0;
    this.time = new Date().getTime();
    return this;
};
HIBANA.Waviness.prototype = Object.create( HIBANA.Event );

HIBANA.Waviness.prototype.constructor = HIBANA.Waviness;

HIBANA.Random.prototype.doModification = function ( particle ) {
    this.doAccordingToRate( particle, function ( particle, magnitude ) {
        particle.velocity.addSelf( particle.velocity.getNormalPlane().randomVector( magnitude ) );
    });
};

