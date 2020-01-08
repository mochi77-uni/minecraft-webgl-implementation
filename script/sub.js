
"use strict";

function initSubCanvas() {

    const canvas = document.getElementById("gl-display-canvas");
    const gl = WebGLUtils.setupWebGL(canvas, null);
    const previewProgramInfo = createProgramInfo(gl, "shaders/preview.vert", "shaders/preview.frag");
    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);

    initBlocksTextures(gl);
    render();

    function render() {
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        const cameraProjMatrix = m4.perspective(
            deg2rad(60),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            1, 200
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.cullFace(gl.BACK);


        /** draw cube for selected block **/
        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(previewProgramInfo.program);
        twgl.setBuffersAndAttributes(gl, previewProgramInfo, cubeBufferInfo);
        twgl.setUniforms(previewProgramInfo, {
            modelMatrix: m4.rotationY(time),
            viewMatrix: m4.inverse(m4.lookAt(
                [-2.4, 2.0, 0],
                [0, 0, 0],
                [0, 1, 0]
            )),
            projMatrix: m4.perspective(
                deg2rad(30),
                gl.canvas.clientWidth / gl.canvas.clientHeight,
                0.2, 20
            ),
            lightPos: [-1, 2, -1]
        });
        twgl.setUniforms(previewProgramInfo, getTextureUniforms("grass_block"));
        twgl.drawBufferInfo(gl, cubeBufferInfo);
        gl.enable(gl.DEPTH_TEST);

        time += 0.05;

        requestAnimationFrame(render);
    }
};