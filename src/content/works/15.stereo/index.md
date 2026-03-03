---
title: Stereo
date: May 2016
lead: Modern Dance with 3D Projections
tags:
  - Modern Dance
  - Set Design
  - 3D Stereography
  - Interactive
  - OpenFrameworks
  - Featured
technologies:
  - OpenFrameworks
  - Stereography
  - Voronoi Tessellation
  - Leap Motion
  - GLSL Shaders
materials: Spectral comb filters and 3D glasses, projectors, bespoke software
partners: Johan Bichel Lindegaard, Tina Tarpgaard, Deborah Vlaeymans
client: Recoil Performance Group
github:
  user: RecoilPerformanceGroup
  repo: Stereo2016
photocredits: Jan Vesala
appearances:
  - date: May 2016
    occasion: Click Festival
    place: Kulturværftet, Elsinore
    url: http://clickfestival.dk/
  - date: June 2016
    occasion: CPH Stage Festival
    place: Takkelloftet, Operaen / The Danish Royal Theatre, Copenhagen
    url: https://kglteater.dk/det-sker/sason-2015-2016/ballet/stereo/
  - date: August 2016
    occasion: 2016 Digital Art Festival
    place: TaiPei, Taiwan
    url: null
  - date: May 2017
    occasion: National Tour
    place: Denmark
    url: null
videos:
  - id: "220616485"
    title: 2D video documentation by Jan Vesala
---

> STEREO is a powerful pertubation of the senses presented by award winning recoil performance group. A graphic universe in 3D and an intense duet between man and woman, between reality and illusion. With STEREO recoil performance group adds a new dimension to their frontiering video scenographies: Thus, the space around the dancers' bodies collapses and expands indefinitely; it curls up or slips off the stage tempting the audience to reach out.


## Concept & Motivation

"Stereo" grew out of my ongoing experiments with trompe l’oeil projections and the spectral comb filter stereography we tried in "Træ." I wanted to see if we could create a sense of real depth on stage—where the space itself could open up, surfaces could shift and recombine, and the audience would feel drawn into a living, responsive environment.

The idea was simple: could we make the stage itself breathe and change, not just as a backdrop but as a living part of the performance? We wanted the audience to feel the space open up, dissolve, and recombine, all in response to the dancers’ movement.

## Collaboration & Process

The dancers didn’t see the illusion themselves, so their focus stayed on movement and presence. Tina Tarpgaard, the choreographer, was patient, insiting and knowledgeable about the technical side as allways. We spent a lot of time together, working out how the movement could interact with the projected space, and how to solve problems as they came up. One of the trickiest moments was when we tried to merge two dancers into one shimmering figure. Tina kept pushing for a solution, and together we found a way to make the illusion work without causing discomfort and eye strain for the audience.

## Technical Approach

We wrote all the software in C++ using openFrameworks, with custom OpenGL frustum manipulations and our own projector mapping UI for calibration. The graphics were kept minimal and fast, so everything could respond in real time. For cueing and timing, we used qLab to send fades and cues to the software over OSC. During rehearsals, we would adjust parameters with our own GUI and sent them to qLab via the OSC api, so we could keep everything in sync with sound and light.

The scenography was built from voronoi volumes, animated and reconfigured during the show using ofxVoro, ofxCGAL, and ofxEasing. A Leap Motion OSC controller gave us 3D position input, and GLSL shaders handled the stereographic rendering. Getting the perceptual merging illusion right meant a lot of trial and error, and close work between code and choreography.

## Performance Highlights

The moment when the two dancers merged into one shimmering body stands out for me. It took a lot of back-and-forth between code and movement, but when it worked, it felt like the technology and choreography were really speaking to each other.