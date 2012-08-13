HIBANA.js
=========

#### 3D particle engine extension for Three.js ####

HIBANA.js is an open-source Javascript library extension that extends the popular WebGL 3D library Three.js with a flexible and powerful particle engine. 

HIBANA means "spark" in Japanese: the creation of HIBANA.js was inspired by a predecessor library called Jerome Etienne's Sparks.js particle engine.

Goals include: creating a clean, programmer-friendly interface, like that of Three.js; flexibility to be used in the majority of common applications without much fuss; particle physics, including global forces, force fields, random variance, and collision; and custom, FBO-driven full hardware acceleration for all physics.

### LICENSE ###

Please see our [MIT License](https://https://github.com/MichaelABarger/HIBANA.js/blob/master/LICENSE)

### USAGE ###

#### Include HIBANA.js in your HTML file ####

Download [HIBANA.js](https://https://github.com/MichaelABarger/HIBANA.js/blob/master/build/HIBANA-min.js) (and [Three.js](https://github.com/mrdoob/three.js/blob/master/build/Three.js) if you don't already have it) and make sure that both script files are included in the head of your HTML page:

	<script type="text/javascript" src="script/Three.js"></script>
	<script type="text/javascript" src="script/HIBANA-min.js"></script>

#### Create a HIBANA instance in your Three.js script ####

All you need to do to add HIBANA to your Three.js scene is to create a HIBANA object with the following declaration:

	var hibana = new HIBANA( scene );

and if you want to add options parameters:

	var hibana = new HIBANA( scene, { parameters } );

where { parameters } is a list of any of the following:

