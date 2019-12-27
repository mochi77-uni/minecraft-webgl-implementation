
"use strict";

function deg2rad(d) {
	return d * Math.PI / 180;
}

function createProgramInfo(gl, vShaderSrc, fShaderSrc) {
	const program = initShaders(gl, vShaderSrc, fShaderSrc);
	return {
		program: program,
		uniformSetters: twgl.createUniformSetters(gl, program),
		attribSetters: twgl.createAttributeSetters(gl, program)
	};
}

window.onload = function init() {
	const v3 = twgl.v3;
	const m4 = twgl.m4;

	const canvas = document.getElementById("gl-canvas");
	const gl = WebGLUtils.setupWebGL(canvas, null);

	const ext = gl.getExtension("WEBGL_depth_texture");
	if(!ext) {alert("Could not locate depth texture extension")}
	console.log(ext);

	twgl.setDefaults({attribPrefix:'a_'});

	const generalProgramInfo = createProgramInfo(gl, "shaders/general.vert", "shaders/general.frag");
	const shadowProgramInfo = createProgramInfo(gl, "shaders/shadow.vert", "shaders/shadow.frag");
	console.log(generalProgramInfo, shadowProgramInfo);

	// create depth texture for shadow
	const depthTextureSize = 512;
	const depthTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texImage2D(
		gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,    // type
		null                // data
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	const depthFrameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFrameBuffer);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,       // target
		gl.DEPTH_ATTACHMENT,  // attachment point
		gl.TEXTURE_2D,        // texture target
		depthTexture,         // texture
		0                // mip level
	);

	// create checkerboard texture for testing
	const checkerboardTexture = twgl.createTexture(gl, {
		min: gl.NEAREST,
		mag: gl.NEAREST,
		src: [
			255, 255, 255, 255,
			192, 192, 192, 255,
			192, 192, 192, 255,
			255, 255, 255, 255,
		],
	});
	console.log("checkerboardTexture\n", checkerboardTexture);

	const blockTextures = twgl.createTextures(gl, {
		grass: {
			target: gl.TEXTURE_CUBE_MAP,
			src: [
				"img/texture/grass_block_side.png",
				"img/texture/grass_block_side.png",
				"img/texture/grass_block_top.png",
				"img/texture/dirt.png",
				"img/texture/grass_block_side.png",
				"img/texture/grass_block_side.png",
			]
		},
		bricks: { src: "img/texture/bricks.png" },
		dirt: { src: "img/texture/dirt.png" },
		birch_planks: { src: "img/texture/birch_planks.png"}
	});
	// const blockTextures = getBlockTextures(gl);
	const bumpTextures = twgl.createTextures(gl, {
		bricks: { src: "img/texture_n/bricks_n.png" },
		dirt: { src: "img/texture_n/dirt_n.png" },
		birch_planks: { src: "img/texture_n/birch_planks_n.png"}
	});
	console.log(blockTextures);

	// create cube buffer
	const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1, 50, 50);
	const cubeUniforms = {
		texture: blockTextures.bricks,
		bumpTexture: bumpTextures.bricks,
		modelMatrix: m4.identity()
	};
	const cube2Uniforms = {
		texture: blockTextures.dirt,
		bumpTexture: bumpTextures.dirt,
		modelMatrix: m4.translate(m4.identity(), [1, -1, 0])
	};

	const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 10, 10);
	const planeUniforms = {
		texture: blockTextures.birch_planks,
		modelMatrix: m4.translate(m4.identity(), [0, -1.5, 0])
	};

	const cubeLinesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
		position: [
			-1, -1, -1,
			1, -1, -1,
			-1,  1, -1,
			1,  1, -1,
			-1, -1,  1,
			1, -1,  1,
			-1,  1,  1,
			1,  1,  1,
		],
		indices: [
			0, 1,
			1, 3,
			3, 2,
			2, 0,

			4, 5,
			5, 7,
			7, 6,
			6, 4,

			0, 4,
			1, 5,
			3, 7,
			2, 6,
		],
	});

	const settings = {
		cameraPos: [2.5, 1.0, -1.0],
		cameraTarget: [0, 0, 0],
		lightPos: [0.0, 3.5, 0.0],
		lightTarget: [0, 0, 0],
		viewField: 30,
		projWidth: 16,
		projHeight: 16,
		bias: -0.035
	};

	webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
		{ type: 'slider',key: 'bias', min:  -0.1, max: 0.0001, precision: 4, step: 0.0001 },
		{ type: 'slider',key: 'viewField', min:  0, max: 90, precision: 4, step: 0.0001 },
		{ type: 'slider',key: 'projWidth', min:  0, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: 'projHeight', min:  0, max: 10, precision: 4, step: 0.0001 },
	]);

	webglLessonsUI.setupUI(document.querySelector('#ui'), settings.cameraPos, [
		{ type: 'slider',key: '0', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '1', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '2', min:  -10, max: 10, precision: 4, step: 0.0001 },
	]);

	webglLessonsUI.setupUI(document.querySelector('#ui'), settings.cameraTarget, [
		{ type: 'slider',key: '0', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '1', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '2', min:  -10, max: 10, precision: 4, step: 0.0001 },
	]);

	webglLessonsUI.setupUI(document.querySelector('#ui'), settings.lightPos, [
		{ type: 'slider',key: '0', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '1', min:  -10, max: 10, precision: 4, step: 0.0001 },
		{ type: 'slider',key: '2', min:  -10, max: 10, precision: 4, step: 0.0001 },
	]);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	render();

	function render() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);

		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		/*  Draw scene to the depth frame buffer */
		const lightModelMatrix = m4.lookAt(
			settings.lightPos,
			settings.lightTarget,
			[0, 1, 0]
		);
		// const lightProjMatrix = m4.perspective(
		// 	deg2rad(settings.viewField),
		// 	settings.projWidth / settings.projHeight,
		// 	0.5, 10     // near, far
		// );
		const lightProjMatrix = m4.ortho(
			-settings.projWidth / 2,
			 settings.projWidth / 2,
			-settings.projHeight / 2,
			 settings.projHeight / 2,
			0.5, 10
		);
		gl.bindFramebuffer(gl.FRAMEBUFFER, depthFrameBuffer);
		gl.viewport(0, 0, depthTextureSize, depthTextureSize);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawScene(lightProjMatrix, lightModelMatrix, m4.identity(), lightModelMatrix, shadowProgramInfo);

		/*  Draw scene to the main frame buffer */
		let textureMatrix = m4.identity();
		textureMatrix = m4.translate(textureMatrix, [0.5, 0.5, 0.5]);
		textureMatrix = m4.scale(textureMatrix, [0.5, 0.5, 0.5]);
		textureMatrix = m4.multiply(textureMatrix, lightProjMatrix);
		textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightModelMatrix));
		const cameraModelMatrix = m4.lookAt(
			settings.cameraPos,
			settings.cameraTarget,
			[0, 1, 0]
		);
		const cameraProjMatrix = m4.perspective(
			deg2rad(60),
			gl.canvas.clientWidth / gl.canvas.clientHeight,
			1, 200
		);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawScene(cameraProjMatrix, cameraModelMatrix, textureMatrix, lightModelMatrix, generalProgramInfo);

		{
			const viewMatrix = m4.inverse(cameraModelMatrix);

			gl.useProgram(shadowProgramInfo.program);
			twgl.setBuffersAndAttributes(gl, shadowProgramInfo, cubeLinesBufferInfo);

			const mat = m4.multiply(lightModelMatrix, m4.inverse(lightProjMatrix));

			twgl.setUniforms(shadowProgramInfo, {
				viewMatrix: viewMatrix,
				projMatrix: cameraProjMatrix,
				modelMatrix: mat,
			});

			twgl.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
		}
		requestAnimationFrame(render);
	}

	function drawScene(projMatrix, cameraMatrix, textureMatrix, lightModelMatrix, programInfo) {
		const viewMatrix = m4.inverse(cameraMatrix);
		gl.useProgram(programInfo.program);

		twgl.setUniforms(programInfo, {
			viewMatrix: viewMatrix,
			projMatrix: projMatrix,
			texMatrix: textureMatrix,
			projectedTexture: depthTexture,
			lightPos: settings.lightPos,
			bias: settings.bias
		});

        twgl.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);
		twgl.setUniforms(programInfo, cubeUniforms);
		twgl.drawBufferInfo(gl, cubeBufferInfo);

		twgl.setUniforms(programInfo, cube2Uniforms);
		twgl.drawBufferInfo(gl, cubeBufferInfo);

		twgl.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
		twgl.setUniforms(programInfo, planeUniforms);
		twgl.drawBufferInfo(gl, planeBufferInfo);
	}
};