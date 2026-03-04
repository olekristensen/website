---
title: Malpais
date: March 2011
lead: Projections of bent voices
tags:
  - Modern Dance
  - Projection Mapping
  - Kinect
  - Interactive
  - Generative
  - Set Design
  - OpenFrameworks
technologies:
  - OpenFrameworks
  - Kinect
  - Projection Mapping
  - Cocoa
  - 2D Physics Engine
materials: Kinect, videoprojectors, custom software
partners: Jonas Jongejan, Tina Tarpgaard
client: Recoil Performance Group
github:
  user: RecoilPerformanceGroup
  repo: Malpais
photocredits: Søren Meisner
appearances:
  - date: March 2011
    occasion: Premiere
    place: Dansehallerne, Copenhagen
    url: http://dansehallerne.dk
videos:
  - id: '20597987'
    title: Trailer by Søren Meisner
  - id: '27236991'
    title: Full performance documentation by Recoil Performance Group
---

With an outset in interview material this performance was a departure from our earlier works in Recoil Performance Group.

My role was to create the visual expression of scenes involving the recorded material as interpreted by the sound artist Pelle Skovmand. One of the elements were elastic sound-waves that would bend around the dancers. Another was a giant, mobile box with a plexiglass backprojection.

Through documentary style video and a physical research on the anatomy of fear, the performance combines reality, satire and fiction to address one of the most used power tools in history: Our fear.

## Technical Approach

The software for Malpais builds on our move into Cocoa and Objective-C from [Fuck You Buddy](/works/fuck-you-buddy). We intergrate [openFrameworks](http://openframeworks.cc) into a cocoa-based Mac OS X Snow Leopard application running on a mac pro, seeing the dancers through a Kinect camera, showing the openGL graphics using a video projector, shooting diagonally onto the white line dance floor.
We also built the mobile box with a built-in back projection against a transparent screen, strong enough for the dancers to lean against. The projectors have 0.7 wide angle optics and the software is qued from qLab using apple’s midi networking capabilities.
The codebase uses a plugin architecture for individual scenes, and a 2D physics engine (ofxRuiPhysics2d) drives the elastic sound-wave visuals that bend around the dancers.
