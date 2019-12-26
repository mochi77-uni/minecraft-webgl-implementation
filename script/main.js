
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
	// const gl = canvas.getContext("experimental-webgl");
	const gl = WebGLUtils.setupWebGL(canvas, null);
	// twgl.addExtensionsToContext(gl);

	const ext = gl.getExtension("WEBGL_depth_texture");
	if(!ext) {alert("Could not locate depth texture extension")}
	console.log(ext);

	const generalProgramInfo = createProgramInfo(gl, "shaders/general.vert", "shaders/general.frag");
	const shadowProgramInfo = createProgramInfo(gl, "shaders/shadow.vert", "shaders/shadow.frag");
	// console.log(generalProgramInfo, shadowProgramInfo);

	// create checkerboard texture for testing

	// const checkerboardTexture = gl.createTexture();
	// gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
	// gl.texImage2D(
	//     gl.TEXTURE_2D,
	//     0,                // mip level
	//     gl.LUMINANCE,     // internal format
	//     8,                // width
	//     8,                // height
	//     0,                // border
	//     gl.LUMINANCE,     // format
	//     gl.UNSIGNED_BYTE, // type
	//     new Uint8Array([  // data
	//         0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
	//         0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
	//         0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
	//         0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
	//         0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
	//         0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
	//         0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
	//         0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
	//     ]));
	// gl.generateMipmap(gl.TEXTURE_2D);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	const checkerboardSrc = new Uint8Array([  // data
		0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
		0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
		0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
		0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
		0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
		0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
		0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
		0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
	]);
	const checkerboardTexture = twgl.createTexture(gl, {
		target: gl.TEXTURE_2D,
		level: 0, width: 8, height: 8,
		internalFormat: gl.LUMINANCE,
		format: gl.LUMINANCE,
		type: gl.UNSIGNED_BYTE,
		src: checkerboardSrc,
		mag: gl.NEAREST
	});
	console.log("checkerboardTexture\n", checkerboardTexture);

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

	// const depthTexture = twgl.createTexture(gl, {
	//     target: gl.TEXTURE_2D,
	//     level: 0, width: depthTextureSize, height: depthTextureSize,
	//     internalFormat: gl.DEPTH_COMPONENT24,
	//     format: gl.DEPTH_COMPONENT24,
	//     type: gl.UNSIGNED_SHORT,
	//     mag: gl.NEAREST, minMag: gl.NEAREST,
	//     wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE
	// });
	//
	// console.log("depthTexture\n", depthTexture);
	//
	// // setup depth frame buffer and bind to it
	// const attachments = [{
	//     attachment: depthTexture
	// }];
	// const depthFrameBuffer = twgl.createFramebufferInfo(gl, attachments);

	// create cube buffer
	const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
	const cubeUniforms = {
		texture: checkerboardTexture,
		modeling: m4.identity(),
	};
	console.log(cubeBufferInfo);

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
		cameraPos: v3.create(3, 3, 3),
		pos: v3.create(2.5, 4.8, 4.3),
		target: v3.create(2.5, 0, 3.5),
		viewField: 120,
		projWidth: 1,
		projHeight: 1
	};

	webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
		{ type: 'slider',   key: 'cameraPos.x',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
		{ type: 'slider',   key: 'cameraPos.y',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
		{ type: 'slider',   key: 'cameraPos.z',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'pos.x',       min: -10, max: 10, change: re    nder, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'pos.y',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'pos.z',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'target.x',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'target.y',    min:   0, max: 20, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'target.z',    min: -10, max: 20, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'projWidth',  min:   0, max: 100, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'projHeight', min:   0, max: 100, change: render, precision: 2, step: 0.001, },
		// { type: 'slider',   key: 'viewField', min:  1, max: 179, change: render, },
		// { type: 'slider',   key: 'bias',       min:  -0.01, max: 0.00001, change: render, precision: 4, step: 0.0001, },
	]);


	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	render();

	function render() {
		twgl.resizeCanvasToDisplaySize(gl.canvas);

		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		/*  Draw scene to the depth frame buffer */
		const lightModelingMatrix = m4.lookAt(
			[settings.pos.x, settings.pos.y, settings.pos.z],
			[settings.target.x, settings.target.y, settings.target.z],
			[0, 1, 0]
		);
		const lightProjectionMatrix = m4.perspective(
			deg2rad(settings.viewField),
			settings.projWidth / settings.projHeight,
			0.5, 10     // near, far
		);
		twgl.bindFramebufferInfo(gl, depthFrameBuffer);
		gl.viewport(0, 0, depthTextureSize, depthTextureSize);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawScene(lightProjectionMatrix, lightModelingMatrix, m4.identity(), shadowProgramInfo);

		/*  Draw scene to the main frame buffer */
		let textureMatrix = m4.identity();
		textureMatrix = m4.translate(textureMatrix, [0.5, 0.5, 0.5]);
		textureMatrix = m4.scale(textureMatrix, [0.5, 0.5, 0.5]);
		textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
		textureMatrix = m4.multiply(textureMatrix, m4.inverse(lightModelingMatrix));
		const cameraMatrix = m4.lookAt(
			[settings.cameraPos.x, settings.cameraPos.y, settings.cameraPos.z],
			[0, 0, 0],
			[0, 1, 0]
		);
		const projectionMatrix = m4.perspective(
			deg2rad(60),
			gl.canvas.clientWidth / gl.canvas.clientHeight,
			1, 2000
		);
		twgl.bindFramebufferInfo(gl);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		drawScene(projectionMatrix, cameraMatrix, textureMatrix, generalProgramInfo);

		{
			const viewMatrix = m4.inverse(cameraMatrix);

			gl.useProgram(shadowProgramInfo.program);
			twgl.setBuffersAndAttributes(gl, shadowProgramInfo, cubeLinesBufferInfo);

			const mat = m4.multiply(lightModelingMatrix, m4.inverse(lightProjectionMatrix));

			twgl.setUniforms(shadowProgramInfo, {
				viewing: viewMatrix,
				projection: projectionMatrix,
				modeling: mat,
			});

			twgl.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
		}``
	}

	function drawScene(projectionMatrix, cameraMatrix, textureMatrix, programInfo) {
		const viewingMatrix = m4.inverse(cameraMatrix);
		gl.useProgram(programInfo.program);

        twgl.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);
		twgl.setUniforms(programInfo, {
			viewing: viewingMatrix,
			projection: projectionMatrix,
			textureMatrix: textureMatrix,
			projectedTexture: depthTexture
		});
		twgl.setUniforms(programInfo, cubeUniforms);
		twgl.drawBufferInfo(gl, cubeBufferInfo);
	}
};