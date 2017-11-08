cmake_minimum_required(VERSION 3.8)
project(Prog1)

set(CMAKE_CXX_STANDARD 11)

set(SOURCE_FILES
        freeglut.h
        freeglut_ext.h
        freeglut_std.h
        glut.h
        sample.cpp)

add_executable(Prog1 ${SOURCE_FILES})