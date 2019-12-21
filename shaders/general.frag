
precision mediump float;
varying vec4 fColor;  // Note that this will be interpolated between vertices.
varying vec2 fTexCoord;

uniform sampler2D texture;

void main()
{
    gl_FragColor = fColor; // * texture2D( texture, fTexCoord );
}
