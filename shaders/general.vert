
attribute vec4 vPosition;
attribute vec2 vTexcoord;
attribute vec3 vNormal;

uniform mat4 projection;
uniform mat4 viewing;
uniform mat4 modeling;
uniform mat4 textureMatrix;

varying vec2 fTexcoord;
varying vec4 fProjectedTexcoord;
varying vec3 fNormal;

void main() {
    vec4 worldPosition = modeling * vPosition;
    fTexcoord = vTexcoord;
//    fProjectedTexcoord = textureMatrix * worldPosition;
    fNormal = mat3(modeling) * vNormal;

    gl_Position = projection * viewing * worldPosition;
}