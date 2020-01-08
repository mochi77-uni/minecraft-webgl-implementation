
"use strict";

let selectedBlockIndex = 0;

function initSubCanvas() {
    const canvas = document.getElementById("gl-display-canvas");
    const gl = WebGLUtils.setupWebGL(canvas, null);
    const previewProgramInfo = createProgramInfo(gl, "shaders/preview.vert", "shaders/preview.frag");
    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);

    /** setup normal textures and bump textures **/
    const localBlockTextures = getBlockTextures(gl);
    const localBumpTextures = getBumpTextures(gl);
    /** use local textures and place blocks for testing **/
    useTextures(localBlockTextures, localBumpTextures);

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
        const blockName = blockNames[selectedBlockIndex % blockNames.length];
        useTextures(localBlockTextures, localBumpTextures);
        twgl.setUniforms(previewProgramInfo, getTextureUniforms(blockName));
        twgl.drawBufferInfo(gl, cubeBufferInfo);
        gl.enable(gl.DEPTH_TEST);

        time += 0.05;

        requestAnimationFrame(render);
    }
}