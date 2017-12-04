#version 110

// Animation variable
uniform float eyex;
uniform float eyey;
uniform float eyez;
uniform float uniformTime;
uniform float random;
varying vec2 vST;                   // texture coords
varying vec3 vN;                    // normal vector
varying vec3 vL;                    // vector from point to light
varying vec3 vE;                    // vector from point to eye
varying vec4 vertex;
varying vec3 uColor;

const float PI =        3.14159265;
const float AMP =       0.2;
const float W =         2.;

void
main( )
{
vec3 new_vertex = gl_Vertex.xyz;
        new_vertex.x = gl_Vertex.x;
        new_vertex.y = gl_Vertex.y;
        new_vertex.z = gl_Vertex.z + gl_Vertex.y*(uniformTime/2.);
    vST = gl_MultiTexCoord0.st;
    vec4 ECposition = gl_ModelViewMatrix * vec4(new_vertex, 1);
    vec3 LIGHTPOSITION =  vec3(0., 1000., 0.);
    vN = normalize( gl_NormalMatrix * vec3(new_vertex.x, new_vertex.y+3., new_vertex.z)); // normal vector
    vL = LIGHTPOSITION ; // vector from the point
    // to the light position
    vE =vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point


    gl_Position = gl_ModelViewProjectionMatrix * vec4(new_vertex, 1);
}