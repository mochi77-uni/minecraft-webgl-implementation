
attribute vec4 vPosition;

uniform mat4 modeling;
uniform mat4 viewing;
uniform mat4 projection;

void main() {
    gl_Position = projection * viewing * modeling * vPosition;
}