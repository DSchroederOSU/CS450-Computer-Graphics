//
// Created by Daniel Schroeder on 11/15/17.
//

struct Point
{
    float x0, y0, z0;       // initial coordinates
    float x,  y,  z;        // animated coordinates
};

struct Curve
{
    float r, g, b;
    Point p0, p1, p2, p3;
};

void
makeCurve(Curve c, int n){

    int NUMPOINTS = n;
    glLineWidth( 3. );
    glColor3f( c.r, c.g, c.b );
    glBegin( GL_LINE_STRIP );
        for( int it = 0; it <= NUMPOINTS; it++ )
        {
            float t = (float)it / (float)NUMPOINTS;
            float omt = 1.f - t;
            float x = omt*omt*omt*c.p0.x + 3.f*t*omt*omt*c.p1.x + 3.f*t*t*omt*c.p2.x + t*t*t*c.p3.x;
            float y = omt*omt*omt*c.p0.y + 3.f*t*omt*omt*c.p1.y + 3.f*t*t*omt*c.p2.y + t*t*t*c.p3.y;
            float z = omt*omt*omt*c.p0.z + 3.f*t*omt*omt*c.p1.z + 3.f*t*t*omt*c.p2.z + t*t*t*c.p3.z;
            glVertex3f( x, y, z );
        }
    glEnd( );
    glLineWidth( 1. );
}

void
RotateX( Point *p, float deg, float xc, float yc, float zc )
{
    float rad = deg * (M_PI/180.f);         // radians
    float x = p->x0 - xc;
    float y = p->y0 - yc;
    float z = p->z0 - zc;

    float xp = x;
    float yp = y*cos(rad) - z*sin(rad);
    float zp = y*sin(rad) + z*cos(rad);

    p->x = xp + xc;
    p->y = yp + yc;
    p->z = zp + zc;
}


void
RotateY( Point *p, float deg, float xc, float yc, float zc )
{
    float rad = deg * (M_PI/180.f);         // radians
    float x = p->x0 - xc;
    float y = p->y0 - yc;
    float z = p->z0 - zc;

    float xp =  x*cos(rad) + z*sin(rad);
    float yp =  y;
    float zp = -x*sin(rad) + z*cos(rad);

    p->x = xp + xc;
    p->y = yp + yc;
    p->z = zp + zc;
}

void
RotateZ( Point *p, float deg, float xc, float yc, float zc )
{
    float rad = deg * (M_PI/180.f);         // radians
    float x = p->x0 - xc;
    float y = p->y0 - yc;
    float z = p->z0 - zc;

    float xp = x*cos(rad) - y*sin(rad);
    float yp = x*sin(rad) + y*cos(rad);
    float zp = z;

    p->x = xp + xc;
    p->y = yp + yc;
    p->z = zp + zc;
}

void
rotateCurveZ(float time, Curve c, int offset){
    float start = (offset+(sin(time)+0.5))/2;
    printf("%f\n", start);
    RotateZ( &c.p1, offset+(sin(time)+0.5)*20, 0, (sin(time)), (-1.)*start + offset+(sin(time)+0.5));
    RotateZ( &c.p2, offset+(sin(time)+0.5)*20, 0, (sin(time)), (-1.)*start + offset+(sin(time)+0.5));
    RotateZ( &c.p3, offset+(sin(time)+0.5)*20, 0, (sin(time)), (-1.)*start + offset+(sin(time)+0.5));
    RotateZ( &c.p0, offset+(sin(time)+0.5)*20, 0, (sin(time)), (-1.)*start + offset+(sin(time)+0.5));
    makeCurve(c, 20);
}