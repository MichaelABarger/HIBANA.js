/*
Range.js (https://github.com/MichaelABarger/HIBANA.js/src/Range.js)
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

