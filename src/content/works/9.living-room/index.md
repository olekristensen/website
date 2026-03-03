---
title: Living Room
date: April 2012
lead: Award winning trompe-l'œil on the dance floor
tags:
  - Modern Dance
  - Projection Mapping
  - Infrared Tracking
  - Interactive
  - Set Design
  - Featured
  - OpenFrameworks
technologies:
  - OpenFrameworks
  - Infrared Tracking
  - Projection Mapping
  - Cocoa
  - MIDI
  - OSC
materials: Infrared camera, videoprojectors, custom software
partners: Jonas Jongejan, Tina Tarpgaard
client: Recoil Performance Group
github:
  user: RecoilPerformanceGroup
  repo: Livingroom
photocredits: Søren Meisner
appearances:
  - date: April 2014
    occasion: National Tour
    place: Denmark
    url: null
  - date: Dec 2012
    occasion: ICE HOT, Nordic Dance Platform
    place: Helsinki
    url: http://www.nordicdanceplatform.com/program_on_stage/living_room.html
  - date: Nov 2012
    occasion: Tempel Tanzfestival
    place: ZKM, Karlsruhe
    url: http://www.kulturverein-tempel.de/index.php?id=356
  - date: Nov 2012
    occasion: Performance
    place: Dansehallerne, Copenhagen
    url: http://dansehallerne.dk
  - date: April 2012
    occasion: Premiere
    place: Dansehallerne, Copenhagen
    url: http://dansehallerne.dk
videos:
  - id: "220621296"
    title: Trailer by Søren Meisner
  - id: "220621653"
    title: Full performance documentation by Recoil Performance Group
---

Living Room is a performance of an hour with 3 dancers on stage. The projected scenography evolves during the whole performance. Most of the video scenography is made of a polygon world that is randomly generated in the beginning of each performance. During the show it is being crumbled and manipulated live by the dancers.

## Scenographic Concept

For this performance I co-developed the scenographic concept and implemented some new concepts in our software. Most notable a simple method of independently rotating the z-axis of a plane to allow for trompe-l'œil effects of eg. holes in the floor from a movable vantage point in the audience seating.

## Software

The software for Living Room builds further on Cocoa and Objective-C wrapper for openFrameworks; [ofxCocoaPlugins](https://github.com/HalfdanJ/ofxCocoaPlugins). We intergrate [openFrameworks](http://openframeworks.cc) into a cocoa-based Mac OS X Lion application running on a mac pro, seeing the dancers through a Allied Vision Technologies Manta camera, showing the openGL graphics using two video projectors, shooting diagonally onto the white dance floor. The two projectors have 0.7 wide angle optics and the software is qued from qLab using apple’s midi networking capabilities.
ofxCocoaPlugins — a MIDI and OSC-addressable wrapper that integrates calibration of infrared tracking, projection mapping and Cocoa — has been the backbone of all Recoil Performance Group scenographies.