
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 texMatrix;

varying vec2 f_texcoord;
varying vec4 f_projectedTexcoord;
varying vec3 f_normal;

void main() {
    vec4 worldPosition = modelMatrix * a_position;
    f_texcoord = a_texcoord;
    f_projectedTexcoord = texMatrix * worldPosition;
    f_normal = mat3(modelMatrix) * a_normal;

    gl_Position = projMatrix * viewMatrix * worldPosition;
}