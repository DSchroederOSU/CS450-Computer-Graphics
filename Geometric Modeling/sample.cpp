#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

#define _USE_MATH_DEFINES
#include <math.h>

#ifdef WIN32
#include <windows.h>
#pragma warning(disable:4996)
#include "glew.h"
#endif

#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#include <GLUT/glut.h>
#include "drawcurve.cpp"
#include "mjbsphere.cpp"
//	This is a sample OpenGL / GLUT program
//
//	The objective is to draw a 3d object and change the color of the axes
//		with a glut menu
//
//	The left mouse button does rotation
//	The middle mouse button does scaling
//	The user interface allows:
//		1. The axes to be turned on and off
//		2. The color of the axes to be changed
//		3. Debugging to be turned on and off
//		4. Depth cueing to be turned on and off
//		5. The projection to be changed
//		6. The transformations to be reset
//		7. The program to quit
//
//	Author:			Joe Graphics

// NOTE: There are a lot of good reasons to use const variables instead
// of #define's.  However, Visual C++ does not allow a const variable
// to be used as an array size or as the case in a switch( ) statement.  So in
// the following, all constants are const variables except those which need to
// be array sizes or cases in switch( ) statements.  Those are #defines.


// title of these windows:

const char *WINDOWTITLE = { "Project 6 Geometric Modeling - Daniel Schroeder" };
const char *GLUITITLE   = { "User Interface Window" };


// what the glui package defines as true and false:

const int GLUITRUE  = { true  };
const int GLUIFALSE = { false };


// the escape key:

#define ESCAPE		0x1b


// initial window size:

const int INIT_WINDOW_SIZE = { 600 };


// size of the box:

const float BOXSIZE = { 2.f };



// multiplication factors for input interaction:
//  (these are known from previous experience)

const float ANGFACT = { 1. };
const float SCLFACT = { 0.005f };


// minimum allowable scale factor:

const float MINSCALE = { 0.05f };


// active mouse buttons (or them together):

const int LEFT   = { 4 };
const int MIDDLE = { 2 };
const int RIGHT  = { 1 };


// which projection:

enum Projections
{
	ORTHO,
	PERSP
};


// which button:

enum ButtonVals
{
	RESET,
	QUIT
};


// window background color (rgba):

const GLfloat BACKCOLOR[ ] = { 0., 0., 0., 1. };


// line width for the axes:

const GLfloat AXES_WIDTH   = { 3. };


// the color numbers:
// this order must match the radio button order

enum Colors
{
	RED,
	YELLOW,
	GREEN,
	CYAN,
	BLUE,
	MAGENTA,
	WHITE,
	BLACK
};

char * ColorNames[ ] =
{
	"Red",
	"Yellow",
	"Green",
	"Cyan",
	"Blue",
	"Magenta",
	"White",
	"Black"
};


// the color definitions:
// this order must match the menu order

const GLfloat Colors[ ][3] = 
{
	{ 1., 0., 0. },		// red
	{ 1., 1., 0. },		// yellow
	{ 0., 1., 0. },		// green
	{ 0., 1., 1. },		// cyan
	{ 0., 0., 1. },		// blue
	{ 1., 0., 1. },		// magenta
	{ 1., 1., 1. },		// white
	{ 0., 0., 0. },		// black
};


// fog parameters:

const GLfloat FOGCOLOR[4] = { .0, .0, .0, 1. };
const GLenum  FOGMODE     = { GL_LINEAR };
const GLfloat FOGDENSITY  = { 0.30f };
const GLfloat FOGSTART    = { 1.5 };
const GLfloat FOGEND      = { 4. };


// non-constant global variables:

int		ActiveButton;			// current button that is down
GLuint	AxesList;				// list to hold the axes
int		AxesOn;					// != 0 means to draw the axes
int		DebugOn;				// != 0 means to print debugging info
int		DepthCueOn;				// != 0 means to use intensity depth cueing
int		DepthBufferOn;			// != 0 means to use the z-buffer
int		DepthFightingOn;		// != 0 means to use the z-buffer
GLuint	BoxList;				// object display list
int		MainWindow;				// window id for main graphics window
float	Scale;					// scaling factor
int		WhichColor;				// index into Colors[ ]
int		WhichProjection;		// ORTHO or PERSP
int		Xmouse, Ymouse;			// mouse values
float	Xrot, Yrot;				// rotation angles in degrees


// function prototypes:
void 	DrawControlPoints( Curve );
void	DrawSeagull( );
void	Animate( );
void	Display( );
void	DoAxesMenu( int );
void	DoColorMenu( int );
void	DoDepthBufferMenu( int );
void	DoDepthFightingMenu( int );
void	DoDepthMenu( int );
void	DoDebugMenu( int );
void	DoMainMenu( int );
void	DoProjectMenu( int );
void	DoRasterString( float, float, float, char * );
void	DoStrokeString( float, float, float, float, char * );
float	ElapsedSeconds( );
void	InitGraphics( );
void	InitLists( );
void	InitMenus( );
void	Keyboard( unsigned char, int, int );
void	MouseButton( int, int, int, int );
void	MouseMotion( int, int );
void	Reset( );
void	Resize( int, int );
void	Visibility( int );

void	Axes( float );
void	HsvRgb( float[3], float [3] );


//---------------------------------------------------
//PROGRAM 6 GEOMETRIC MODELING
//---------------------------------------------------

#define TIME_VARIABLE 1000
float Time;
GLuint	circleList;
float lookVector[] = {0., 0., -10};
float lookatVector[] = {0., 0., 0.};
int freeze = 0;
int drawControlPoints = 1;
int drawControlLines = 1;
int showHead = 1;
int showCluster = 0;
// main program:

int
main( int argc, char *argv[ ] )
{
	// turn on the glut package:
	// (do this before checking argc and argv since it might
	// pull some command line arguments out)

	glutInit( &argc, argv );


	// setup all the graphics stuff:

	InitGraphics( );


	// create the display structures that will not change:

	InitLists( );


	// init all the global variables used by Display( ):
	// this will also post a redisplay

	Reset( );


	// setup all the user interface stuff:

	InitMenus( );


	// draw the scene once and wait for some interaction:
	// (this will never return)

	glutSetWindow( MainWindow );
	glutMainLoop( );


	// this is here to make the compiler happy:

	return 0;
}


// this is where one would put code that is to be called
// everytime the glut main loop has nothing to do
//
// this is typically where animation parameters are set
//
// do not call Display( ) from here -- let glutMainLoop( ) do it

void
Animate( )
{
	glutSetWindow( MainWindow );
	// put animation stuff in here -- change some global variables
	// for Display( ) to find:

	int ms = glutGet( GLUT_ELAPSED_TIME );	// milliseconds

	ms  %=  (TIME_VARIABLE);
	if (freeze == 0) {
		Time = (float) ms / (float) TIME_VARIABLE;        // [ 0., 1. )
		// force a call to Display( ) next time it is convenient:
		Time = (int) (Time * 360) * M_PI / 180.0;
	}
	glutPostRedisplay( );
}


// draw the complete scene:

void
Display( )
{
	if( DebugOn != 0 )
	{
		fprintf( stderr, "Display\n" );
	}


	// set which window we want to do the graphics into:

	glutSetWindow( MainWindow );


	// erase the background:

	glDrawBuffer( GL_BACK );
	glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );

	if( DepthBufferOn != 0 )
		glEnable( GL_DEPTH_TEST );
	else
		glDisable( GL_DEPTH_TEST );


	// specify shading to be flat:

	glShadeModel( GL_FLAT );


	// set the viewport to a square centered in the window:

	GLsizei vx = glutGet( GLUT_WINDOW_WIDTH );
	GLsizei vy = glutGet( GLUT_WINDOW_HEIGHT );
	GLsizei v = vx < vy ? vx : vy;			// minimum dimension
	GLint xl = ( vx - v ) / 2;
	GLint yb = ( vy - v ) / 2;
	glViewport( xl, yb,  v, v );


	// set the viewing volume:
	// remember that the Z clipping  values are actually
	// given as DISTANCES IN FRONT OF THE EYE
	// USE gluOrtho2D( ) IF YOU ARE DOING 2D !

	glMatrixMode( GL_PROJECTION );
	glLoadIdentity( );
	if( WhichProjection == ORTHO )
		glOrtho( -3., 3.,     -3., 3.,     0.1, 1000. );
	else
		gluPerspective( 90., 1.,	0.1, 1000. );


	// place the objects into the scene:

	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity( );


	// set the eye position, look-at position, and up-vector:

	gluLookAt( lookVector[0], lookVector[1],
			   lookVector[2], lookatVector[0], lookatVector[1], lookatVector[2],
			   0., 1., 0. );


	// rotate the scene:

	glRotatef( (GLfloat)Yrot, 0., 1., 0. );
	glRotatef( (GLfloat)Xrot, 1., 0., 0. );


	// uniformly scale the scene:

	if( Scale < MINSCALE )
		Scale = MINSCALE;
	glScalef( (GLfloat)Scale, (GLfloat)Scale, (GLfloat)Scale );


	// set the fog parameters:

	if( DepthCueOn != 0 )
	{
		glFogi( GL_FOG_MODE, FOGMODE );
		glFogfv( GL_FOG_COLOR, FOGCOLOR );
		glFogf( GL_FOG_DENSITY, FOGDENSITY );
		glFogf( GL_FOG_START, FOGSTART );
		glFogf( GL_FOG_END, FOGEND );
		glEnable( GL_FOG );
	}
	else
	{
		glDisable( GL_FOG );
	}


	// possibly draw the axes:

	if( AxesOn != 0 )
	{
		glColor3fv( &Colors[WhichColor][0] );
		//glCallList( AxesList );
	}


	// since we are using glScalef( ), be sure normals get unitized:

	glEnable( GL_NORMALIZE );


	// draw the current object:
	glPushMatrix( );
		glScalef(3, 3, 3);
		DrawSeagull();
	glPopMatrix( );

	/*
	glPushMatrix( );
		glTranslatef(2.5, 1.5, 1);
		DrawSeagull();
	glPopMatrix( );
	glPushMatrix( );
		glTranslatef(-2.5, 1.5, 1);
		DrawSeagull();
	glPopMatrix( );
	*/
	if (showCluster == 1) {
		glPushMatrix();
		int i;
		glRotatef(rand() % 360 + Time * 180.0 / M_PI, -1. + rand() % 3, -1. + rand() % 3, -1. + rand() % 3);


		for (i = 0; i < 100; i++) {

			Point a;
			a.x0 = a.x = 0. + (rand() % 3) + (-1.5);
			a.y0 = a.y = 0. + (rand() % 3) + (-1.5);
			a.z0 = a.z = 0. + (rand() % 3) + (-1.5);

			Point b;
			b.x0 = b.x = 0. + (rand() % 3) + (-1.5);
			b.y0 = b.y = 0. + (rand() % 3) + (-1.5);
			b.z0 = b.z = 0. + (rand() % 3) + (-1.5);

			Point c;
			c.x0 = c.x = 0. + (rand() % 3) + (-1.5);
			c.y0 = c.y = 0. + (rand() % 3) + (-1.5);
			c.z0 = c.z = 0. + (rand() % 3) + (-1.5);

			Point d;
			d.x0 = d.x = 0. + (rand() % 3) + (-1.5);
			d.y0 = d.y = 0. + (rand() % 3) + (-1.5);
			d.z0 = d.z = 0. + (rand() % 3) + (-1.5);

			float t = Time * 180.0 / M_PI;
			float hsv[3] = {(i * 20.) + t, 1., 1.};
			float rgb[3];
			HsvRgb(hsv, rgb);
			Curve curve;
			curve.p0 = a;
			curve.p1 = b;
			curve.p2 = c;
			curve.p3 = d;
			curve.r = rgb[0];
			curve.g = rgb[1];
			curve.b = rgb[2];
			makeCurve(curve, 20);
		}
		glPopMatrix();
	}

	if( DepthFightingOn != 0 )
	{
		glPushMatrix( );
			glRotatef( 90.,   0., 1., 0. );
			glCallList( BoxList );
		glPopMatrix( );
	}
	/*

	*/

	// draw some gratuitous text that just rotates on top of the scene:

	// draw some gratuitous text that is fixed on the screen:
	glDisable( GL_DEPTH_TEST );
	glMatrixMode( GL_PROJECTION );
	glLoadIdentity( );
	gluOrtho2D( 0., 100.,     0., 100. );
	glMatrixMode( GL_MODELVIEW );
	glLoadIdentity( );
	glColor3f( 1., 1., 1. );
	DoRasterString( 28., 25., 0., "FLOCK OF SEAGULLS" );
	// the projection matrix is reset to define a scene whose
	// world coordinate system goes from 0-100 in each axis
	//
	// this is called "percent units", and is just a convenience
	//
	// the modelview matrix is reset to identity as we don't
	// want to transform these coordinates


	// swap the double-buffered framebuffers:

	glutSwapBuffers( );


	// be sure the graphics buffer has been sent:
	// note: be sure to use glFlush( ) here, not glFinish( ) !

	glFlush( );
}


void
DoAxesMenu( int id )
{
	AxesOn = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoColorMenu( int id )
{
	WhichColor = id - RED;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoDebugMenu( int id )
{
	DebugOn = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoDepthBufferMenu( int id )
{
	DepthBufferOn = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoDepthFightingMenu( int id )
{
	DepthFightingOn = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoDepthMenu( int id )
{
	DepthCueOn = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


// main menu callback:

void
DoMainMenu( int id )
{
	switch( id )
	{
		case RESET:
			Reset( );
			break;

		case QUIT:
			// gracefully close out the graphics:
			// gracefully close the graphics window:
			// gracefully exit the program:
			glutSetWindow( MainWindow );
			glFinish( );
			glutDestroyWindow( MainWindow );
			exit( 0 );
			break;

		default:
			fprintf( stderr, "Don't know what to do with Main Menu ID %d\n", id );
	}

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


void
DoProjectMenu( int id )
{
	WhichProjection = id;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


// use glut to display a string of characters using a raster font:

void
DoRasterString( float x, float y, float z, char *s )
{
	glRasterPos3f( (GLfloat)x, (GLfloat)y, (GLfloat)z );

	char c;			// one character to print
	for( ; ( c = *s ) != '\0'; s++ )
	{
		glutBitmapCharacter( GLUT_BITMAP_TIMES_ROMAN_24, c );
	}
}


// use glut to display a string of characters using a stroke font:

void
DoStrokeString( float x, float y, float z, float ht, char *s )
{
	glPushMatrix( );
		glTranslatef( (GLfloat)x, (GLfloat)y, (GLfloat)z );
		float sf = ht / ( 119.05f + 33.33f );
		glScalef( (GLfloat)sf, (GLfloat)sf, (GLfloat)sf );
		char c;			// one character to print
		for( ; ( c = *s ) != '\0'; s++ )
		{
			glutStrokeCharacter( GLUT_STROKE_ROMAN, c );
		}
	glPopMatrix( );
}


// return the number of seconds since the start of the program:

float
ElapsedSeconds( )
{
	// get # of milliseconds since the start of the program:

	int ms = glutGet( GLUT_ELAPSED_TIME );

	// convert it to seconds:

	return (float)ms / 1000.f;
}


// initialize the glui window:

void
InitMenus( )
{
	glutSetWindow( MainWindow );

	int numColors = sizeof( Colors ) / ( 3*sizeof(int) );
	int colormenu = glutCreateMenu( DoColorMenu );
	for( int i = 0; i < numColors; i++ )
	{
		glutAddMenuEntry( ColorNames[i], i );
	}

	int axesmenu = glutCreateMenu( DoAxesMenu );
	glutAddMenuEntry( "Off",  0 );
	glutAddMenuEntry( "On",   1 );

	int depthcuemenu = glutCreateMenu( DoDepthMenu );
	glutAddMenuEntry( "Off",  0 );
	glutAddMenuEntry( "On",   1 );

	int depthbuffermenu = glutCreateMenu( DoDepthBufferMenu );
	glutAddMenuEntry( "Off",  0 );
	glutAddMenuEntry( "On",   1 );

	int depthfightingmenu = glutCreateMenu( DoDepthFightingMenu );
	glutAddMenuEntry( "Off",  0 );
	glutAddMenuEntry( "On",   1 );

	int debugmenu = glutCreateMenu( DoDebugMenu );
	glutAddMenuEntry( "Off",  0 );
	glutAddMenuEntry( "On",   1 );

	int projmenu = glutCreateMenu( DoProjectMenu );
	glutAddMenuEntry( "Orthographic",  ORTHO );
	glutAddMenuEntry( "Perspective",   PERSP );

	int mainmenu = glutCreateMenu( DoMainMenu );
	glutAddSubMenu(   "Axes",          axesmenu);
	glutAddSubMenu(   "Colors",        colormenu);
	glutAddSubMenu(   "Depth Buffer",  depthbuffermenu);
	glutAddSubMenu(   "Depth Fighting",depthfightingmenu);
	glutAddSubMenu(   "Depth Cue",     depthcuemenu);
	glutAddSubMenu(   "Projection",    projmenu );
	glutAddMenuEntry( "Reset",         RESET );
	glutAddSubMenu(   "Debug",         debugmenu);
	glutAddMenuEntry( "Quit",          QUIT );

// attach the pop-up menu to the right mouse button:

	glutAttachMenu( GLUT_RIGHT_BUTTON );
}



// initialize the glut and OpenGL libraries:
//	also setup display lists and callback functions

void
InitGraphics( )
{
	// request the display modes:
	// ask for red-green-blue-alpha color, double-buffering, and z-buffering:

	glutInitDisplayMode( GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH );

	// set the initial window configuration:

	glutInitWindowPosition( 0, 0 );
	glutInitWindowSize( INIT_WINDOW_SIZE, INIT_WINDOW_SIZE );

	// open the window and set its title:

	MainWindow = glutCreateWindow( WINDOWTITLE );
	glutSetWindowTitle( WINDOWTITLE );

	// set the framebuffer clear values:

	glClearColor( BACKCOLOR[0], BACKCOLOR[1], BACKCOLOR[2], BACKCOLOR[3] );

	// setup the callback functions:
	// DisplayFunc -- redraw the window
	// ReshapeFunc -- handle the user resizing the window
	// KeyboardFunc -- handle a keyboard input
	// MouseFunc -- handle the mouse button going down or up
	// MotionFunc -- handle the mouse moving with a button down
	// PassiveMotionFunc -- handle the mouse moving with a button up
	// VisibilityFunc -- handle a change in window visibility
	// EntryFunc	-- handle the cursor entering or leaving the window
	// SpecialFunc -- handle special keys on the keyboard
	// SpaceballMotionFunc -- handle spaceball translation
	// SpaceballRotateFunc -- handle spaceball rotation
	// SpaceballButtonFunc -- handle spaceball button hits
	// ButtonBoxFunc -- handle button box hits
	// DialsFunc -- handle dial rotations
	// TabletMotionFunc -- handle digitizing tablet motion
	// TabletButtonFunc -- handle digitizing tablet button hits
	// MenuStateFunc -- declare when a pop-up menu is in use
	// TimerFunc -- trigger something to happen a certain time from now
	// IdleFunc -- what to do when nothing else is going on

	glutSetWindow( MainWindow );
	glutDisplayFunc( Display );
	glutReshapeFunc( Resize );
	glutKeyboardFunc( Keyboard );
	glutMouseFunc( MouseButton );
	glutMotionFunc( MouseMotion );
	glutPassiveMotionFunc( NULL );
	glutVisibilityFunc( Visibility );
	glutEntryFunc( NULL );
	glutSpecialFunc( NULL );
	glutSpaceballMotionFunc( NULL );
	glutSpaceballRotateFunc( NULL );
	glutSpaceballButtonFunc( NULL );
	glutButtonBoxFunc( NULL );
	glutDialsFunc( NULL );
	glutTabletMotionFunc( NULL );
	glutTabletButtonFunc( NULL );
	glutMenuStateFunc( NULL );
	glutTimerFunc( -1, NULL, 0 );
	glutIdleFunc( Animate );

	// init glew (a window must be open to do this):

#ifdef WIN32
	GLenum err = glewInit( );
	if( err != GLEW_OK )
	{
		fprintf( stderr, "glewInit Error\n" );
	}
	else
		fprintf( stderr, "GLEW initialized OK\n" );
	fprintf( stderr, "Status: Using GLEW %s\n", glewGetString(GLEW_VERSION));
#endif

}


// initialize the display lists that will not change:
// (a display list is a way to store opengl commands in
//  memory so that they can be played back efficiently at a later time
//  with a call to glCallList( )

void
InitLists( )
{
	float dx = BOXSIZE / 2.f;
	float dy = BOXSIZE / 2.f;
	float dz = BOXSIZE / 2.f;
	glutSetWindow( MainWindow );

	// create the object:

	BoxList = glGenLists( 1 );
	glNewList( BoxList, GL_COMPILE );



	glEndList( );

	circleList = glGenLists( 1 );
	glNewList( circleList, GL_COMPILE );
		float x,y;
		float radius = 6.;
		glBegin(GL_LINES);
		glColor3f(1.0f,0.0f,0.0f);

		x = (float)radius * cos(359 * M_PI/180.0f);
		y = (float)radius * sin(359 * M_PI/180.0f);
		for(int j = 0; j < 360; j++)
		{
			glVertex2f(x,y);
			x = (float)radius * cos(j * M_PI/180.0f);
			y = (float)radius * sin(j * M_PI/180.0f);
			glVertex2f(x,y);
		}
		glEnd();
	glEndList( );
	// create the axes:

	AxesList = glGenLists( 1 );
	glNewList( AxesList, GL_COMPILE );
		glLineWidth( AXES_WIDTH );
			Axes( 1.5 );
		glLineWidth( 1. );
	glEndList( );
}


// the keyboard callback:

void
Keyboard( unsigned char c, int x, int y )
{
	if( DebugOn != 0 )
		fprintf( stderr, "Keyboard: '%c' (0x%0x)\n", c, c );

	switch( c )
	{
		case 'o':
		case 'O':
			WhichProjection = ORTHO;
			break;
		case 'k':
		case 'K':
			if (drawControlPoints == 1)
				drawControlPoints = 0;
			else
				drawControlPoints = 1;
			break;
		case 'l':
		case 'L':
			if (drawControlLines == 1)
				drawControlLines = 0;
			else
				drawControlLines = 1;
			break;
		case 'f':
		case 'F':
			if ( freeze == 0 )
				freeze = 1;
			else
				freeze = 0;
			break;
		case 'h':
		case 'H':
			if ( showHead == 0 )
				showHead = 1;
			else
				showHead = 0;
			break;
		case '1':
			if ( showCluster == 0 )
				showCluster = 1;
			else
				showCluster = 0;
			break;
		case 'p':
		case 'P':
			WhichProjection = PERSP;
			break;
		case 'w':
		case 'W':
			lookVector[2]++;
			lookatVector[2]++;
			break;
		case 'a':
		case 'A':
			lookatVector[0]++;
			break;
		case 's':
		case 'S':
			lookVector[2]--;
			lookatVector[2]--;
			break;
		case 'd':
		case 'D':
			lookatVector[0]--;
			break;
		case 'q':
		case 'Q':
		case ESCAPE:
			DoMainMenu( QUIT );	// will not return here
			break;				// happy compiler

		default:
			fprintf( stderr, "Don't know what to do with keyboard hit: '%c' (0x%0x)\n", c, c );
	}

	// force a call to Display( ):

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


// called when the mouse button transitions down or up:

void
MouseButton( int button, int state, int x, int y )
{
	int b = 0;			// LEFT, MIDDLE, or RIGHT

	if( DebugOn != 0 )
		fprintf( stderr, "MouseButton: %d, %d, %d, %d\n", button, state, x, y );

	
	// get the proper button bit mask:

	switch( button )
	{
		case GLUT_LEFT_BUTTON:
			b = LEFT;		break;

		case GLUT_MIDDLE_BUTTON:
			b = MIDDLE;		break;

		case GLUT_RIGHT_BUTTON:
			b = RIGHT;		break;

		default:
			b = 0;
			fprintf( stderr, "Unknown mouse button: %d\n", button );
	}


	// button down sets the bit, up clears the bit:

	if( state == GLUT_DOWN )
	{
		Xmouse = x;
		Ymouse = y;
		ActiveButton |= b;		// set the proper bit
	}
	else
	{
		ActiveButton &= ~b;		// clear the proper bit
	}
}


// called when the mouse moves while a button is down:

void
MouseMotion( int x, int y )
{
	if( DebugOn != 0 )
		fprintf( stderr, "MouseMotion: %d, %d\n", x, y );


	int dx = x - Xmouse;		// change in mouse coords
	int dy = y - Ymouse;

	if( ( ActiveButton & LEFT ) != 0 )
	{
		Xrot += ( ANGFACT*dy );
		Yrot += ( ANGFACT*dx );
	}


	if( ( ActiveButton & MIDDLE ) != 0 )
	{
		Scale += SCLFACT * (float) ( dx - dy );

		// keep object from turning inside-out or disappearing:

		if( Scale < MINSCALE )
			Scale = MINSCALE;
	}

	Xmouse = x;			// new current position
	Ymouse = y;

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


// reset the transformations and the colors:
// this only sets the global variables --
// the glut main loop is responsible for redrawing the scene

void
Reset( )
{
	ActiveButton = 0;
	AxesOn = 1;
	DebugOn = 0;
	DepthBufferOn = 1;
	DepthFightingOn = 0;
	DepthCueOn = 0;
	Scale  = 1.0;
	WhichColor = WHITE;
	WhichProjection = PERSP;
	Xrot = Yrot = 0.;
}


// called when user resizes the window:

void
Resize( int width, int height )
{
	if( DebugOn != 0 )
		fprintf( stderr, "ReSize: %d, %d\n", width, height );

	// don't really need to do anything since window size is
	// checked each time in Display( ):

	glutSetWindow( MainWindow );
	glutPostRedisplay( );
}


// handle a change to the window's visibility:

void
Visibility ( int state )
{
	if( DebugOn != 0 )
		fprintf( stderr, "Visibility: %d\n", state );

	if( state == GLUT_VISIBLE )
	{
		glutSetWindow( MainWindow );
		glutPostRedisplay( );
	}
	else
	{
		// could optimize by keeping track of the fact
		// that the window is not visible and avoid
		// animating or redrawing it ...
	}
}



///////////////////////////////////////   HANDY UTILITIES:  //////////////////////////


// the stroke characters 'X' 'Y' 'Z' :

static float xx[ ] = {
		0.f, 1.f, 0.f, 1.f
	      };

static float xy[ ] = {
		-.5f, .5f, .5f, -.5f
	      };

static int xorder[ ] = {
		1, 2, -3, 4
		};

static float yx[ ] = {
		0.f, 0.f, -.5f, .5f
	      };

static float yy[ ] = {
		0.f, .6f, 1.f, 1.f
	      };

static int yorder[ ] = {
		1, 2, 3, -2, 4
		};

static float zx[ ] = {
		1.f, 0.f, 1.f, 0.f, .25f, .75f
	      };

static float zy[ ] = {
		.5f, .5f, -.5f, -.5f, 0.f, 0.f
	      };

static int zorder[ ] = {
		1, 2, 3, 4, -5, 6
		};

// fraction of the length to use as height of the characters:
const float LENFRAC = 0.10f;

// fraction of length to use as start location of the characters:
const float BASEFRAC = 1.10f;

//	Draw a set of 3D axes:
//	(length is the axis length in world coordinates)

void
Axes( float length )
{
	glBegin( GL_LINE_STRIP );
		glVertex3f( length, 0., 0. );
		glVertex3f( 0., 0., 0. );
		glVertex3f( 0., length, 0. );
	glEnd( );
	glBegin( GL_LINE_STRIP );
		glVertex3f( 0., 0., 0. );
		glVertex3f( 0., 0., length );
	glEnd( );

	float fact = LENFRAC * length;
	float base = BASEFRAC * length;

	glBegin( GL_LINE_STRIP );
		for( int i = 0; i < 4; i++ )
		{
			int j = xorder[i];
			if( j < 0 )
			{
				
				glEnd( );
				glBegin( GL_LINE_STRIP );
				j = -j;
			}
			j--;
			glVertex3f( base + fact*xx[j], fact*xy[j], 0.0 );
		}
	glEnd( );

	glBegin( GL_LINE_STRIP );
		for( int i = 0; i < 5; i++ )
		{
			int j = yorder[i];
			if( j < 0 )
			{
				
				glEnd( );
				glBegin( GL_LINE_STRIP );
				j = -j;
			}
			j--;
			glVertex3f( fact*yx[j], base + fact*yy[j], 0.0 );
		}
	glEnd( );

	glBegin( GL_LINE_STRIP );
		for( int i = 0; i < 6; i++ )
		{
			int j = zorder[i];
			if( j < 0 )
			{
				
				glEnd( );
				glBegin( GL_LINE_STRIP );
				j = -j;
			}
			j--;
			glVertex3f( 0.0, fact*zy[j], base + fact*zx[j] );
		}
	glEnd( );

}


// function to convert HSV to RGB
// 0.  <=  s, v, r, g, b  <=  1.
// 0.  <= h  <=  360.
// when this returns, call:
//		glColor3fv( rgb );

void
HsvRgb( float hsv[3], float rgb[3] )
{
	// guarantee valid input:

	float h = hsv[0] / 60.f;
	while( h >= 6. )	h -= 6.;
	while( h <  0. ) 	h += 6.;

	float s = hsv[1];
	if( s < 0. )
		s = 0.;
	if( s > 1. )
		s = 1.;

	float v = hsv[2];
	if( v < 0. )
		v = 0.;
	if( v > 1. )
		v = 1.;

	// if sat==0, then is a gray:

	if( s == 0.0 )
	{
		rgb[0] = rgb[1] = rgb[2] = v;
		return;
	}

	// get an rgb from the hue itself:
	
	float i = floor( h );
	float f = h - i;
	float p = v * ( 1.f - s );
	float q = v * ( 1.f - s*f );
	float t = v * ( 1.f - ( s * (1.f-f) ) );

	float r, g, b;			// red, green, blue
	switch( (int) i )
	{
		case 0:
			r = v;	g = t;	b = p;
			break;
	
		case 1:
			r = q;	g = v;	b = p;
			break;
	
		case 2:
			r = p;	g = v;	b = t;
			break;
	
		case 3:
			r = p;	g = q;	b = v;
			break;
	
		case 4:
			r = t;	g = p;	b = v;
			break;
	
		case 5:
			r = v;	g = p;	b = q;
			break;
	}


	rgb[0] = r;
	rgb[1] = g;
	rgb[2] = b;
}
void DrawControlPoints(Curve c) {
	if (drawControlPoints == 1) {
		glColor3f(0, 1, 0);
		glPushMatrix();

		glTranslatef(c.p0.x, c.p0.y, c.p0.z);
		MjbSphere(0.02, 20, 20);
		glPopMatrix();
		glPushMatrix();
		glTranslatef(c.p1.x, c.p1.y, c.p1.z);
		MjbSphere(0.02, 20, 20);
		glPopMatrix();
		glPushMatrix();
		glTranslatef(c.p2.x, c.p2.y, c.p2.z);
		MjbSphere(0.02, 20, 20);
		glPopMatrix();
		glPushMatrix();
		glTranslatef(c.p3.x, c.p3.y, c.p3.z);
		MjbSphere(0.02, 5, 5);
		glPopMatrix();
	}
	if (drawControlLines == 1){
		glColor3f(1, 1, 0);
		glBegin(GL_LINE_STRIP);
		glVertex3f(c.p0.x, c.p0.y, c.p0.z);
		glVertex3f(c.p1.x, c.p1.y, c.p1.z);
		glVertex3f(c.p2.x, c.p2.y, c.p2.z);
		glVertex3f(c.p3.x, c.p3.y, c.p3.z);

		glEnd();
	}
}
void DrawSeagull(){
	glPushMatrix();
	Point a;
	a.x0 = a.x = 2 - (0.5)*sin(Time);
	a.y0 = a.y = 0.2 - (0.5)*sin(Time);
	a.z0 = a.z = 0;

	Point b;
	b.x0 = b.x = 1.5;
	b.y0 = b.y = 0.7 - (0.1)*sin(Time);
	b.z0 = b.z = 0;

	Point c;
	c.x0 = c.x = 0.5;
	c.y0 = c.y = 0.7;
	c.z0 = c.z = 0;

	Point d;
	d.x0 = d.x = 0;
	d.y0 = d.y = 0;
	d.z0 = d.z = 0;

	Point a1;
	a1.x0 = a1.x = -2 + (0.5)*sin(Time);
	a1.y0 = a1.y = 0.2 - (0.5)*sin(Time);
	a1.z0 = a1.z = 0;

	Point b1;
	b1.x0 = b1.x = -1.5;
	b1.y0 = b1.y = 0.7 - (0.1)*sin(Time);
	b1.z0 = b1.z = 0;

	Point c1;
	c1.x0 = c1.x = -0.5;
	c1.y0 = c1.y = 0.7;
	c1.z0 = c1.z = 0;

	Point d1;
	d1.x0 = d1.x = 0;
	d1.y0 = d1.y = 0;
	d1.z0 = d1.z = 0;

	// body points
	Point a2;
	a2.x0 = a2.x = 1.8;
	a2.y0 = a2.y = 0.3;
	a2.z0 = a2.z = 0;

	Point b2;
	b2.x0 = b2.x = 1.5;
	b2.y0 = b2.y = 0.4;
	b2.z0 = b2.z = 0;

	Point c2;
	c2.x0 = c2.x = 0.5;
	c2.y0 = c2.y = 0.4;
	c2.z0 = c2.z = 0;

	Point d2;
	d2.x0 = d2.x = 0;
	d2.y0 = d2.y = 0;
	d2.z0 = d2.z = 0;

	Curve wing1;
	wing1.p0 = a;
	wing1.p1 = b;
	wing1.p2 = c;
	wing1.p3 = d;
	wing1.r = .66;
	wing1.g = .66;
	wing1.b = .66;

	Curve wing2;
	wing2.p0 = a1;
	wing2.p1 = b1;
	wing2.p2 = c1;
	wing2.p3 = d1;
	wing2.r = .66;
	wing2.g = .66;
	wing2.b = .66;

	Curve body;
	body.p0 = a2;
	body.p1 = b2;
	body.p2 = c2;
	body.p3 = d2;
	body.r = .66;
	body.g = .66;
	body.b = .66;

	int i;
	makeCurve(wing1, 20);
	DrawControlPoints(wing1);
	for(i = -15; i < 15; i++){
		wing1 = rotateCurveX(0, wing1, 2*i);
		if (i%3 == 0)
			DrawControlPoints(wing1);
		makeCurve(wing1, 20);
	}

	makeCurve(wing2, 20);
	for(i = -15; i < 15; i++){
		wing2 = rotateCurveX(0, wing2, 2*i);
		if (i%3 == 0)
			DrawControlPoints(wing2);
		makeCurve(wing2, 20);
	}

	glTranslatef(0, 0, 1);
	glRotatef(90, 0., 1., 0.);

	for(i = 0; i < 360; i++){
		body = rotateCurveX(0, body, 2*i);
		if (i%20 == 0)
			DrawControlPoints(body);
		makeCurve(body, 20);
	}

	glPopMatrix();

	// make tail
	glPushMatrix();
		glRotatef(5, 1, 0, 0);
		glTranslatef(0, 0, 0.5);
		glBegin(GL_TRIANGLE_STRIP);
			glVertex3f(0, 0, 0);
			glVertex3f(0.5, 0.2, 0.8);
			glVertex3f(-0.5, 0.2, 0.8);
			glVertex3f(-0.5, 0, 0.8);
			glVertex3f(0, 0, 0);
			glVertex3f(0.5, 0, 0.8);
			glVertex3f(0.5, 0.2, 0.8);
			glVertex3f(-0.5, 0.2, 0.8);
		glEnd();
	glPopMatrix();

	if (showHead == 1) {
		// make head
		glPushMatrix();
		// head points
		Point a3;
		a3.x0 = a3.x = 0;
		a3.y0 = a3.y = 0;
		a3.z0 = a3.z = 0;

		Point b3;
		b3.x0 = b3.x = 0;
		b3.y0 = b3.y = 0.1;
		b3.z0 = b3.z = 0.2;

		Point c3;
		c3.x0 = c3.x = 0;
		c3.y0 = c3.y = 0.24;
		c3.z0 = c3.z = 0.32;

		Point d3;
		d3.x0 = d3.x = 0;
		d3.y0 = d3.y = 0;
		d3.z0 = d3.z = 0.45;

		Curve head;
		head.p0 = a3;
		head.p1 = b3;
		head.p2 = c3;
		head.p3 = d3;
		head.r = .66;
		head.g = .66;
		head.b = .66;
		glTranslatef(0, 0.35, -1.05);
		for (i = 0; i < 360; i++) {
			head = rotateCurveZ(0, head, 2 * i);
			if (i % 20 == 0)
				DrawControlPoints(head);
			makeCurve(head, 20);

		}


		glPopMatrix();
	}
}