//
//  bmptotexture.hpp
//  ComputerGraphicsProject3
//
//  Created by Brandon Lee on 10/13/16.
//  Copyright © 2016 Brandon Lee. All rights reserved.
//

#ifndef bmptotexture_hpp
#define bmptotexture_hpp

#include <stdio.h>
#include <errno.h>

unsigned char *BmpToTexture( char *filename, int *width, int *height );

#endif /* bmptotexture_hpp */