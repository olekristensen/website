<script module lang="ts">
	export interface ImageSrcSet {
		sizes: { width: number; url: string }[];
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	interface Props {
		images: ImageSrcSet[];
		cellCount?: number;
		cellFlipDuration?: number;
		waveDelay?: number;
		holdDuration?: number;
		refractMax?: number;
		mouseRadius?: number;
		shadeMaxAlpha?: number;
		bottomBrightness?: number;
		relaxationIterations?: number;
		onready?: () => void;
	}

	let {
		images: imageSrcSets,
		cellCount = 32,
		cellFlipDuration = 1200,
		waveDelay = 180,
		holdDuration = 10000,
		refractMax = 70,
		mouseRadius = 280,
		shadeMaxAlpha = 0.35,
		bottomBrightness = $bindable(0.5),
		relaxationIterations = 5,
		onready
	}: Props = $props();

	let containerEl: HTMLDivElement;

	// ━━━ GLSL Shaders ━━━

	const vertexShader = /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	// Full-screen fragment shader that:
	// 1. Generates Voronoi cells from seed uniforms
	// 2. Applies per-cell refraction offset to image sampling
	// 3. Computes matte glass shading (soft shadows + subtle highlight)
	// 4. Handles crossfade transitions with BFS wave
	const fragmentShader = /* glsl */ `
		precision highp float;

		varying vec2 vUv;

		uniform vec2 uResolution;
		uniform sampler2D uTexCurrent;
		uniform sampler2D uTexNext;
		uniform float uTexCurrentAspect;
		uniform float uTexNextAspect;

		uniform vec2 uSeeds[128];
		uniform int uSeedCount;
		uniform vec2 uRefractions[128];
		uniform float uCellActivity[128];
		uniform float uCellFlipTime[128];

		uniform float uTransitionElapsed;
		uniform float uFlipDuration;

		uniform float uShadeMax;
		uniform vec2 uLightDir;
		uniform float uTime;

		vec2 coverUV(vec2 uv, float imgAspect, float screenAspect) {
			vec2 s = uv;
			if (imgAspect > screenAspect) {
				float scale = screenAspect / imgAspect;
				s.x = s.x * scale + (1.0 - scale) * 0.5;
			} else {
				float scale = imgAspect / screenAspect;
				s.y = s.y * scale + (1.0 - scale) * 0.5;
			}
			return s;
		}

		void main() {
			vec2 uv = vUv;
			float screenAspect = uResolution.x / uResolution.y;
			float aspect = screenAspect;

			// Find closest Voronoi cell (all array access via loop variable i)
			int closestCell = 0;
			float minDist = 1e10;
			float secondDist = 1e10;
			vec2 refraction = vec2(0.0);
			float activity = 0.0;
			float cellFlipTime = -1.0;
			vec2 scaled = uv * vec2(aspect, 1.0);

			for (int i = 0; i < 128; i++) {
				if (i >= uSeedCount) break;
				vec2 seedScaled = uSeeds[i] * vec2(aspect, 1.0);
				float d = distance(scaled, seedScaled);
				if (d < minDist) {
					secondDist = minDist;
					minDist = d;
					closestCell = i;
					refraction = uRefractions[i];
					activity = uCellActivity[i];
					cellFlipTime = uCellFlipTime[i];
				} else if (d < secondDist) {
					secondDist = d;
				}
			}

			// Per-cell refraction: partially visible at rest, full with activity
			vec2 refractedUV = uv + refraction * activity;

			vec2 covUV = coverUV(refractedUV, uTexCurrentAspect, screenAspect);
			vec3 colorCurrent = texture2D(uTexCurrent, covUV).rgb;

			vec3 finalColor = colorCurrent;

			// Per-cell BFS transition
			if (uTransitionElapsed >= 0.0 && cellFlipTime >= 0.0) {
				vec2 covUVNext = coverUV(refractedUV, uTexNextAspect, screenAspect);
				vec3 colorNext = texture2D(uTexNext, covUVNext).rgb;

				float cellElapsed = uTransitionElapsed - cellFlipTime;
				if (cellElapsed >= uFlipDuration) {
					finalColor = colorNext;
				} else if (cellElapsed > 0.0) {
					float progress = cellElapsed / uFlipDuration;
					progress = progress * progress * (3.0 - 2.0 * progress);
					finalColor = mix(colorCurrent, colorNext, progress);
				}
			}

			// Sharp edge line between cells
			float edgeDelta = secondDist - minDist;
			float pixelSize = 1.0 / min(uResolution.x, uResolution.y);
			float edge = smoothstep(0.0, pixelSize * 2.0, edgeDelta);
			finalColor *= mix(1.0 - 0.4 * activity, 1.0, edge);

			// Flat glass shading — uniform tint per cell based on refraction angle vs light
			if (activity > 0.005) {
				float refLen = length(refraction);
				vec2 cellNormal = refLen > 0.001 ? refraction / refLen : vec2(0.0);
				float diffuse = dot(cellNormal, uLightDir);
				float shade = diffuse * activity * uShadeMax;
				finalColor += vec3(shade);
			}

			gl_FragColor = vec4(finalColor, 1.0);
		}
	`;

	onMount(() => {
		if (!containerEl) return;

		const DPR = Math.min(window.devicePixelRatio || 1, 2);

		// ── Three.js setup ──
		const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
		renderer.setPixelRatio(DPR);
		renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
		containerEl.appendChild(renderer.domElement);
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.inset = '0';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
		camera.position.z = 1;

		// Uniform arrays — always 128 to match shader declarations
		const maxCells = Math.min(cellCount, 128);
		const seedsArray = new Float32Array(128 * 2);
		const refractionsArray = new Float32Array(128 * 2);
		const activityArray = new Float32Array(128);
		const cellFlipTimeArray = new Float32Array(128).fill(-1);

		const uniforms: Record<string, THREE.IUniform> = {
			uResolution: { value: new THREE.Vector2(1, 1) },
			uTexCurrent: { value: new THREE.Texture() },
			uTexNext: { value: new THREE.Texture() },
			uTexCurrentAspect: { value: 1.0 },
			uTexNextAspect: { value: 1.0 },
			uSeeds: { value: seedsArray },
			uSeedCount: { value: maxCells },
			uRefractions: { value: refractionsArray },
			uCellActivity: { value: activityArray },
			uCellFlipTime: { value: cellFlipTimeArray },
			uTransitionElapsed: { value: -1.0 },
			uFlipDuration: { value: cellFlipDuration },
			uShadeMax: { value: shadeMaxAlpha },
			uLightDir: { value: new THREE.Vector2(0.6, -0.8) },
			uTime: { value: 0.0 }
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms
		});

		const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
		scene.add(quad);

		// ── State ──
		let W = 0, H = 0;
		let baseSeeds: { x: number; y: number }[] = [];
		let seeds: { x: number; y: number }[] = [];
		let targetSeeds: { x: number; y: number }[] = [];
		let cellRefractionData: { dx: number; dy: number }[] = [];
		let cellActivityLevels = new Float32Array(128);
		let cellActivityVelocities = new Float32Array(128);
		let cellAttackRates = new Float32Array(128);
		let cellDecayRates = new Float32Array(128);

		let loadedTextures: THREE.Texture[] = [];
		let loadedImages: HTMLImageElement[] = [];
		let currentIdx = 0;
		let ready = false;
		let activeResolution = 0;

		let pageMouseX = -9999, pageMouseY = -9999;
		let canvasMouseX = -9999, canvasMouseY = -9999;
		let mouseOverCanvas = false;
		let lastStimulusTime = 0;

		// Transition
		let transitioning = false;
		let transitionStart = 0;
		let fromIdx = 0, toIdx = 0;
		let waveOriginX = 0.5, waveOriginY = 0.5;
		let slideshowInterval: ReturnType<typeof setInterval> | null = null;
		let maxFlipTime = 0;

		// Adjacency for BFS
		let adjacency: number[][] = [];

		// Activity
		const ACTIVITY_ATTACK = 0.15;
		const ACTIVITY_DECAY = 0.008;
		const ACTIVITY_GRACE = 250;
		const SEED_DAMPING = 0.12;
		const WAVE_RING_WIDTH = 0.2; // in UV space
		let activityLevel = 0;
		let waveCursorActive = false;
		let waveRadius = 0;
		let waveSpeed = 0.0004; // UV units per ms

		// Settle wave
		let settleWaveActive = false;
		let settleWaveStart = 0;
		const SETTLE_DAMPING = 0.03;

		// ── Voronoi seed generation + Lloyd relaxation ──
		function generateSeeds() {
			let rng = (Math.random() * 2147483646 + 1) | 0;
			const rand = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
			baseSeeds = [];
			for (let i = 0; i < maxCells; i++) {
				baseSeeds.push({ x: rand(), y: rand() });
			}
			// Lloyd relaxation
			const fullIters = Math.floor(relaxationIterations);
			const frac = relaxationIterations - fullIters;
			const totalIters = frac > 0 ? fullIters + 1 : fullIters;
			for (let iter = 0; iter < totalIters; iter++) {
				const blend = iter < fullIters ? 1 : frac;
				const regions = baseSeeds.map(() => ({ sx: 0, sy: 0, count: 0 }));
				const step = 0.01;
				for (let y = 0; y < 1; y += step) {
					for (let x = 0; x < 1; x += step) {
						let minD = Infinity, minI = 0;
						const aspect = W > 0 && H > 0 ? W / H : 1;
						for (let i = 0; i < baseSeeds.length; i++) {
							const dx = (x - baseSeeds[i].x) * aspect;
							const dy = y - baseSeeds[i].y;
							const d = dx * dx + dy * dy;
							if (d < minD) { minD = d; minI = i; }
						}
						regions[minI].sx += x;
						regions[minI].sy += y;
						regions[minI].count++;
					}
				}
				for (let i = 0; i < baseSeeds.length; i++) {
					if (regions[i].count > 0) {
						const cx = regions[i].sx / regions[i].count;
						const cy = regions[i].sy / regions[i].count;
						baseSeeds[i].x += (cx - baseSeeds[i].x) * blend;
						baseSeeds[i].y += (cy - baseSeeds[i].y) * blend;
					}
				}
			}
		}

		function generateRefractions() {
			let rng = 123;
			const rand = () => { rng = (rng * 16807) % 2147483647; return (rng / 2147483647) * 2 - 1; };
			const rand01 = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
			cellRefractionData = [];
			for (let i = 0; i < maxCells; i++) {
				// Refraction in UV space (pixel offset / resolution)
				const scale = W > 0 ? refractMax / W : 0.02;
				cellRefractionData.push({ dx: rand() * scale, dy: rand() * scale });
				cellAttackRates[i] = 0.02 + rand01() * 0.04;
				cellDecayRates[i] = 0.004 + rand01() * 0.012;
			}
		}

		function computeAdjacency() {
			adjacency = baseSeeds.map(() => []);
			const step = 0.02;
			const aspect = W > 0 && H > 0 ? W / H : 1;
			const grid: Record<string, number> = {};
			for (let y = 0; y < 1; y += step) {
				for (let x = 0; x < 1; x += step) {
					let minD = Infinity, minI = 0;
					for (let i = 0; i < baseSeeds.length; i++) {
						const dx = (x - baseSeeds[i].x) * aspect;
						const dy = y - baseSeeds[i].y;
						const d = dx * dx + dy * dy;
						if (d < minD) { minD = d; minI = i; }
					}
					const gx = Math.floor(x / step), gy = Math.floor(y / step);
					grid[`${gx},${gy}`] = minI;
				}
			}
			const pairs = new Set<string>();
			for (let y = 0; y < 1; y += step) {
				for (let x = 0; x < 1; x += step) {
					const gx = Math.floor(x / step), gy = Math.floor(y / step);
					const cell = grid[`${gx},${gy}`];
					for (const [ddx, ddy] of [[1, 0], [0, 1]] as const) {
						const key = `${gx + ddx},${gy + ddy}`;
						if (key in grid && grid[key] !== cell) {
							const a = Math.min(cell, grid[key]);
							const b = Math.max(cell, grid[key]);
							const pk = `${a}-${b}`;
							if (!pairs.has(pk)) {
								pairs.add(pk);
								adjacency[a].push(b);
								adjacency[b].push(a);
							}
						}
					}
				}
			}
		}

		// ── Upload seeds to GPU ──
		function syncUniforms() {
			const count = Math.min(seeds.length, maxCells);
			for (let i = 0; i < count; i++) {
				seedsArray[i * 2] = seeds[i].x;
				seedsArray[i * 2 + 1] = seeds[i].y;
				refractionsArray[i * 2] = cellRefractionData[i].dx;
				refractionsArray[i * 2 + 1] = cellRefractionData[i].dy;
				activityArray[i] = cellActivityLevels[i];
			}
			uniforms.uSeeds.value = seedsArray;
			uniforms.uRefractions.value = refractionsArray;
			uniforms.uCellActivity.value = activityArray;
			uniforms.uCellFlipTime.value = cellFlipTimeArray;
			material.uniformsNeedUpdate = true;
		}

		// ── Activity update ──
		function updateActivity(now: number) {
			const timeSinceStimulus = now - lastStimulusTime;
			const stimulusActive = timeSinceStimulus < ACTIVITY_GRACE;
			const aspect = W > 0 && H > 0 ? W / H : 1;

			if (stimulusActive || waveCursorActive) {
				activityLevel = Math.min(1, activityLevel + ACTIVITY_ATTACK);
			} else {
				activityLevel = Math.max(0, activityLevel - ACTIVITY_DECAY);
			}

			if (transitioning) {
				waveRadius = (now - transitionStart) * waveSpeed;
				waveCursorActive = true;
			} else if (settleWaveActive) {
				waveRadius = (now - settleWaveStart) * waveSpeed;
				waveCursorActive = true;
				const maxDist = Math.sqrt(2) * Math.max(aspect, 1);
				if (waveRadius > maxDist + WAVE_RING_WIDTH) {
					let allQuiet = true;
					for (let i = 0; i < maxCells; i++) {
						if (cellActivityLevels[i] > 0.005) { allQuiet = false; break; }
					}
					if (allQuiet) {
						settleWaveActive = false;
						waveCursorActive = false;
						computeAdjacency();
					}
				}
			} else {
				waveCursorActive = false;
			}

			const seedCount = seeds.length;
			for (let i = 0; i < seedCount; i++) {
				let targetActivity = 0;
				const sx = seeds[i].x, sy = seeds[i].y;

				if (stimulusActive && mouseOverCanvas) {
					const mx = canvasMouseX / W, my = 1 - canvasMouseY / H;
					const dx = (sx - mx) * aspect;
					const dy = sy - my;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const mouseRadUV = mouseRadius / Math.max(W, 1);
					if (dist < mouseRadUV) {
						const proximity = 1 - dist / mouseRadUV;
						targetActivity = Math.max(targetActivity, proximity * proximity);
					}
				}

				if (waveCursorActive) {
					const dx = (sx - waveOriginX) * aspect;
					const dy = sy - waveOriginY;
					const cellDist = Math.sqrt(dx * dx + dy * dy);
					const ringDist = Math.abs(cellDist - waveRadius);
					if (ringDist < WAVE_RING_WIDTH) {
						const proximity = 1 - ringDist / WAVE_RING_WIDTH;
						targetActivity = Math.max(targetActivity, proximity * proximity);
					}
				}

				const current = cellActivityLevels[i];
				const diff = targetActivity - current;
				const rate = diff > 0 ? cellAttackRates[i] : cellDecayRates[i];
				cellActivityVelocities[i] = cellActivityVelocities[i] * 0.8 + diff * rate * 0.8;
				cellActivityLevels[i] = Math.max(0, Math.min(1, current + cellActivityVelocities[i]));
				if (cellActivityLevels[i] < 0.01 && Math.abs(cellActivityVelocities[i]) < 0.002 && targetActivity === 0) {
					cellActivityLevels[i] = 0;
					cellActivityVelocities[i] = 0;
				}
			}
		}

		// ── Seed animation ──
		function updateSeedTargets() {
			if (!containerEl) return;
			const rect = containerEl.getBoundingClientRect();
			canvasMouseX = pageMouseX - rect.left;
			canvasMouseY = pageMouseY - rect.top;
			mouseOverCanvas = canvasMouseX >= 0 && canvasMouseX <= W && canvasMouseY >= 0 && canvasMouseY <= H;

			const aspect = W > 0 && H > 0 ? W / H : 1;
			const mouseRadUV = mouseRadius / Math.max(W, 1);

			for (let i = 0; i < baseSeeds.length; i++) {
				const bx = baseSeeds[i].x, by = baseSeeds[i].y;
				let tx = bx, ty = by;

				if (activityLevel > 0.01 && mouseOverCanvas) {
					const mx = canvasMouseX / W, my = 1 - canvasMouseY / H;
					const dx = (bx - mx) * aspect;
					const dy = by - my;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < mouseRadUV && dist > 0) {
						const force = (1 - dist / mouseRadUV) * activityLevel;
					const strength = 0.07;
						tx += (dx / dist) * force * strength;
						ty += (dy / dist) * force * strength;
					}
				}

				if (waveCursorActive) {
					const dx = (bx - waveOriginX) * aspect;
					const dy = by - waveOriginY;
					const cellDist = Math.sqrt(dx * dx + dy * dy);
					const ringDist = Math.abs(cellDist - waveRadius);
					if (ringDist < mouseRadUV && cellDist > 0.001) {
						const force = 1 - ringDist / mouseRadUV;
					tx += (dx / cellDist) * force * 0.03;
					ty += (dy / cellDist) * force * 0.03;
					}
				}

				targetSeeds[i] = { x: tx, y: ty };
			}
		}

		function animateSeeds() {
			let moved = false;
			const damping = settleWaveActive ? SETTLE_DAMPING : SEED_DAMPING;
			for (let i = 0; i < seeds.length; i++) {
				const dx = targetSeeds[i].x - seeds[i].x;
				const dy = targetSeeds[i].y - seeds[i].y;
				if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
					seeds[i].x += dx * damping;
					seeds[i].y += dy * damping;
					moved = true;
				} else {
					seeds[i].x = targetSeeds[i].x;
					seeds[i].y = targetSeeds[i].y;
				}
			}
		}

		// ── Transition ──
		function triggerTransition() {
			if (loadedTextures.length < 2) return;

			if (settleWaveActive) computeAdjacency();

			fromIdx = currentIdx;
			toIdx = (currentIdx + 1) % loadedTextures.length;

			// Find start cell — closest to mouse or random
			let startCell = 0;
			if (mouseOverCanvas) {
				waveOriginX = canvasMouseX / W;
				waveOriginY = 1 - canvasMouseY / H;
				let minD = Infinity;
				for (let i = 0; i < seeds.length; i++) {
					const dx = seeds[i].x - waveOriginX;
					const dy = seeds[i].y - waveOriginY;
					const d = dx * dx + dy * dy;
					if (d < minD) { minD = d; startCell = i; }
				}
			} else {
				startCell = Math.floor(Math.random() * seeds.length);
				waveOriginX = seeds[startCell].x;
				waveOriginY = seeds[startCell].y;
			}

			// BFS to compute per-cell flip times
			cellFlipTimeArray.fill(-1);
			cellFlipTimeArray[startCell] = 0;
			const queue = [startCell];
			maxFlipTime = 0;
			while (queue.length > 0) {
				const cell = queue.shift()!;
				const nextTime = cellFlipTimeArray[cell] + waveDelay;
				if (adjacency[cell]) {
					for (const neighbor of adjacency[cell]) {
						if (cellFlipTimeArray[neighbor] < 0) {
							cellFlipTimeArray[neighbor] = nextTime;
							if (nextTime > maxFlipTime) maxFlipTime = nextTime;
							queue.push(neighbor);
						}
					}
				}
			}

			uniforms.uTexCurrent.value = loadedTextures[fromIdx];
			uniforms.uTexNext.value = loadedTextures[toIdx];
			if (loadedImages[fromIdx]) {
				uniforms.uTexCurrentAspect.value = loadedImages[fromIdx].naturalWidth / loadedImages[fromIdx].naturalHeight;
			}
			if (loadedImages[toIdx]) {
				uniforms.uTexNextAspect.value = loadedImages[toIdx].naturalWidth / loadedImages[toIdx].naturalHeight;
			}

			transitioning = true;
			transitionStart = performance.now();
			settleWaveActive = false;
			resetSlideshowTimer();
		}

		function resetSlideshowTimer() {
			if (slideshowInterval) clearInterval(slideshowInterval);
			slideshowInterval = setInterval(triggerTransition, holdDuration);
		}

		// ── Light direction from mouse ──
		function updateLightDir() {
			if (mouseOverCanvas) {
				const mx = canvasMouseX / W - 0.5;
				const my = -(canvasMouseY / H - 0.5);
				const len = Math.sqrt(mx * mx + my * my);
				if (len > 0.01) {
					uniforms.uLightDir.value.set(mx / len, my / len);
				}
			}
		}

		// ── Resize ──
		function resize() {
			if (!containerEl) return;
			const rect = containerEl.getBoundingClientRect();
			const prevW = W, prevH = H;
			W = rect.width;
			H = rect.height;
			if (W === 0 || H === 0) return;

			renderer.setSize(W, H);
			uniforms.uResolution.value.set(W, H);

			if (baseSeeds.length === maxCells && prevW > 0 && prevH > 0) {
				// Seeds are in normalised space, no rescaling needed
			} else {
				generateSeeds();
				seeds = baseSeeds.map(s => {
					const angle = Math.random() * Math.PI * 2;
					const dist = 0.05 + Math.random() * 0.15;
					return { x: s.x + Math.cos(angle) * dist, y: s.y + Math.sin(angle) * dist };
				});
				targetSeeds = baseSeeds.map(s => ({ x: s.x, y: s.y }));
				generateRefractions();
			}
			computeAdjacency();
		}

		// ── Image loading ──
		function pickResolution(canvasWidth: number): number {
			const needed = canvasWidth * DPR;
			if (imageSrcSets.length === 0) return 0;
			const available = imageSrcSets[0].sizes.map(s => s.width).sort((a, b) => a - b);
			for (const w of available) {
				if (w >= needed) return w;
			}
			return available[available.length - 1];
		}

		function urlForResolution(srcSet: ImageSrcSet, resolution: number): string {
			const exact = srcSet.sizes.find(s => s.width === resolution);
			if (exact) return exact.url;
			const sorted = [...srcSet.sizes].sort((a, b) => Math.abs(a.width - resolution) - Math.abs(b.width - resolution));
			return sorted[0]?.url ?? '';
		}

		function loadImages() {
			loadedImages = [];
			loadedTextures = [];
			ready = false;
			let loaded = 0;
			const total = imageSrcSets.length;
			if (total === 0) {
				ready = true;
				settleWaveActive = true;
				settleWaveStart = performance.now();
				waveOriginX = Math.random();
				waveOriginY = Math.random();
				requestAnimationFrame(mainLoop);
				return;
			}
			const res = pickResolution(W || 960);
			activeResolution = res;
			imageSrcSets.forEach((srcSet, i) => {
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.src = urlForResolution(srcSet, res);
				const onDone = () => {
					loaded++;
						const tex = new THREE.Texture(img);
					tex.needsUpdate = true;
					tex.colorSpace = THREE.SRGBColorSpace;
					tex.minFilter = THREE.LinearFilter;
					tex.magFilter = THREE.LinearFilter;
					tex.wrapS = THREE.ClampToEdgeWrapping;
					tex.wrapT = THREE.ClampToEdgeWrapping;
					loadedTextures[i] = tex;
					if (loaded === total) {
						ready = true;
						uniforms.uTexCurrent.value = loadedTextures[currentIdx];
						uniforms.uTexCurrentAspect.value = loadedImages[currentIdx].naturalWidth / loadedImages[currentIdx].naturalHeight;
						onready?.();
						settleWaveActive = true;
						settleWaveStart = performance.now();
						waveOriginX = Math.random();
						waveOriginY = Math.random();
						slideshowInterval = setInterval(triggerTransition, holdDuration);
						requestAnimationFrame(mainLoop);
					}
				};
				img.onload = onDone;
				img.onerror = onDone;
				loadedImages[i] = img;
			});
		}

		// ── Main loop ──
		let animFrame: number;

		function mainLoop() {
			// If seeds aren't generated yet (e.g. container had 0 dimensions), retry resize
			if (seeds.length === 0) {
				resize();
				if (seeds.length === 0) {
					animFrame = requestAnimationFrame(mainLoop);
					return;
				}
			}

			const now = performance.now();
			uniforms.uTime.value = now * 0.001;

			updateActivity(now);
			updateSeedTargets();
			animateSeeds();
			updateLightDir();
			syncUniforms();

			// Per-cell BFS transition
			if (transitioning) {
				const elapsed = now - transitionStart;
				uniforms.uTransitionElapsed.value = elapsed;

				if (elapsed >= maxFlipTime + cellFlipDuration) {
					transitioning = false;
					currentIdx = toIdx;
					uniforms.uTexCurrent.value = loadedTextures[currentIdx];
					if (loadedImages[currentIdx]) {
						uniforms.uTexCurrentAspect.value = loadedImages[currentIdx].naturalWidth / loadedImages[currentIdx].naturalHeight;
					}
					uniforms.uTransitionElapsed.value = -1.0;
					cellFlipTimeArray.fill(-1);
				}
			} else {
				uniforms.uTransitionElapsed.value = -1.0;
			}

			renderer.render(scene, camera);
			animFrame = requestAnimationFrame(mainLoop);
		}

		// ── Event handlers ──
		function onMouseMove(e: MouseEvent) {
			pageMouseX = e.clientX;
			pageMouseY = e.clientY;
			lastStimulusTime = performance.now();
		}

		function onClick() {
			if (mouseOverCanvas && !transitioning) triggerTransition();
		}

		// ── Init ──
		resize();
		loadImages();

		document.addEventListener('mousemove', onMouseMove);
		containerEl.addEventListener('click', onClick);
		window.addEventListener('resize', resize);

		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
			if (slideshowInterval) clearInterval(slideshowInterval);
			document.removeEventListener('mousemove', onMouseMove);
			containerEl.removeEventListener('click', onClick);
			window.removeEventListener('resize', resize);
			renderer.dispose();
			material.dispose();
			loadedTextures.forEach(t => t.dispose());
		};
	});
</script>

<div
	class="voronoi-glass-gl"
	bind:this={containerEl}
	role="img"
	aria-label="Interactive image slideshow"
>
</div>

<style>
	.voronoi-glass-gl {
		position: absolute;
		inset: 0;
		cursor: default;
		touch-action: pan-y;
	}
</style>
