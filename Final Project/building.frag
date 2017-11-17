#version 110

uniform float uKa, uKd, uKs, uniformTime, uPat; // coefficients of each type of lighting

uniform float width;
uniform float height;
uniform vec3 uColor; // object color
uniform vec3 uSpecularColor; // light color
uniform float uShininess; // specular exponent
varying vec2 vST; // texture cords
varying vec3 vN; // normal vector
varying vec3 vL; // vector from point to light
varying vec3 vE; // vector from point to eye
varying vec4 vertex;

//window colors
uniform float r;
uniform float g;
uniform float b;

void
main( )
{

	vec3 myColor = vec3(0.2578125, 0.28515625, 0.28515625);

    int yint = int(vertex.y);
    float mid = width/8.;
    if(yint < 1){
        if(vertex.x > 0. - (mid/2.) && vertex.x < (mid/2.) ){
            if( vertex.y < float(yint) + 0.6 ){
                myColor = vec3(r,g,b);
            }
        }
    }

    else if(vertex.x > (0.05 - (width/2.) + 0.05) && vertex.x < (0. + (width/2.) - 0.05)){
        if( (vertex.y > float(yint) + 0.05 &&  vertex.y < float(yint) + 0.45 ) ||
            (vertex.y > float(yint) + 0.55  &&  vertex.y < float(yint) + 0.95 ) ) {
            myColor = vec3(r,g,b);
        }
    }


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