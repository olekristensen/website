---
title: Multiplicity
date: Nov 2013
lead: Interactive Light Mapping Sculpture
tags:
  - Installation
  - Kinect
  - Light
  - Interactive
  - OpenFrameworks
  - Featured
technologies:
  - OpenFrameworks
  - Kinect
  - ProCamToolkit
  - Mapamok
  - C++
materials: Kinect, folded steel plate, projectors, custom software
partners: Obscura
github:
  user: olekristensen
  repo: Multiplicity
photocredits: Ole Kristensen
appearances:
  - date: Nov 2013
    occasion: Permanent installation
    place: Fremtidens Borgerhus, Vallensbæk
    url: null
videos:
  - id: '89381283'
    title: Development screencast
---

Moving in front of the sculpture modulates the reflected light. It looks as if people are themselves ligths, their color shining on the triangualar facets on the wall.

## Commission

Multiplicity was commissioned by Vallensbæk Municipality for their new combined service center, public library and citizens' house.

In collaboration with obscura (dk) I proposed a sculpture consisting of a physical object, folded from laser-cut steel, a couple of projectors, a Kinect and a computer.

The sculpture acts as a platform for interactive software artworks, the first permanent artwork, Multiplicity, becoming just one of the ways to reflect the citizens' movements in their new house.

## Technical Approach

The software started as a fork of Kyle McDonald's ProCamToolkit, extended for a dual-projector setup with heterogeneous optics. It combines Kinect-based tracking with Mapamok's projection mapping calibration — a tool for solving projector position from correspondences between a 3D COLLADA model and projected points. Written in C++ with openFrameworks.

## Acknowledgements

Credits go to Kyle McDonald for his work on Mapamok, an integral part of making this happen on a short notice.
