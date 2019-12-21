
attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

varying vec4 fColor;
varying vec2 fTexCoord;

uniform mat4 modelingMatrix;
uniform mat4 viewingMatrix;
uniform mat4 projectionMatrix;

uniform vec4 materialAmbient;
uniform vec4 materialDiffuse;
uniform vec4 materialSpecular;
uniform float shininess;

uniform vec4 lightPosition;

void main()
{
    vec4 eye = vec4(0.0, 0.0, -1.0, 1.0);  // The default eye position
    vec4 L = normalize( lightPosition - vPosition ); // Light vector
    vec4 N = normalize( vNormal );	// Normal vector
    vec4 V = normalize( eye - vPosition );		// Eye vector.
    vec4 H = normalize( L + V );  // Halfway vector in the modified Phong model

    vec4 ambient = materialAmbient;

    float Kd = max( dot(L, N), 0.0 );
    vec4  diffuse = Kd * materialDiffuse;

    float Ks = pow( max(dot(N, H), 0.0), shininess );

    fColor = (ambient + diffuse) * vColor;
    fTexCoord = vTexCoord;
    gl_Position = projectionMatrix * viewingMatrix * modelingMatrix * vPosition;
}
