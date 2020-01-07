
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
//uniform vec3 lightPos;

varying vec2 f_texcoord;
varying vec3 f_normal;
varying vec3 f_lightDir;

void main() {
    vec4 worldPosition = modelMatrix * a_position;
    vec3 lightPos = vec3(1.0, 3.0, 4.0);
    f_texcoord = a_texcoord;
    f_normal = mat3(modelMatrix) * a_normal;
    f_lightDir = normalize(lightPos - worldPosition.xyz);

    gl_Position = projMatrix * viewMatrix * worldPosition;
    gl_Position.y += 3.0;
}