---
title: Fuck You Buddy
date: Feb 2010
lead: The game is on the stage
tags:
  - Modern Dance
  - Projection Mapping
  - Infrared Tracking
  - Interactive
  - Set Design
  - OpenFrameworks
  - Arduino
materials: Infrared camera, videoprojectors, custom software
partners: Jonas Jongejan, Tina Tarpgaard
client: Recoil Performance Group
photocredits: Søren Knud Christensen and Søren Meisner
appearances:
  - date: Dec 2010
    occasion: ICE HOT - Nordic Dance Platform
    place: Stockholm
    url: http://www.nordicdanceplatform.com/
  - date: Oct 2010
    occasion: Intercity Festival
    place: Teatro Studio di Scandicci, Florence
    url: http://www.teatrodellalimonaia.it/Limonaia/Intercity/IntHome.html
  - date: Feb 2010
    occasion: Premiere
    place: Dansehallerne, Copenhagen
    url: http://www.dansescenen.dk/side.asp?side=1&id=503
videos:
  - id: "10865845"
    title: Full performance documentation by Recoil Performance Group
  - id: "8597947"
    title: Trailer by Søren Meisner
---

With graphics and choreography inspired by the totalitarian collectivism in games like “Lemming’s” to the anarchistic individualism in “GTA”, “Fuck you Buddy” is a performance for the sake of the game, a game about winning at any cost and about being born inherently selfish…..or?

The fusion of “game theory” (a mathematical attempt to pre dict human behaviour) and the dramaturgical development in computer games in the last decade, is the conceptual and visual frame of this performance for 4 dancers and an interacting video scenography.

Fuck You Buddy was from the outset designed to be tour-friendly and as such our software is flexible and easily adjustable for different stage dimensions.

The software for Fuck You Buddy builds on our move into Cocoa and Objective-C from [Frost](/works/frost). We integrate [openFrameworks](http://openframeworks.cc) into a cocoa-based Mac OS X Snow Leopard application running on a mac pro, seeing the dancers through a Point Grey Flea 2 IEEE 1394b camera, showing the openGL graphics using two video projectors, shooting diagonally onto a white square of dance floor. The projectors have 0.7 wide angle optics and the software is qued from qLab using apple’s midi networking capabilities. We control the led lighting, ir floods, lasers and tracking leds with arduino’s spewing dmx and using xBee’s.