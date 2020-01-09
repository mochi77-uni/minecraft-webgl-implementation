
attribute vec4 a_position;

uniform mat4 projMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec4 f_position;

void main() {
    vec4 worldPosition = modelMatrix * a_position;
    f_position = normalize(worldPosition);
    gl_Position = projMatrix * viewMatrix * worldPosition;
}