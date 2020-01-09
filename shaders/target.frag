
precision mediump float;

varying vec4 f_position;

void main() {
    gl_FragColor = vec4(0.8 * f_position.xyz, 1.0);
}