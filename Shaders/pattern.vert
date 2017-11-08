#version 110

// Animation variable
uniform float uniformTime;
varying vec2 vST;                   // texture coords
varying vec3 vN;                    // normal vector
varying vec3 vL;                    // vector from point to light
varying vec3 vE;                    // vector from point to eye
varying vec3 uColor;

const float PI =        3.14159265;
const float AMP =       0.2;
const float W =         2.;

const vec3 LIGHTPOSITION = vec3( 5., 5., 0. );
void
main( )
{
    vST = gl_MultiTexCoord0.st;
    vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;
    vN = normalize( gl_NormalMatrix * gl_Normal ); // normal vector
    vL = LIGHTPOSITION - ECposition.xyz; // vector from the point
    // to the light position
    vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point
    vec3 new_vertex = gl_Vertex.xyz;
    new_vertex.x = gl_Vertex.x;
    new_vertex.y = gl_Vertex.y;
    new_vertex.z = gl_Vertex.z;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}