---
title: Øresund Bridge
date: October 2018
lead: Interactive Installation
tags:
  - Projection Mapping
  - Installation
  - Interactive
  - OpenFrameworks
  - Featured
technologies:
  - OpenFrameworks
  - RealSense
  - Mapamok
  - GLSL Shaders
  - Point Cloud Tracking
materials: Wood, RealSense Camera, Mac Pro, Videoprojectors, Bespoke Software
partners: Deborah Vlaeymans, Johan Bichel Lindegaard, Hugo Mulder
client: ARUP / Victoria and Albert Museum
github:
  user: olekristensen
  repo: oresund
photocredits: Ole Kristensen
appearances:
  - date: October 2018
    occasion: Ove Arup & The Philosophy of Total Design
    place: DAC, Copenhagen
    url: https://dac.dk/udstillinger/ove-arup-the-philosophy-of-total-design/
videos:
  - id: '315770945'
    title: Video documentation by Ole Kristensen
---

Øresund Bridge is an immersive installation that describes some of the key contributions from ARUP to the design of the iconic Oresund bridge between Denmark and Sweden.

When the Victoria and Albert Museum exhibition 'Ove Arup & The Philosophy of Total Design' visited Copenhagen at DAC (Danish Architecture Center) they wanted to add piece with a local focus.

## Design Concept

The concept was to try and build a particularily elegant part of the outrigger structure from the cable girders in 1:1 scale. The elegant outriggers enable the elegant harp shaped stay cables that have become a recognised design feature of the iconic bridge.

The space itself was small and confined and we challenged ourselves to open it up with a ambient music composistion based on recordings of bridge traffic, sea and wind noise.

## Technical Approach

The installation features a bespoke point cloud tracker that works in concert with two projections to reproduce a dynamic first-person view to scale, effectively suspending the vistor from the side of the bridge and offering a stylized view that is at real scale as the basis for a graphical projection mapped explainer.

The software integrates Mapamok (projection mapping framework by Kyle McDonald, with a multi-projector fork by Dan Moore) and ofxPBR (physically based rendering by Yasuhiro Hoshino) into an openFrameworks application. An Intel RealSense camera provides the real-time head tracking for the first-person perspective effect. Custom GLSL shaders handle the projection-mapped rendering.

The piece was commisioned by ARUP.
