HIBANA.js
=========

#### 3D particle engine extension for Three.js ####

HIBANA.js is an open-source Javascript library extension that extends the popular WebGL 3D library Three.js with a flexible and powerful particle engine. 

HIBANA means "spark" in Japanese: the creation of HIBANA.js was inspired by a predecessor library called Jerome Etienne's Sparks.js particle engine.

Goals include: creating a clean, programmer-friendly interface, like that of Three.js; flexibility to be used in the majority of common applications without much fuss; particle physics, including global forces, force fields, random variance, and collision; and custom, FBO-driven full hardware acceleration for all physics.

### LICENSE ###

Please see our Open Source [MIT License](https://https://github.com/MichaelABarger/HIBANA.js/blob/master/LICENSE). Please read it carefully before you use, modify, or reproduce this open-source code in any way.

### DEMO ###
An example can be seen [here](https://michaelabarger.github.com/examples/HIBANA-test.html).


### USAGE ###

Please note that the project is still in development, and the API interface is subject to change at any time until further notice. However, the following does apply to the current build.

#### Include HIBANA.js in your HTML file ####

Download [HIBANA.js](https://https://github.com/MichaelABarger/HIBANA.js/blob/master/build/HIBANA-min.js) (and [Three.js](https://github.com/mrdoob/three.js/blob/master/build/Three.js) if you don't already have it) and make sure that both script files are included in the head of your HTML page:

	<script type="text/javascript" src="script/Three.js"></script>
	<script type="text/javascript" src="script/HIBANA-min.js"></script>

#### Create a HIBANA instance in your Three.js script ####

All you need to do to add `HIBANA` to your Three.js scene is to create a `HIBANA` object with the following declaration:

	var hibana = new HIBANA( scene );

and if you want to add options parameters:

	var hibana = new HIBANA( scene, { parameters } );

where `{ parameters }` is a bracketed list of any of the following options:

- `hidden_point: ` THREE.Vector3 object that is where inactive particles will go; choose a point that won't be visible! The default is `(-1000, -1000, -1000)`.
- `paused: ` Whether or not HIBANA will start off in a paused state (regarding particle play-back). The default is `true`!
- `particle_size: ` Initial size of each particle. The default is `4.0`.
- `texture: ` Any THREE.Texture that you might want to use instead of the default HTML5 canvas-generated one.
- `global_force: ` Initial global force for the HIBANA system. Normally, this would be used to simulate gravity. Thus, the default is `(0, -0.05, 0)`.

#### Add emitters to the HIBANA object ####

After creating a `HIBANA` object, add emitters to it by calling the `addEmitter` method:

	hibana.addEmitter( object, { parameters } );
	
Where `object` is any THREE.Object3D and `{ parameters }` is a bracketed list of the following options:

- `particle_count: ` Total number of particles that will be allocated for this emitter. They won't necessarily all be showing all the time! The default is 300; you might want to lower this if there are performance issues, or raise it if you are using a fast emitter rate.
- `particle_color: ` The THREE.Color that will be used to tint your texture! The default is pure white.
- `rate: ` Emitter rate on a scale of 0 to 100. The default is 75.
- `particle_life_expectancy_min: ` Minimum amount of frames that a particle will remain alive. The default is 10.
- `particle_life_expectancy_range: ` Maximum amount of frames that a particle might live *after* meeting the minimum life expectancy. The default is 25.
- `emission_angle: ` Angle in radians (from 0 to PI) from vertical that the emitter will emit particles. 0 represents straight up; PI represents a spherical dispersal; anything until PI/2 is more or less conical. The default is 0: straight up.
- `emission_force: ` Amount of force with which particles will be emitted from the emitter. The default is 1.
- `jitter_factor: ` Factor by which particles will randomly move on a perpendicular plane to their path. The default is 0, or no jitter.

#### Controlling the HIBANA system ####

Controlling a HIBANA system after it has been initialized and the emitters have been added is simple: you can toggle pause/play on the particle animations, or change the system/emitter properties at any time.

- `pause()`, `play()`, and `togglePause()` control whether the status of the particle-system animations.
- `set` and `get` methods for all of the above-listed HIBANA system and emitter options. After the `set` or `get` prefix, the option name follows in Camel Case.   
For example, the setter method for the system's `particle_size` property is `setParticleSize( new_size )`, and its getter is `getParticleSize()`. 
Currently, setting one of the emitter properties will set that property to all emitters in the current HIBANA system, for ease of use.