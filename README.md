HIBANA.js
=========

#### 3D particle engine extension for Three.js ####
HIBANA.js is an open-source Javascript library extension that extends the popular WebGL 3D library Three.js with a flexible and powerful particle engine. 

HIBANA means "spark" in Japanese: the creation of HIBANA.js was inspired by a predecessor Three.js particle engine extension library called Sparks.js by Jerome Etienne.

Goals include: creating a clean, programmer-friendly interface, like that of Three.js; flexibility to be used in the majority of common applications without much fuss; particle physics, including global forces, force fields, random variance, and collision; and custom, FBO-driven full hardware acceleration for all physics.

#### What is it that makes HIBANA.js special? ####
HIBANA.js allows you to set up your particle emitters by attaching them to the existing THREE.Object3D architecture.   
Do you want your particle emissions to begin in the shape of a sphere? Or a cube? Just add an emitter to any Three.js Object3D that you've created, and the particles generate based on its shape.  
Want to move and transform your emitter? Just move and transform the object you've attached it to, using an API you're already familiar with.
In this way, HIBANA.js strives to streamline the ease the integration of particle systems in any Three.js architecture.

### LICENSE ###
All files in this repository are copyright Michael A. Barger, 2012. Please read the project's Open Source [MIT License](https://github.com/MichaelABarger/HIBANA.js/blob/master/LICENSE) carefully before you use, modify, or reproduce this open-source code in any way.

### DEMO ###
An example can be seen [here](http://michaelabarger.github.com/examples/HIBANA-test.html).


### USAGE ###
Please note that the project is still in active development, and the API interface is subject to change at any time until further notice. However, the following does apply to the current build.

#### Include HIBANA.js in your HTML file ####
Download [HIBANA.js](https://https://github.com/MichaelABarger/HIBANA.js/blob/master/build/HIBANA-min.js) (and [Three.js](https://github.com/mrdoob/three.js/blob/master/build/Three.js) if you don't already have it) and make sure that both script files are included in the head of your HTML page; it's important to remember that the script definition in your page for Three.js *precedes* that for HIBANA-min.js, further, the definition for HIBANA-min.js *precedes* that of your page's 3D script.

	<script type="text/javascript" src="script/Three.js"></script>
	<script type="text/javascript" src="script/HIBANA-min.js"></script>

Now you will have the HIBANA namespace along with the THREE namespace availble for your 3D JavaScript code!

#### Add emitters to the HIBANA object ####
You can create particle emitters simply by calling the `addEmitter` method:

	HIBANA.emitters.add( object, { parameters } );
	
Where `object` is any THREE.Object3D and `{ parameters }` is a bracketed list of the following optional parameters:

- `particle_count: ` Total number of particles that will be allocated for this emitter. They won't necessarily all be showing all the time! The default is 400; you might want to lower this if there are performance issues, or raise it if you are using a fast emitter rate.
- `particle_color: ` The THREE.Color that will be used to tint your texture! The default is pure white.
- `rate: ` Emitter rate on a scale of 0 to 100. The default is 75.
- `particle_life_expectancy_min: ` Minimum amount of frames that a particle will remain alive. The default is 10.
- `particle_life_expectancy_range: ` Maximum amount of frames that a particle might live *after* meeting the minimum life expectancy. The default is 25.
- `emission_angle: ` Angle in radians (from 0 to PI) from vertical that the emitter will emit particles. 0 represents straight up; PI represents a spherical dispersal; anything until PI/2 is more or less conical. The default is 0: straight up.
- `emission_force: ` Amount of force with which particles will be emitted from the emitter. The default is 1.
- `jitter_factor: ` Factor by which particles will randomly move on a perpendicular plane to their path. The default is 0, or no jitter.
- `hidden_point: ` THREE.Vector3 object that is where inactive particles will go; choose a point that won't be visible! The default is `(-1000, -1000, -1000)`.
- `paused: ` Whether or not your Emitter will start off in a paused state (regarding particle play-back). The default is `true`!
- `particle_size: ` Initial size of each particle. The default is `4.0`.
- `texture: ` Any THREE.Texture that you might want to use instead of the default HTML5 canvas-generated one.

If all of the Emitters that you will be creating will have similar properties, you can change the default values of these initialization parameters at any time by calling `HIBANA.emitters.setDefaultParameters( { parameters } )`.

Your call to `HIBANA.emitters.add` will return a reference back to the HIBANA.Emitter you just created. Feel free to store it in a variable to access its methods, described below.

At the simplest, you can create an attractive default Emitter, simply by making the following statement:

	HIBANA.emitters.add( object );

#### Age HIBANA in your rendering function ####
After adding Emitters, the only other thing you need do in order to use HIBANA is make the following call in your rendering function:

	HIBANA.age();

That's it!

#### Controlling your HIBANA emitters ####
HIBANA.Emitters offer the following methods; you can call them either through the reference you save as a result of the call to `HIBANA.emitters.add`, or alternatively, you can make the call to all Emitters in the system at once, as described in the next subsection.
- `pause()`, `play()`, and `togglePause()` control whether the animations for your Emitter are playing. 
- `clear()` allows you to reset the Emitter to its starting state, erasing all of its active particles.
- `set` and `get` methods for the following Emitter options:
- `setParticleRate(rate)` and `getParticleRate()`
- `setParticleLifetimeMin(min)` and `getParticleLifetimeMin()`
- `setParticleLifetimeRange(min)` and `getParticleLifetimeRange()`
- `setAngle(angle)` and `getAngle()`
- `setForce(force)` and `getForce()`
- `setJitter(jitter)` and `getJitter()`
- `setHiddenPoint(point)` and `getHiddenPoint()`
- `setParticleSize(size)` and `getParticleSize()`
- `setTexture(texture)` and `getTexture()`

##### Controlling all HIBANA Emitters at once #####
Through a simple call to `HIBANA.emitters.all`, you can control all of the HIBANA system's Emitters at once! Just include the name of the method that you wish to invoke as a string literal; if the method takes a parameter, then add a comma followed by that parameter. For example:

	HIBANA.emitters.all( "clear" );

or, with parameters:

	HIBANA.emitters.all( "setParticleRate", 80 );

#### Controlling forces in your HIBANA system ####
Currently, HIBANA offers support for a global force (such as *gravity*), and defaults to a force of `(0, -0.05, 0)`. You can make changes to this force by calling the following methods on HIBANA.global:
- `set(force)` and `get()` to set and get the global force.
- `activate()`, `deactivate()`, and `toggle()` to control whether the force currently applies to the active particles.

#### Summary ####
That's it! Again, in order to use a HIBANA particle system in your 3D Three.js project, all you need to do is:
- make an Emitter to any Three.js object:

	HIBANA.emitters.add( object );

- age the system in your rendering loop:

	HIBANA.age();

Yes, that's really it!
	
