
precision mediump float;

uniform samplerCube cubemap;
uniform mat4 viewProjInverse;

varying vec4 f_position;

void main() {
    vec4 t = viewProjInverse * f_position;
    gl_FragColor = textureCube(cubemap, normalize(t.xyz / t.w));
}
