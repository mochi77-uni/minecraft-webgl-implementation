
precision mediump float;

varying vec3 f_normal;
varying vec2 f_texcoord;
varying vec4 f_projectedTexcoord;
varying vec3 f_lightDir;

uniform sampler2D texture;
uniform sampler2D projectedTexture;
uniform sampler2D bumpTexture;
uniform float bias;

void main() {
    vec3 projectedTexcoord = f_projectedTexcoord.xyz / f_projectedTexcoord.w;
    float currentDepth = projectedTexcoord.z + bias;

    // calculate shadow map
    bool inRange = projectedTexcoord.x >= 0.0 && projectedTexcoord.x <= 1.0
                && projectedTexcoord.y >= 0.0 && projectedTexcoord.y <= 1.0;
    float opacity = 0.4;
    float shadows = 0.0;
    float texelSize = 1.0/1024.0;
    for(float y = -1.5; y <= 1.5; y += 1.0) {
        for(float x = -1.5; x <= 1.5; x += 1.0) {
            vec4 projectedDepth = texture2D(projectedTexture, projectedTexcoord.xy + vec2(x, y) * texelSize);
            shadows += (inRange && projectedDepth.r <= currentDepth) ? 0.0 : 1.0;
        }
    }
    shadows /= 16.0;
    float shadowColor = max(opacity, shadows);

    vec2 taxel = texture2D(bumpTexture, f_texcoord).xy * 2.0 - 1.0;
    vec3 normal = normalize(f_normal);
    normal.xy += (1.0-taxel);
    normal = normalize(normal);

    float light = dot(f_lightDir, normal);
    light = 1.2 * min(shadowColor, light);

    // set the actual fragment color
    vec4 texcolor = texture2D(texture, f_texcoord);
    gl_FragColor = vec4(light * texcolor.rgb, texcolor.a);
}