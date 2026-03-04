---
title: Frost
date: Oct 2009
lead: Modern dance on a melting floor
tags:
  - Modern Dance
  - Projection Mapping
  - Infrared Tracking
  - Arduino
  - Interactive
  - Set Design
  - OpenFrameworks
technologies:
  - OpenFrameworks
  - Infrared Tracking
  - Projection Mapping
  - Arduino
  - Cocoa
  - LED Lighting
materials: Infrared camera, videoprojector, bespoke software
partners: Jonas Jongejan, Tina Tarpgaard
client: Recoil Performance Group & Danish Dance Theatre
photocredits: Søren Knud Christensen and Nelson Rodrigues-Smith
appearances:
  - date: May 2011
    occasion: Amman International Dance Festival
    place: Jordan
    url: http://zakharefinmotion.blogspot.com/
  - date: Nov 2010
    occasion: Repremiere
    place: Dansehallerne, Copenhagen
    url: null
  - date: May 2010
    occasion: Excerpt Performed
    place: Reumert Awards Ceremony, Royal Danish Theatre, Copenhagen
    url: http://www.aaretsreumert.dk/index.dsp?page=4433
  - date: October 2009
    occasion: Premiere
    place: Hippodromen, Folketeatret, Copenhagen
    url: null
videos:
  - id: '9098395'
    title: Documentation of full performance by Tina Tarpgaard
---

We created a universe of frozen bodies, melting ice and dripping waters. The scenography is constituted by video projections in concert with Andreas Buhl‘s lighting design, using led based light sources to accomodate the intricacies of infrared tracking. In some scenes both light and projections are mapped to the tracked positions of the dancers.

Frost was from the outset designed to be tour-friendly and as such our software has to be flexible and easily adjustable for different stage dimensions.

## Software

The software for Frost intergrates [openFrameworks](http://openframeworks.cc) into a cocoa-based Mac OS X Snow Leopard application, running on a mac pro, seeing the dancers through three Point Grey Flea 2 IEEE 1394b cameras, showing the openGL graphics using a single video projector with a 0.7 wide angle optics and qued from qLab using apple’s midi networking capabilities.
