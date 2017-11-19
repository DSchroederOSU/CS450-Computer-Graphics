#version 110

uniform float eyex;
uniform float eyey;
uniform float eyez;
varying vec2 vST;                   // texture coords
varying vec3 vN;                    // normal vector
varying vec3 vL;                    // vector from point to light
varying vec3 vE;                    // vector from point to eye
varying vec4 vertex;
varying vec3 uColor;

const float PI =        3.14159265;
const float AMP =       0.2;
const float W =         2.;

vec3 eye = vec3(eyex, eyey, eyez);
const vec3 LIGHTPOSITION = vec3( 0., 0., 0. );
void
main( )
{
   vST = gl_MultiTexCoord0.st;
   vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;
   vN = normalize( gl_NormalMatrix * gl_Normal );
   vL = LIGHTPOSITION - ECposition.xyz; // vector from the point
   // to the light position
   vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point


   vertex = gl_Vertex;
   gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}