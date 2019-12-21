
"use strict";

window.onload = main;

const cube_obj = cube();

function main() {
    const canvas = document.getElementById("gl-canvas");
    const gl = WebGLUtils.setupWebGL(canvas, null);
    if( !gl )  { alert( "WebGL isn't available" ); }
    const ext = gl.getExtension("WEBGL_depth_texture");
    if( !ext ) { alert( "Extension WEBGL_depth_texture isn't available" ) }

    const generalProgramInfo = createProgramInfo(gl, "./shaders/general.vert", "./shaders/general.frag");

    const settings = {
        cameraX: 6.0,
        cameraY: 6.0,
        cameraZ: 6.0,
        lightPosition: vec4( 0.0, 10.0, 20.0, 1.0 )
    };

    const cubeUniforms = {
        materialAmbient:    vec4( 0.25, 0.25, 0.25, 1.0 ),
        materialDiffuse:    vec4( 0.8, 0.8, 0.8, 1.0),
        materialSpecular:   vec4( 10.0, 10.0, 1.0, 1.0 ),
        shininess: 12.0,
        modelingMatrix: mat4()
    };
}