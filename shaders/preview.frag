
precision mediump float;

varying vec3 f_normal;
varying vec2 f_texcoord;
varying vec3 f_lightDir;

uniform sampler2D texture;
uniform sampler2D bumpTexture;

void main() {

    vec2 taxel = texture2D(bumpTexture, f_texcoord).xy * 2.0 - 1.0;
    vec3 normal = normalize(f_normal);
    taxel.y = -taxel.y;
    normal.xy += taxel.xy;
    normal = normalize(normal);

    float opacity = 0.4;
    float light = dot(f_lightDir, normal);
    light = max(light, opacity);

    // set the actual fragment color
    vec4 texcolor = texture2D(texture, f_texcoord);
    gl_FragColor = vec4(light * texcolor.rgb, texcolor.a);
}