<script module lang="ts">
	export interface ImageSrcSet {
		/** Available resolutions, each with pixel width and URL */
		sizes: { width: number; url: string }[];
	}
</script>

<script lang="ts">
	interface Props {
		/** Image source sets — each entry has multiple resolution variants */
		images: ImageSrcSet[];
		/** Number of Voronoi cells */
		cellCount?: number;
		/** Duration of each cell's crossfade (ms) */
		cellFlipDuration?: number;
		/** Delay between BFS wavefront steps (ms) */
		waveDelay?: number;
		/** Time between automatic transitions (ms) */
		holdDuration?: number;
		/** Max pixel displacement per cell shard */
		refractMax?: number;
		/** Mouse influence radius for per-cell refraction activity (px) */
		mouseRefractRadius?: number;
		/** Mouse influence radius for seed displacement (px) */
		mouseRadius?: number;
		/** Strength of seed displacement from mouse */
		mouseSeedStrength?: number;
		/** Virtual cursor ring speed (px/ms) */
		waveSpeed?: number;
		/** Max shading overlay alpha */
		shadeMaxAlpha?: number;
		/** Brightness of bottom portion (0 = dark, 1 = light), bindable */
		bottomBrightness?: number;
		/** Show tessellation grid lines radiating from cursor */
		showGrid?: boolean;
		/** Grid line color (CSS color string) */
		gridColor?: string;
		/** Grid fade radius from cursor (px) */
		gridRadius?: number;
		/** Lloyd relaxation iterations (higher = more uniform cells) */
		relaxationIterations?: number;
		/** Callback fired once images are loaded and initial brightness is known */
		onready?: () => void;
	}

	let {
		images: imageSrcSets,
		cellCount = 32,
		cellFlipDuration = 1200,
		waveDelay = 180,
		holdDuration = 10000,
		refractMax = 20,
		mouseRefractRadius = 350,
		mouseRadius = 220,
		mouseSeedStrength = 25,
		waveSpeed = 0.65,
		shadeMaxAlpha = 0.25,
		bottomBrightness = $bindable(0.5),
		showGrid = false,
		gridColor = 'rgba(0, 255, 136, 1)',
		gridRadius = 300,
		relaxationIterations = 5,
		onready
	}: Props = $props();

	const COVER_PAD = $derived(refractMax + 10);
	const WAVE_RING_WIDTH = $derived(mouseRefractRadius);
	const SEED_DAMPING = 0.07;
	const ACTIVITY_ATTACK = 0.08;
	const ACTIVITY_DECAY = 0.012;
	const ACTIVITY_GRACE = 150;
	const _WAVE_TOUCH_DURATION = 500; // eslint-disable-line @typescript-eslint/no-unused-vars
	const DRAG_THRESHOLD = 6;
	const DRAG_FADE_SPEED = 0.06;

	let canvasEl: HTMLCanvasElement;
	let containerEl: HTMLDivElement;
	let ctx: CanvasRenderingContext2D;
	let W = 0, H = 0;
	const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

	// Voronoi state
	let baseSeeds: { x: number; y: number }[] = [];
	let seeds: { x: number; y: number }[] = [];
	let targetSeeds: { x: number; y: number }[] = [];
	let cellPolys: { x: number; y: number }[][] = [];
	let adjacency: number[][] = [];
	let cellRefractions: { dx: number; dy: number }[] = [];
	let currentIdx = 0;
	let loadedImages: HTMLImageElement[] = [];
	let ready = false;
	let activeResolution = 0; // current loaded width tier
	let pendingReload = false; // background reload in progress

	// Seed drift during transitions
	let seedDriftVelocities: { vx: number; vy: number }[] = [];
	let driftActive = false;

	// Activity system
	let activityLevel = 0;
	let lastStimulusTime = 0;
	let cellActivityLevels: number[] = [];
	let cellActivityVelocities: number[] = [];
	let cellAttackRates: number[] = [];
	let cellDecayRates: number[] = [];

	// Mouse state
	let pageMouseX = -9999, pageMouseY = -9999;
	let canvasMouseX = -9999, canvasMouseY = -9999;
	let mouseOverCanvas = false;
	let dirX = 0, dirY = 0;

	// Drag / click
	let pointerDown = false;
	let pointerDownX = 0, pointerDownY = 0;
	let isDragging = false;
	let cellDragReveal: number[] = [];

	// Brightness analysis
	let smoothedBrightness = 0.5;
	let brightnessFrameCounter = 0;

	// Resolved grid color for canvas (stored as "r, g, b" for rgba())
	let resolvedGridColor = '0, 255, 136';

	// Grid cursor state
	let gridCursorX = 0, gridCursorY = 0;
	let gridOpacity = 0;

	// Transition state
	let transitioning = false;
	let transitionStart = 0;
	let fromIdx = 0, toIdx = 0;
	let cellFlipTimes: number[] = [];
	let waveOriginX = 0, waveOriginY = 0;
	let waveRadius = 0;
	let waveCursorActive = false;
	let slideshowInterval: ReturnType<typeof setInterval> | null = null;
	let animFrame: number;

	// Touch
	let touchStartX = 0, touchStartY = 0;
	let touchIsDragging = false;

	// ===== Voronoi seed generation + Lloyd relaxation =====
	function generateSeeds() {
		let rng = (Math.random() * 2147483646 + 1) | 0;
		const rand = () => { rng = (rng * 16807) % 2147483647; return rng / 2147483647; };
		baseSeeds = [];
		for (let i = 0; i < cellCount; i++) {
			baseSeeds.push({ x: rand() * W, y: rand() * H });
		}
		const fullIters = Math.floor(relaxationIterations);
		const frac = relaxationIterations - fullIters;
		const totalIters = frac > 0 ? fullIters + 1 : fullIters;
		for (let iter = 0; iter < totalIters; iter++) {
			const blend = (iter < fullIters) ? 1 : frac;
			const regions = baseSeeds.map(() => ({ sx: 0, sy: 0, count: 0 }));
			const step = 3;
			for (let y = 0; y < H; y += step) {
				for (let x = 0; x < W; x += step) {
					let minD = Infinity, minI = 0;
					for (let i = 0; i < baseSeeds.length; i++) {
						const dx = x - baseSeeds[i].x, dy = y - baseSeeds[i].y;
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
		cellRefractions = [];
		cellActivityLevels = [];
		cellActivityVelocities = [];
		cellAttackRates = [];
		cellDecayRates = [];
		for (let i = 0; i < cellCount; i++) {
			cellRefractions.push({ dx: rand() * refractMax, dy: rand() * refractMax });
			cellActivityLevels.push(0);
			cellActivityVelocities.push(0);
			cellAttackRates.push(0.02 + rand01() * 0.04);
			cellDecayRates.push(0.004 + rand01() * 0.012);
		}
	}

	function clipPolygon(
		poly: { x: number; y: number }[],
		px: number, py: number, nx: number, ny: number
	) {
		const out: { x: number; y: number }[] = [];
		for (let i = 0; i < poly.length; i++) {
			const a = poly[i], b = poly[(i + 1) % poly.length];
			const da = (a.x - px) * nx + (a.y - py) * ny;
			const db = (b.x - px) * nx + (b.y - py) * ny;
			if (da <= 0) out.push(a);
			if ((da <= 0) !== (db <= 0)) {
				const t = da / (da - db);
				out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
			}
		}
		return out;
	}

	function recomputePolys() {
		cellPolys = [];
		for (let i = 0; i < seeds.length; i++) {
			let poly: { x: number; y: number }[] = [
				{ x: -10, y: -10 }, { x: W + 10, y: -10 },
				{ x: W + 10, y: H + 10 }, { x: -10, y: H + 10 }
			];
			for (let j = 0; j < seeds.length; j++) {
				if (j === i) continue;
				const mx = (seeds[i].x + seeds[j].x) / 2, my = (seeds[i].y + seeds[j].y) / 2;
				const ddx = seeds[j].x - seeds[i].x, ddy = seeds[j].y - seeds[i].y;
				poly = clipPolygon(poly, mx, my, ddx, ddy);
				if (poly.length === 0) break;
			}
			cellPolys[i] = poly;
		}
	}

	function computeAdjacency() {
		adjacency = seeds.map(() => []);
		const step = 4;
		const grid: Record<string, number> = {};
		for (let y = 0; y < H; y += step) {
			for (let x = 0; x < W; x += step) {
				let minD = Infinity, minI = 0;
				for (let i = 0; i < seeds.length; i++) {
					const dx = x - seeds[i].x, dy = y - seeds[i].y;
					const d = dx * dx + dy * dy;
					if (d < minD) { minD = d; minI = i; }
				}
				grid[`${Math.floor(x / step)},${Math.floor(y / step)}`] = minI;
			}
		}
		const pairs = new Set<string>(); // eslint-disable-line svelte/prefer-svelte-reactivity
		for (let y = 0; y < H; y += step) {
			for (let x = 0; x < W; x += step) {
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

	function coverParams(img: HTMLImageElement, offsetX: number, offsetY: number) {
		if (!img || !img.complete || img.naturalWidth === 0) return null;
		const imgAspect = img.naturalWidth / img.naturalHeight;
		const targetW = W + COVER_PAD * 2;
		const targetH = H + COVER_PAD * 2;
		const targetAspect = targetW / targetH;
		let dw: number, dh: number;
		if (imgAspect > targetAspect) { dh = targetH; dw = dh * imgAspect; }
		else { dw = targetW; dh = dw / imgAspect; }
		const dx = (W - dw) / 2;
		const dy = (H - dh) / 2;
		return { dx: dx + (offsetX || 0), dy: dy + (offsetY || 0), dw, dh };
	}

	function expandPoly(poly: { x: number; y: number }[], amount: number) {
		const n = poly.length;
		if (n < 3) return poly;
		let cx = 0, cy = 0;
		for (let i = 0; i < n; i++) { cx += poly[i].x; cy += poly[i].y; }
		cx /= n; cy /= n;
		return poly.map(p => {
			const dx = p.x - cx, dy = p.y - cy;
			const d = Math.sqrt(dx * dx + dy * dy);
			if (d < 0.01) return p;
			return { x: p.x + (dx / d) * amount, y: p.y + (dy / d) * amount };
		});
	}

	function drawClippedImage(
		poly: { x: number; y: number }[], img: HTMLImageElement,
		refractDx: number, refractDy: number
	) {
		const params = coverParams(img, refractDx, refractDy);
		if (!params || poly.length < 3) return;
		const expanded = expandPoly(poly, 0.75);
		ctx.beginPath();
		ctx.moveTo(expanded[0].x, expanded[0].y);
		for (let j = 1; j < expanded.length; j++) ctx.lineTo(expanded[j].x, expanded[j].y);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(img, params.dx, params.dy, params.dw, params.dh);
	}

	function shadeCellPoly(
		poly: { x: number; y: number }[], cellIdx: number, cellActivity: number
	) {
		if (cellActivity < 0.005) return;
		const ref = cellRefractions[cellIdx];
		const mag = Math.sqrt(ref.dx * ref.dx + ref.dy * ref.dy);
		if (mag < 0.1) return;
		const nx = ref.dx / mag, ny = ref.dy / mag;
		let lx = dirX || 0, ly = dirY || 0;
		if (mouseOverCanvas) {
			const sdx = canvasMouseX - seeds[cellIdx].x;
			const sdy = canvasMouseY - seeds[cellIdx].y;
			const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
			if (sdist > 1) { lx = sdx / sdist; ly = sdy / sdist; }
		} else if (waveCursorActive) {
			const wdx = waveOriginX - seeds[cellIdx].x;
			const wdy = waveOriginY - seeds[cellIdx].y;
			const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
			if (wdist > 1) { lx = wdx / wdist; ly = wdy / wdist; }
		}
		const dot = nx * lx + ny * ly;
		const alpha = Math.abs(dot) * cellActivity * shadeMaxAlpha;
		if (alpha < 0.002) return;
		const expanded = expandPoly(poly, 0.75);
		ctx.beginPath();
		ctx.moveTo(expanded[0].x, expanded[0].y);
		for (let j = 1; j < expanded.length; j++) ctx.lineTo(expanded[j].x, expanded[j].y);
		ctx.closePath();
		ctx.fillStyle = dot > 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
		ctx.fill();
	}

	// ===== Input handlers =====
	function onMouseMove(e: MouseEvent) {
		pageMouseX = e.clientX;
		pageMouseY = e.clientY;
		lastStimulusTime = performance.now();
		if (pointerDown) {
			const ddx = e.clientX - pointerDownX;
			const ddy = e.clientY - pointerDownY;
			if (!isDragging && (ddx * ddx + ddy * ddy) > DRAG_THRESHOLD * DRAG_THRESHOLD) {
				isDragging = true;
			}
			if (isDragging && mouseOverCanvas) {
				dragRevealCellAt(canvasMouseX, canvasMouseY);
			}
		}
	}

	function onMouseDown(e: MouseEvent) {
		pointerDown = true;
		pointerDownX = e.clientX;
		pointerDownY = e.clientY;
		isDragging = false;
	}

	function onMouseUp() {
		if (pointerDown && !isDragging) {
			if (mouseOverCanvas && !transitioning) triggerTransition();
		}
		if (pointerDown && isDragging) finishDragReveal();
		pointerDown = false;
		isDragging = false;
	}

	function onTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		pageMouseX = touch.clientX;
		pageMouseY = touch.clientY;
		touchIsDragging = false;
		pointerDown = true;
	}

	function onTouchMove(e: TouchEvent) {
		const touch = e.touches[0];
		pageMouseX = touch.clientX;
		pageMouseY = touch.clientY;
		lastStimulusTime = performance.now();
		const ddx = touch.clientX - touchStartX;
		const ddy = touch.clientY - touchStartY;
		if (!touchIsDragging && (ddx * ddx + ddy * ddy) > DRAG_THRESHOLD * DRAG_THRESHOLD) {
			touchIsDragging = true;
			isDragging = true;
		}
		if (touchIsDragging) {
			const rect = containerEl.getBoundingClientRect();
			const cx = touch.clientX - rect.left;
			const cy = touch.clientY - rect.top;
			if (cx >= 0 && cx <= W && cy >= 0 && cy <= H) {
				dragRevealCellAt(cx, cy);
			}
		}
	}

	function onTouchEnd() {
		if (pointerDown && !touchIsDragging) {
			if (mouseOverCanvas && !transitioning) triggerTransition();
		}
		if (touchIsDragging) finishDragReveal();
		pointerDown = false;
		isDragging = false;
		touchIsDragging = false;
	}

	// ===== Activity =====
	function updateActivity(now: number) {
		const timeSinceStimulus = now - lastStimulusTime;
		const stimulusActive = timeSinceStimulus < ACTIVITY_GRACE;

		if (stimulusActive || waveCursorActive) {
			activityLevel = Math.min(1, activityLevel + ACTIVITY_ATTACK);
		} else {
			activityLevel = Math.max(0, activityLevel - ACTIVITY_DECAY);
		}

		const elapsed = transitioning ? now - transitionStart : 0;
		if (transitioning) {
			waveRadius = elapsed * waveSpeed;
			waveCursorActive = true;
		} else {
			waveCursorActive = false;
		}

		for (let i = 0; i < cellCount; i++) {
			let targetActivity = 0;

			if (stimulusActive && mouseOverCanvas) {
				const sdx = seeds[i].x - canvasMouseX;
				const sdy = seeds[i].y - canvasMouseY;
				const dist = Math.sqrt(sdx * sdx + sdy * sdy);
				if (dist < mouseRefractRadius) {
					const proximity = 1 - dist / mouseRefractRadius;
					targetActivity = Math.max(targetActivity, proximity * proximity);
				}
			}

			if (waveCursorActive) {
				const cdx = seeds[i].x - waveOriginX;
				const cdy = seeds[i].y - waveOriginY;
				const cellDist = Math.sqrt(cdx * cdx + cdy * cdy);
				const ringDist = Math.abs(cellDist - waveRadius);
				if (ringDist < WAVE_RING_WIDTH) {
					const proximity = 1 - ringDist / WAVE_RING_WIDTH;
					targetActivity = Math.max(targetActivity, proximity * proximity);
				}
			}

			const current = cellActivityLevels[i];
			const diff = targetActivity - current;
			const rate = diff > 0 ? cellAttackRates[i] : cellDecayRates[i];
			cellActivityVelocities[i] = cellActivityVelocities[i] * 0.85 + diff * rate * 0.8;
			cellActivityLevels[i] = Math.max(0, Math.min(1, current + cellActivityVelocities[i]));
			if (cellActivityLevels[i] < 0.001 && Math.abs(cellActivityVelocities[i]) < 0.0005) {
				cellActivityLevels[i] = 0;
				cellActivityVelocities[i] = 0;
			}
		}
	}

	function updateSeedTargets() {
		const rect = containerEl.getBoundingClientRect();
		canvasMouseX = pageMouseX - rect.left;
		canvasMouseY = pageMouseY - rect.top;
		mouseOverCanvas = canvasMouseX >= 0 && canvasMouseX <= W && canvasMouseY >= 0 && canvasMouseY <= H;

		dirX *= 0.95;
		dirY *= 0.95;

		for (let i = 0; i < baseSeeds.length; i++) {
			const bx = baseSeeds[i].x, by = baseSeeds[i].y;
			let tx = bx, ty = by;

			if (activityLevel > 0.01 && mouseOverCanvas) {
				const dx = bx - canvasMouseX, dy = by - canvasMouseY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < mouseRadius && dist > 0) {
					const force = (1 - dist / mouseRadius) * activityLevel;
					tx += (dx / dist) * force * mouseSeedStrength;
					ty += (dy / dist) * force * mouseSeedStrength;
				}
			}

			if (waveCursorActive) {
				const cdx = bx - waveOriginX, cdy = by - waveOriginY;
				const cellDist = Math.sqrt(cdx * cdx + cdy * cdy);
				const ringDist = Math.abs(cellDist - waveRadius);
				if (ringDist < mouseRadius && cellDist > 1) {
					const force = 1 - ringDist / mouseRadius;
					tx += (cdx / cellDist) * force * mouseSeedStrength * 0.6;
					ty += (cdy / cellDist) * force * mouseSeedStrength * 0.6;
				}
			}

			targetSeeds[i].x = tx;
			targetSeeds[i].y = ty;
		}
	}

	function animateSeeds() {
		let moved = false;
		const wrapThreshX = W * 0.4;
		const wrapThreshY = H * 0.4;
		for (let i = 0; i < seeds.length; i++) {
			const dx = targetSeeds[i].x - seeds[i].x;
			const dy = targetSeeds[i].y - seeds[i].y;
			// Snap on wrap instead of interpolating across the canvas
			if (Math.abs(dx) > wrapThreshX || Math.abs(dy) > wrapThreshY) {
				seeds[i].x = targetSeeds[i].x;
				seeds[i].y = targetSeeds[i].y;
				moved = true;
			} else if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
				seeds[i].x += dx * SEED_DAMPING;
				seeds[i].y += dy * SEED_DAMPING;
				moved = true;
			} else {
				seeds[i].x = targetSeeds[i].x;
				seeds[i].y = targetSeeds[i].y;
			}
		}
		if (moved) recomputePolys();
	}

	function findCellAt(cx: number, cy: number) {
		let minDist = Infinity, closest = -1;
		for (let i = 0; i < seeds.length; i++) {
			const dx = seeds[i].x - cx, dy = seeds[i].y - cy;
			const d = dx * dx + dy * dy;
			if (d < minDist) { minDist = d; closest = i; }
		}
		return closest;
	}

	function dragRevealCellAt(cx: number, cy: number) {
		const cell = findCellAt(cx, cy);
		if (cell >= 0) {
			cellDragReveal[cell] = Math.min(1, cellDragReveal[cell] + DRAG_FADE_SPEED);
		}
	}

	function finishDragReveal() {
		let hasRevealed = false;
		for (let i = 0; i < cellCount; i++) {
			if (cellDragReveal[i] > 0.1) { hasRevealed = true; break; }
		}
		if (hasRevealed && !transitioning) triggerTransition();
	}

	function resetSlideshowTimer() {
		if (slideshowInterval) clearInterval(slideshowInterval);
		slideshowInterval = setInterval(triggerTransition, holdDuration);
	}

	function triggerTransition() {
		if (loadedImages.length < 2) return;
		fromIdx = currentIdx;
		toIdx = (currentIdx + 1) % loadedImages.length;

		let startCell: number;
		if (mouseOverCanvas) {
			let minDist = Infinity;
			startCell = 0;
			for (let i = 0; i < seeds.length; i++) {
				const dx = seeds[i].x - canvasMouseX;
				const dy = seeds[i].y - canvasMouseY;
				const d = dx * dx + dy * dy;
				if (d < minDist) { minDist = d; startCell = i; }
			}
		} else {
			startCell = Math.floor(Math.random() * cellCount);
		}

		waveOriginX = seeds[startCell].x;
		waveOriginY = seeds[startCell].y;
		cellFlipTimes = new Array(cellCount).fill(-1);
		const queue = [startCell];
		cellFlipTimes[startCell] = 0;
		while (queue.length > 0) {
			const cell = queue.shift()!;
			const nextTime = cellFlipTimes[cell] + waveDelay;
			for (const neighbor of adjacency[cell]) {
				if (cellFlipTimes[neighbor] === -1) {
					cellFlipTimes[neighbor] = nextTime;
					queue.push(neighbor);
				}
			}
		}
		transitioning = true;
		transitionStart = performance.now();
		resetSlideshowTimer();
		analyzeImageBrightness(loadedImages[toIdx]);
		startSeedDrift();
	}

	function startSeedDrift() {
		let rng = performance.now() & 0x7fffffff;
		const rand = () => { rng = (rng * 16807) % 2147483647; return (rng / 2147483647) * 2 - 1; };
		seedDriftVelocities = [];
		for (let i = 0; i < cellCount; i++) {
			const speed = 0.3 + Math.abs(rand()) * 0.5;
			const angle = rand() * Math.PI;
			seedDriftVelocities.push({
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed
			});
		}
		driftActive = true;
	}

	function updateSeedDrift() {
		if (!driftActive) return;
		for (let i = 0; i < baseSeeds.length; i++) {
			baseSeeds[i].x += seedDriftVelocities[i].vx;
			baseSeeds[i].y += seedDriftVelocities[i].vy;
			// Toroidal wrap
			if (baseSeeds[i].x < 0) baseSeeds[i].x += W;
			else if (baseSeeds[i].x > W) baseSeeds[i].x -= W;
			if (baseSeeds[i].y < 0) baseSeeds[i].y += H;
			else if (baseSeeds[i].y > H) baseSeeds[i].y -= H;
		}
	}

	// ===== Drawing =====
	function drawScene(now: number) {
		if (!ready || !ctx) return;

		ctx.clearRect(0, 0, W, H);

		// Shading-only mode: no images loaded, just draw cell shading
		if (loadedImages.length === 0) {
			for (let i = 0; i < cellCount; i++) {
				const poly = cellPolys[i];
				if (!poly || poly.length < 3) continue;
				shadeCellPoly(poly, i, cellActivityLevels[i]);
			}
			if (showGrid) drawTessellationGrid();
			return;
		}

		const elapsed = transitioning ? now - transitionStart : 0;
		const imgFrom = loadedImages[fromIdx % loadedImages.length];
		const imgTo = loadedImages[toIdx % loadedImages.length];
		const imgCurrent = loadedImages[currentIdx % loadedImages.length];

		const baseImg = transitioning ? imgFrom : imgCurrent;
		const baseParams = coverParams(baseImg, 0, 0);
		if (baseParams) {
			ctx.drawImage(baseImg, baseParams.dx, baseParams.dy, baseParams.dw, baseParams.dh);
		}

		const globalBiasX = dirX * refractMax * 0.5;
		const globalBiasY = dirY * refractMax * 0.5;

		let allDone = true;

		for (let i = 0; i < cellCount; i++) {
			const poly = cellPolys[i];
			if (!poly || poly.length < 3) continue;

			const ref = cellRefractions[i];
			const ca = cellActivityLevels[i];

			let mouseRefractX = 0, mouseRefractY = 0;
			if (mouseOverCanvas && ca > 0.001) {
				const sdx = seeds[i].x - canvasMouseX;
				const sdy = seeds[i].y - canvasMouseY;
				const dist = Math.sqrt(sdx * sdx + sdy * sdy);
				if (dist < mouseRefractRadius && dist > 1) {
					const proximity = 1 - dist / mouseRefractRadius;
					mouseRefractX = -(sdx / dist) * proximity * refractMax * 0.4;
					mouseRefractY = -(sdy / dist) * proximity * refractMax * 0.4;
				}
			}

			let waveRefractX = 0, waveRefractY = 0;
			if (waveCursorActive) {
				const cdx = seeds[i].x - waveOriginX;
				const cdy = seeds[i].y - waveOriginY;
				const cellDist = Math.sqrt(cdx * cdx + cdy * cdy);
				const ringDist = Math.abs(cellDist - waveRadius);
				if (ringDist < WAVE_RING_WIDTH && cellDist > 1) {
					const proximity = 1 - ringDist / WAVE_RING_WIDTH;
					waveRefractX = (cdx / cellDist) * proximity * refractMax * 0.4;
					waveRefractY = (cdy / cellDist) * proximity * refractMax * 0.4;
				}
			}

			const dx = (ref.dx + mouseRefractX + waveRefractX) * ca + globalBiasX * ca;
			const dy = (ref.dy + mouseRefractY + waveRefractY) * ca + globalBiasY * ca;

			if (!transitioning) {
				const dragT = cellDragReveal[i];
				if (dragT > 0.001) {
					const nextImg = loadedImages[(currentIdx + 1) % loadedImages.length];
					ctx.save();
					ctx.globalAlpha = 1 - dragT;
					drawClippedImage(poly, imgCurrent, dx, dy);
					ctx.restore();
					ctx.save();
					ctx.globalAlpha = dragT;
					drawClippedImage(poly, nextImg, dx, dy);
					ctx.restore();
				} else {
					ctx.save();
					drawClippedImage(poly, imgCurrent, dx, dy);
					ctx.restore();
				}
				shadeCellPoly(poly, i, ca);
			} else {
				const flipStart = cellFlipTimes[i];

				if (flipStart === -1) {
					const dragT = cellDragReveal[i];
					if (dragT > 0.001) {
						ctx.save(); ctx.globalAlpha = 1 - dragT;
						drawClippedImage(poly, imgFrom, dx, dy);
						ctx.restore();
						ctx.save(); ctx.globalAlpha = dragT;
						drawClippedImage(poly, imgTo, dx, dy);
						ctx.restore();
					} else {
						ctx.save();
						drawClippedImage(poly, imgFrom, dx, dy);
						ctx.restore();
					}
					shadeCellPoly(poly, i, ca);
					allDone = false;
				} else {
					const cellElapsed = elapsed - flipStart;
					if (cellElapsed < 0) {
						const dragT = cellDragReveal[i];
						if (dragT > 0.001) {
							ctx.save(); ctx.globalAlpha = 1 - dragT;
							drawClippedImage(poly, imgFrom, dx, dy);
							ctx.restore();
							ctx.save(); ctx.globalAlpha = dragT;
							drawClippedImage(poly, imgTo, dx, dy);
							ctx.restore();
						} else {
							ctx.save();
							drawClippedImage(poly, imgFrom, dx, dy);
							ctx.restore();
						}
						shadeCellPoly(poly, i, ca);
						allDone = false;
					} else if (cellElapsed >= cellFlipDuration) {
						ctx.save();
						drawClippedImage(poly, imgTo, dx, dy);
						ctx.restore();
						shadeCellPoly(poly, i, ca);
					} else {
						allDone = false;
						const progress = cellElapsed / cellFlipDuration;
						const eased = progress * progress * (3 - 2 * progress);
						const dragT = cellDragReveal[i];
						const blendT = dragT + (1 - dragT) * eased;
						ctx.save(); ctx.globalAlpha = 1 - blendT;
						drawClippedImage(poly, imgFrom, dx, dy);
						ctx.restore();
						ctx.save(); ctx.globalAlpha = blendT;
						drawClippedImage(poly, imgTo, dx, dy);
						ctx.restore();
						shadeCellPoly(poly, i, ca);
					}
				}
			}
		}

		if (transitioning && allDone) {
			currentIdx = toIdx;
			transitioning = false;
			driftActive = false;
			cellDragReveal.fill(0);
		}

		if (showGrid) drawTessellationGrid();
	}

	function drawTessellationGrid() {
		if (!ctx || seeds.length === 0 || adjacency.length === 0) return;

		let cx: number, cy: number, active: boolean;
		if (mouseOverCanvas) {
			cx = canvasMouseX;
			cy = canvasMouseY;
			active = true;
		} else if (waveCursorActive) {
			cx = waveOriginX;
			cy = waveOriginY;
			active = true;
		} else {
			active = false;
			cx = gridCursorX;
			cy = gridCursorY;
		}

		// Fade grid opacity in/out
		if (active) {
			gridOpacity = Math.min(1, gridOpacity + 0.08);
			gridCursorX = cx;
			gridCursorY = cy;
		} else {
			gridOpacity = Math.max(0, gridOpacity - 0.03);
		}

		if (gridOpacity < 0.003) return;

		ctx.lineWidth = 3;
		const gc = resolvedGridColor;

		// Draw all Delaunay edges, fading by distance from cursor
		for (let i = 0; i < seeds.length; i++) {
			for (const j of adjacency[i]) {
				if (j <= i) continue; // each edge once
				const ax = seeds[i].x, ay = seeds[i].y;
				const bx = seeds[j].x, by = seeds[j].y;

				// Alpha at each endpoint based on distance from cursor
				const dA = Math.sqrt((ax - cx) ** 2 + (ay - cy) ** 2);
				const dB = Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2);
				let alphaA = Math.max(0, 1 - dA / gridRadius);
				let alphaB = Math.max(0, 1 - dB / gridRadius);
				alphaA = alphaA * alphaA * gridOpacity;
				alphaB = alphaB * alphaB * gridOpacity;

				if (alphaA < 0.005 && alphaB < 0.005) continue;

				const grad = ctx.createLinearGradient(ax, ay, bx, by);
				grad.addColorStop(0, `rgba(${gc}, ${alphaA})`);
				grad.addColorStop(1, `rgba(${gc}, ${alphaB})`);
				ctx.strokeStyle = grad;
				ctx.beginPath();
				ctx.moveTo(ax, ay);
				ctx.lineTo(bx, by);
				ctx.stroke();
			}
		}
		ctx.globalAlpha = 1;
	}

	function analyzeBottomBrightness() {
		if (!ctx || W === 0 || H === 0 || loadedImages.length === 0) return;
		if (transitioning) return; // use predictive value during transitions

		const sampleH = Math.max(1, Math.floor(H * 0.25 * DPR));
		const startY = Math.floor(H * DPR) - sampleH;
		const w = Math.floor(W * DPR);

		if (w <= 0 || sampleH <= 0) return;

		try {
			const imageData = ctx.getImageData(0, startY, w, sampleH);
			const data = imageData.data;

			let totalLuminance = 0;
			let count = 0;
			const step = 32;

			for (let i = 0; i < data.length; i += step * 4) {
				totalLuminance += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				count++;
			}

			const avgLuminance = count > 0 ? totalLuminance / count / 255 : 0.5;
			smoothedBrightness += (avgLuminance - smoothedBrightness) * 0.05;
			bottomBrightness = smoothedBrightness;
		} catch {
			// getImageData may fail with tainted canvas
		}
	}

	/** Analyze a specific image's bottom brightness using an offscreen canvas */
	function analyzeImageBrightness(img: HTMLImageElement) {
		if (!img || !img.complete || img.naturalWidth === 0 || W === 0 || H === 0) return;

		try {
			const params = coverParams(img, 0, 0);
			if (!params) return;

			const sW = Math.round(W * 0.25);
			const sH = Math.round(H * 0.25);
			if (sW <= 0 || sH <= 0) return;

			const offscreen = document.createElement('canvas');
			offscreen.width = sW;
			offscreen.height = sH;
			const octx = offscreen.getContext('2d');
			if (!octx) return;

			const scale = sW / W;
			octx.drawImage(img, params.dx * scale, params.dy * scale, params.dw * scale, params.dh * scale);

			const sampleH = Math.max(1, Math.floor(sH * 0.25));
			const data = octx.getImageData(0, sH - sampleH, sW, sampleH).data;

			let totalLuminance = 0;
			let count = 0;
			const step = 8;

			for (let i = 0; i < data.length; i += step * 4) {
				totalLuminance += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
				count++;
			}

			const avgLuminance = count > 0 ? totalLuminance / count / 255 : 0.5;
			smoothedBrightness = avgLuminance;
			bottomBrightness = avgLuminance;
		} catch {
			// may fail with tainted canvas
		}
	}

	function mainLoop() {
		const now = performance.now();
		updateActivity(now);
		updateSeedDrift();
		updateSeedTargets();
		animateSeeds();
		drawScene(now);

		brightnessFrameCounter++;
		if (brightnessFrameCounter >= 10) {
			brightnessFrameCounter = 0;
			analyzeBottomBrightness();
		}

		animFrame = requestAnimationFrame(mainLoop);
	}

	// ===== Resize =====
	function resize() {
		if (!containerEl || !canvasEl) return;
		const rect = containerEl.getBoundingClientRect();
		const prevW = W, prevH = H;
		W = rect.width;
		H = rect.height;
		if (W === 0 || H === 0) return;
		canvasEl.width = W * DPR;
		canvasEl.height = H * DPR;
		canvasEl.style.width = W + 'px';
		canvasEl.style.height = H + 'px';
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

		if (baseSeeds.length === cellCount && prevW > 0 && prevH > 0) {
			// Scale existing seeds proportionally — avoids flicker on mobile resize
			const sx = W / prevW, sy = H / prevH;
			for (let i = 0; i < baseSeeds.length; i++) {
				baseSeeds[i].x *= sx;
				baseSeeds[i].y *= sy;
				seeds[i].x *= sx;
				seeds[i].y *= sy;
				targetSeeds[i].x *= sx;
				targetSeeds[i].y *= sy;
			}
		} else {
			generateSeeds();
			seeds = baseSeeds.map(s => ({ x: s.x, y: s.y }));
			targetSeeds = baseSeeds.map(s => ({ x: s.x, y: s.y }));
			generateRefractions();
			cellDragReveal = new Array(cellCount).fill(0);
		}

		recomputePolys();
		computeAdjacency();
		checkResolutionChange();
	}

	// ===== Resolution selection =====
	function pickResolution(canvasWidth: number): number {
		const needed = canvasWidth * DPR;
		if (imageSrcSets.length === 0) return 0;
		const available = imageSrcSets[0].sizes.map(s => s.width).sort((a, b) => a - b);
		// Pick smallest size that covers the canvas, or the largest available
		for (const w of available) {
			if (w >= needed) return w;
		}
		return available[available.length - 1];
	}

	function urlForResolution(srcSet: ImageSrcSet, resolution: number): string {
		const exact = srcSet.sizes.find(s => s.width === resolution);
		if (exact) return exact.url;
		// Fallback: pick closest
		const sorted = [...srcSet.sizes].sort((a, b) => Math.abs(a.width - resolution) - Math.abs(b.width - resolution));
		return sorted[0]?.url ?? '';
	}

	// ===== Image loading =====
	function loadImages() {
		loadedImages = [];
		ready = false;
		let loaded = 0;
		const total = imageSrcSets.length;
		if (total === 0) {
			// Shading-only mode: no images, just animate cell overlays
			ready = true;
			animFrame = requestAnimationFrame(mainLoop);
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
				if (loaded === total) {
					ready = true;
					analyzeImageBrightness(loadedImages[currentIdx]);
					onready?.();
					slideshowInterval = setInterval(triggerTransition, holdDuration);
					animFrame = requestAnimationFrame(mainLoop);
				}
			};
			img.onload = onDone;
			img.onerror = onDone;
			loadedImages[i] = img;
		});
	}

	/** Check if resolution needs to change and seamlessly reload if so */
	function checkResolutionChange() {
		if (pendingReload || !ready || imageSrcSets.length === 0) return;
		const needed = pickResolution(W);
		if (needed === activeResolution) return;

		pendingReload = true;
		const newImages: HTMLImageElement[] = [];
		let loaded = 0;
		const total = imageSrcSets.length;

		imageSrcSets.forEach((srcSet, i) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = urlForResolution(srcSet, needed);
			const onDone = () => {
				loaded++;
				if (loaded === total) {
					// Seamless swap — old images rendered until this moment
					loadedImages = newImages;
					activeResolution = needed;
					pendingReload = false;
				}
			};
			img.onload = onDone;
			img.onerror = onDone;
			newImages[i] = img;
		});
	}

	// ===== Lifecycle =====
	$effect(() => {
		if (!canvasEl || !containerEl) return;
		ctx = canvasEl.getContext('2d')!;

		resize();
		loadImages();

		if (showGrid) {
			// Resolve CSS color to "r, g, b" string for gradient stops
			let rawColor = gridColor;
			if (gridColor.startsWith('var(')) {
				const prop = gridColor.slice(4, -1).trim();
				rawColor = getComputedStyle(containerEl).getPropertyValue(prop).trim() || '#00ff88';
			}
			// Use a temp canvas to parse any CSS color into RGBA
			const tmp = document.createElement('canvas');
			tmp.width = tmp.height = 1;
			const tmpCtx = tmp.getContext('2d')!;
			tmpCtx.fillStyle = rawColor;
			tmpCtx.fillRect(0, 0, 1, 1);
			const [r, g, b] = tmpCtx.getImageData(0, 0, 1, 1).data;
			resolvedGridColor = `${r}, ${g}, ${b}`;
		}

		// Global event listeners
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('touchmove', onTouchMove, { passive: true });
		document.addEventListener('touchend', onTouchEnd);
		window.addEventListener('resize', resize);

		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
			if (slideshowInterval) clearInterval(slideshowInterval);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('touchmove', onTouchMove);
			document.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="voronoi-glass"
	bind:this={containerEl}
	onmousedown={onMouseDown}
	ontouchstart={onTouchStart}
	role="img"
	aria-label="Interactive image slideshow"
>
	<canvas bind:this={canvasEl}></canvas>
</div>

<style>
	.voronoi-glass {
		position: relative;
		width: 100%;
		height: 100%;
		cursor: default;
		touch-action: pan-y;
	}
	.voronoi-glass canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
