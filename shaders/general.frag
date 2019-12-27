
precision mediump float;

varying vec2 f_texcoord;
varying vec3 f_normal;
varying vec4 f_projectedTexcoord;

uniform sampler2D texture;
uniform sampler2D projectedTexture;
uniform float bias;

float gaussian(float x, float y, float sigma) {
    return 1 / (2 * PI * sigma * sigma);
}

void main() {
    vec3 normal = normalize(f_normal);

    vec3 projectedTexcoord = f_projectedTexcoord.xyz / f_projectedTexcoord.w;
    float currentDepth = projectedTexcoord.z + bias;

    bool inRange = projectedTexcoord.x >= 0.0 && projectedTexcoord.x <= 1.0
                && projectedTexcoord.y >= 0.0 && projectedTexcoord.y <= 1.0;
    float opacity = 0.6;
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
//    float projectedDepth = texture2D(projectedTexture, projectedTexcoord.xy).r;
//    float shadowColor = (inRange && projectedDepth <= currentDepth) ? 0.5 : 1.0;

    vec4 texcolor = texture2D(texture, f_texcoord);
    gl_FragColor = vec4(texcolor.rgb * shadowColor, texcolor.a);
}