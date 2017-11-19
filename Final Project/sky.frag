
#version 110
uniform float uKa, uKd, uKs, uniformTime, uPat; // coefficients of each type of lighting
uniform vec3 uColor; // object color
uniform vec3 uSpecularColor; // light color
uniform float uShininess; // specular exponent

//---------OUT------------
varying vec2 vST; // texture cords
varying vec3 vN; // normal vector
varying vec3 vL; // vector from point to light
varying vec3 vE; // vector from point to eye
varying vec4 vertex;


//---------MAIN------------
void main(){

        vec3 myColor = vec3(0.1328125, 0.640625, 0.9375);


    	vec3 Normal = normalize(vN);
        vec3 Light = normalize(vL);
        vec3 Eye = normalize(vE);
        vec3 ambient = uKa * myColor;
        float d = max( dot(Normal,Light), 0. ); // only do diffuse if the light can see the point
        vec3 diffuse = uKd * d * myColor;
        float s = 0.;
        if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
        {
        vec3 ref = normalize( reflect( -Light, Normal ) );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
        }
        vec3 specular = uKs * s * myColor;
        gl_FragColor = vec4( ambient + diffuse + specular, 1. );

}