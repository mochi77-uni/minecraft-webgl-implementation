
precision mediump float;

varying vec2 fTexcoord;
varying vec3 fNormal;
varying vec4 fProjectedTexcoord;

uniform sampler2D texture;
uniform sampler2D projectedTexture;
//uniform float bias;
//uniform vec3 reverseLightDirection;

void main() {
    vec3 normal = normalize(fNormal);
//    float light = dot(normal, reverseLightDirection);

    vec3 projectedTexcoord = fProjectedTexcoord.xyz / fProjectedTexcoord.w;
//    float currentDepth = projectedTexcoord.z + bias;

    bool inRange = projectedTexcoord.x >= 0.0 && projectedTexcoord.x <= 1.0
                && projectedTexcoord.y >= 0.0 && projectedTexcoord.y <= 1.0;

//    float projectedDepth = texture2D(projectedTexcoord, projectedTexcoord.xy).r;
    vec4 projectedTexcolor = vec4(texture2D(projectedTexture, projectedTexcoord.xy).rrr, 1.0);
    vec4 texcolor = texture2D(texture, fTexcoord) * vec4(1.0, 0.0, 0.0, 1.0);
    float projectedAmount = inRange ? 1.0 : 0.0;

    gl_FragColor = mix(texcolor, projectedTexcolor, projectedAmount);
}