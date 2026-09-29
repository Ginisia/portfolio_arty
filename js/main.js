/* =========================================================
   GINÍ CORMERAIS — PORTFOLIO
   =========================================================
   - Random order on load
   - Random order + random formats on category change
   - Ást = scattered small images on desktop
   - No dragging
   - No glitch / movement on Ást
   - Native lazy loading
   - Lightbox for every image
   ========================================================= */

/* =========================================================
   CONFIG
   ========================================================= */

var SERIES = [
	{ folder: 'hemkov', cat: 'hemkov', title: 'Hemkov' },
	{ folder: 'hide-your-fires', cat: 'hyf', title: 'Hide Your Fires' },
	{ folder: 'lightmare', cat: 'lightmare', title: 'Lightmare' },
	{ folder: 'ast', cat: 'ast', title: 'Ást' },
];

var MANIFEST_URL = 'img/portfolio/manifest.json';

var portfolioGrid = document.getElementById('portfolioGrid');
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
var lightboxCaption = document.getElementById('lightboxCaption');
var lightboxClose = document.getElementById('lightboxClose');

var currentFilter = 'mixed';

/* =========================================================
   UTILS
   ========================================================= */

function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
	var result = array.slice();

	for (var i = result.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));

		var temp = result[i];
		result[i] = result[j];
		result[j] = temp;
	}

	return result;
}

var lastOrders = {};

function shuffleDifferent(array, key) {
  var result = shuffle(array);
  var signature = result.map(function (i) { return i.file; }).join('|');
  var tries = 0;

  while (array.length > 1 && lastOrders[key] === signature && tries < 5) {
    result = shuffle(array);
    signature = result.map(function (i) { return i.file; }).join('|');
    tries++;
  }

  lastOrders[key] = signature;
  return result;
}

function isMobileLayout() {
	return window.innerWidth <= 900;
}

/* =========================================================
   SCRAMBLE TEXT
   ========================================================= */

function initScramble() {
	var element = document.getElementById('scrambleTag');

	if (!element) return;

	var originalText = element.textContent.trim();
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	var isRunning = false;

	function scramble() {
		if (isRunning) return;

		isRunning = true;

		var iterations = 0;
		var maxIterations = originalText.length * 3;

		var interval = setInterval(function () {
			element.textContent = originalText
				.split('')
				.map(function (char, index) {
					if (char === ' ') return ' ';

					if (index < iterations / 3) {
						return originalText[index];
					}

					return chars[Math.floor(Math.random() * chars.length)];
				})
				.join('');

			iterations++;

			if (iterations > maxIterations) {
				clearInterval(interval);
				element.textContent = originalText;
				isRunning = false;
			}
		}, 45);
	}

	scramble();

	element.addEventListener('mouseenter', scramble);
}

/* =========================================================
   PORTFOLIO DATA
   ========================================================= */

var portfolioItems = [];

function buildPortfolioItems(manifest) {
	portfolioItems = [];

	SERIES.forEach(function (series) {
		var files = manifest[series.folder] || [];

		files.forEach(function (file) {
			portfolioItems.push({
				folder: series.folder,
				cat: series.cat,
				title: series.title,
				file: file,
			});
		});
	});

	return portfolioItems;
}

/* =========================================================
   IMAGE CREATION
   ========================================================= */

function createPortfolioItem(item) {
	var article = document.createElement('article');

	article.className = 'portfolio-item';
	article.dataset.category = item.cat;
	article.dataset.title = item.title;

	var figure = document.createElement('figure');

	figure.className = 'portfolio-figure';

	var img = document.createElement('img');

	img.src =
		'img/portfolio/' + item.folder + '/' + encodeURIComponent(item.file);

	img.alt = item.title;

	/*
	 * Important:
	 * Native browser lazy loading.
	 * Images are only loaded as they approach the viewport.
	 */
	img.loading = 'lazy';
	img.decoding = 'async';

	figure.appendChild(img);
	article.appendChild(figure);

	/*
	 * Ást has a completely different layout system.
	 */
	if (item.cat === 'ast') {
		article.classList.add('ast-piece');
	}

	/*
	 * Lightbox
	 */
	article.addEventListener('click', function () {
		openLightbox(img, item.title);
	});

	/*
	 * Ást:
	 * hover only changes stacking order.
	 * No transform.
	 * No animation.
	 * No image movement.
	 */
	if (item.cat === 'ast') {
		article.addEventListener('mouseenter', function () {
			bringAstToFront(article);
		});
	}

	return article;
}

/* =========================================================
   LIGHTBOX
   ========================================================= */

function openLightbox(img, title) {
	if (!lightbox || !lightboxImg) return;

	lightboxImg.src = img.src;
	lightboxImg.alt = img.alt || title || '';

	if (lightboxCaption) {
		lightboxCaption.textContent = title || '';
	}

	lightbox.classList.add('open');
	document.body.classList.add('lightbox-open');
}

function closeLightbox() {
	if (!lightbox) return;

	lightbox.classList.remove('open');
	document.body.classList.remove('lightbox-open');
}

if (lightboxClose) {
	lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
	lightbox.addEventListener('click', function (event) {
		if (event.target === lightbox) {
			closeLightbox();
		}
	});
}

document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		closeLightbox();
	}
});

/* =========================================================
   NORMAL PORTFOLIO SIZES
   =========================================================
   Normal series receive varied sizes, like a gallery hang.
   The image keeps its original proportions:
   never cropped, never stretched, never tilted.
   ========================================================= */

var NORMAL_FORMATS = [
	'size-xs',
	'size-s',
	'size-m',
	'size-l',
	'size-xl',
];

function randomizeNormalItem(item, index, previousFormat) {
	/*
	 * Remove previous size classes.
	 */
	NORMAL_FORMATS.forEach(function (className) {
		item.classList.remove(className);
	});

	/*
	 * Random size, never the same as the previous item.
	 */
	var choices = NORMAL_FORMATS.filter(function (f) {
		return f !== previousFormat;
	});

	var format = choices[Math.floor(Math.random() * choices.length)];
	item.classList.add(format);

	/*
	 * No rotation, no offset: images stay perfectly straight.
	 */
	item.style.removeProperty('--item-rotation');
	item.style.removeProperty('--item-offset-x');

	/*
	 * Reset Ast-specific properties in case the DOM
	 * has been reused.
	 */
	item.style.removeProperty('--ast-x');
	item.style.removeProperty('--ast-y');
	item.style.removeProperty('--ast-width');
	item.style.removeProperty('--ast-height');

	return format;
}

/* =========================================================
   ÁST LAYOUT
   =========================================================
   Ást is intentionally different:
   - small images
   - many images
   - scattered through a large field
   - random rotation
   - no animation
   - no dragging
   ========================================================= */

function randomizeAstItem(item, index, total) {
	/*
	 * Small cards.
	 *
	 * The width is deliberately restrained because there will
	 * be many images.
	 */
  var width = randomBetween(55, 100); 

	/*
	 * Slightly varied heights.
	 *
	 * CSS aspect-ratio / object-fit will preserve the image
	 * without stretching it.
	 */
	var heightRatio = randomBetween(0.75, 1.3);

	var height = width * heightRatio;

	/*
	 * Keep cards inside the field.
	 */
	var x = randomBetween(5, 95);
	var y = randomBetween(4, 96);

	/*
	 * Very small rotation range.
	 */
	var rotation = randomBetween(-8, 8);

	item.style.setProperty('--ast-x', x.toFixed(2) + '%');

	item.style.setProperty('--ast-y', y.toFixed(2) + '%');

	item.style.setProperty('--ast-width', Math.round(width) + 'px');

	item.style.setProperty('--ast-height', Math.round(height) + 'px');

	item.style.setProperty('--ast-rotation', rotation.toFixed(2) + 'deg');

	/*
	 * Absolutely no animation on Ást.
	 */
	item.style.animation = 'none';

	/*
	 * Explicit transform so there is no inherited
	 * movement / hover transform.
	 */
	item.style.transform =
		'translate(-50%, -50%) rotate(' + rotation.toFixed(2) + 'deg)';

	/*
	 * Random stacking.
	 */
	item.style.zIndex = String(10 + index);
}

function bringAstToFront(item) {
	if (!item) return;

	/*
	 * Only z-index changes.
	 * No transform.
	 * No scale.
	 * No movement.
	 */
	item.style.zIndex = String(1000 + (Date.now() % 100000));
}

/* =========================================================
   ÁST FIELD HEIGHT
   =========================================================
   Because Ást cards are absolutely positioned, they do not
   naturally create height in the document.
   This function gives the portfolio enough vertical space.
   ========================================================= */

function resizeAstField() {
	if (!portfolioGrid) return;

	var astItems = portfolioGrid.querySelectorAll('.portfolio-item.ast-piece');

	if (!astItems.length) {
		portfolioGrid.style.minHeight = '';
		return;
	}

	/*
	 * On mobile/tablet Ást goes back into normal flow,
	 * so we don't need the large desktop field.
	 */
	if (isMobileLayout()) {
		portfolioGrid.style.minHeight = '';
		return;
	}

	/*
	 * More images = taller field.
	 *
	 * This is deliberately generous because the cards are
	 * scattered rather than packed into rows.
	 */
	var count = astItems.length;

	var columns = 5;
	var rows = Math.ceil(count / columns);

	var height = Math.max(800, rows * 170 + 300);

	portfolioGrid.style.minHeight = height + 'px';
}

/* =========================================================
   NORMAL MOBILE ÁST LAYOUT
   ========================================================= */

function resetAstForMobile(item) {
	if (!item) return;

	item.style.removeProperty('--ast-x');
	item.style.removeProperty('--ast-y');
	item.style.removeProperty('--ast-width');
	item.style.removeProperty('--ast-height');
	item.style.removeProperty('--ast-rotation');

	item.style.removeProperty('transform');
	item.style.removeProperty('z-index');
	item.style.removeProperty('animation');
}

function applyResponsiveAstLayout() {
	if (!portfolioGrid) return;

	var astItems = portfolioGrid.querySelectorAll('.portfolio-item.ast-piece');

	astItems.forEach(function (item, index) {
		if (isMobileLayout()) {
			resetAstForMobile(item);
		} else {
			randomizeAstItem(item, index, astItems.length);
		}
	});

	resizeAstField();
}

/* =========================================================
   FILTER / RENDER
   ========================================================= */

function renderPortfolio(filter) {
	if (!portfolioGrid) return;

	currentFilter = filter;

	/*
	 * Determine which items should be visible.
	 */
	var items;

	if (filter === 'mixed') {
		/*
		 * Initial mixed portfolio:
		 * Ást is deliberately excluded.
		 */
		items = portfolioItems.filter(function (item) {
			return item.cat !== 'ast';
		});
	} else {
		items = portfolioItems.filter(function (item) {
			return item.cat === filter;
		});
	}

	/*
	 * Random order EVERY time renderPortfolio is called.
	 * shuffleDifferent guarantees the order is not identical
	 * to the previous one for the same filter.
	 */
	items = shuffleDifferent(items, filter);

	/*
	 * Clear previous portfolio.
	 */
	portfolioGrid.innerHTML = '';

	/*
	 * Reset any previous inline height.
	 */
	portfolioGrid.style.minHeight = '';

	/*
	 * Remembers the previous format so two consecutive
	 * items never get the same one.
	 */
	var lastFormat = null;

	/*
	 * Create fresh DOM elements.
	 */
	items.forEach(function (data, index) {
		var element = createPortfolioItem(data);

		portfolioGrid.appendChild(element);

		if (data.cat === 'ast') {
			/*
			 * Ást is scattered on desktop.
			 */
			if (!isMobileLayout()) {
				randomizeAstItem(element, index, items.length);
			} else {
				resetAstForMobile(element);
			}
		} else {
			/*
			 * Every category gets new formats every time.
			 */
			lastFormat = randomizeNormalItem(element, index, lastFormat);
		}
	});

	/*
	 * Give Ást enough space.
	 */
	resizeAstField();
}

/* =========================================================
   CATEGORY NAVIGATION
   ========================================================= */

function initFilters() {
	var links = document.querySelectorAll('.categories a[data-filter]');

	if (!links.length) return;

	links.forEach(function (link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();

			var filter = link.dataset.filter;

			/*
			 * Update active state.
			 */
			links.forEach(function (otherLink) {
				otherLink.classList.remove('active');
			});

			link.classList.add('active');

			/*
			 * Every click generates a new random arrangement.
			 */
			renderPortfolio(filter);

			/*
			 * Scroll gently toward the portfolio.
			 */
			var portfolio = document.getElementById('portfolio');

			if (portfolio) {
				portfolio.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}
		});
	});
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMenu() {
	var menuToggle = document.getElementById('menuToggle');
	var navLinks = document.getElementById('navLinks');
	var simpleNav = document.getElementById('simpleNav');

	if (!menuToggle || !navLinks || !simpleNav) return;

	menuToggle.addEventListener('click', function () {
		var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

		menuToggle.setAttribute('aria-expanded', String(!isOpen));

		/*
		 * The CSS expects the "open" class on .simple-nav,
		 * not on .nav-links.
		 */
		simpleNav.classList.toggle('open');
	});

	/*
	 * Close menu after clicking a navigation link.
	 */
	navLinks.querySelectorAll('a').forEach(function (link) {
		link.addEventListener('click', function () {
			menuToggle.setAttribute('aria-expanded', 'false');

			simpleNav.classList.remove('open');
		});
	});
}

/* =========================================================
   FLOATING SPARKS (hero canvas)
   =========================================================
   - Runs continuously while the hero is visible
   - Fully stops when the hero is off-screen or the tab is
     hidden (no CPU / battery wasted)
   - Restarts as soon as the hero comes back into view
   ========================================================= */

function initBirdy() {
	var canvas = document.querySelector('canvas.birdy');
	var hero = document.querySelector('header.intro');

	if (!canvas || !hero) return;

	/*
	 * Respect users who asked for reduced motion.
	 */
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	var ctx = canvas.getContext('2d');

	if (!ctx) return;

	/*
	 * Tweak these to make the effect more or less present.
	 */
	var COUNT = 14;            // number of sparks (was 7)
	var TRAIL_LEN = 14;        // trail length (was 10)
	var SPEED = 0.5;           // overall speed (was 0.4)
	var SIZE_BOOST = 1.4;      // global size multiplier
	var BLURRY_RATIO = 0.5;    // share of soft blurred sparks
	var ALPHA_BOOST = 1.35;    // global opacity multiplier

	var width, height;
	var frame = 0;
	var trailIndex = 0;
	var particles = [];
	var mouse = { x: 0.5, y: 0.5, z: 0.5 };
	var z = { current: 1, target: 1 };

	/*
	 * Running state.
	 */
	var rafId = null;
	var driftTimer = null;
	var heroVisible = true;
	var pageVisible = !document.hidden;

	function resize() {
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width;
		canvas.height = height;
	}

	function create() {
		particles = [];

		for (var i = 0; i < COUNT; i++) {
			particles.push({
				speed: (0.2 + Math.random() * 0.8) / 2000,
				pos: {
					x: 0.2 + Math.random() * 0.6,
					y: 0.2 + Math.random() * 0.6,
					z: Math.random(),
				},
				move: {
					x: (0.5 - Math.random()) / 100,
					y: (0.5 - Math.random()) / 100,
					z: 0,
				},
				own: { t: (20 + Math.random() * 100) | 0, x: 0, y: 0 },
				trail: new Float32Array(TRAIL_LEN * 2),
				sizeMult: (0.6 + Math.random() * 2.4) * SIZE_BOOST,
				blurry: Math.random() < BLURRY_RATIO,
				jerk: Math.random(),
			});
		}
	}

	function solveMove(p) {
		/*
		 * Blurry / spectral ones drift slowly,
		 * sharp ones stay snappy.
		 */
		var calm = p.blurry ? 0.4 : 1;

		['x', 'y', 'z'].forEach(function (k) {
			if (Math.abs(p.move[k]) > 0.003) p.move[k] *= 0.99;
		});

		if (frame % p.own.t === 0) {
			p.own.x = (0.5 - Math.random()) / 3;
			p.own.y = (0.5 - Math.random()) / 3;
		}

		p.move.x += SPEED * calm * (mouse.x - p.pos.x + p.own.x) * p.speed;
		p.move.y += SPEED * calm * (mouse.y - p.pos.y + p.own.y) * p.speed;
		p.move.z += SPEED * calm * (mouse.z - p.pos.z) * p.speed;

		/*
		 * Staccato kicks: sudden jerky direction changes,
		 * muted for the slow, spectral ones.
		 */
		if (Math.random() < 0.015 + p.jerk * 0.05) {
			p.move.x += (Math.random() - 0.5) * 0.06 * (0.5 + p.jerk) * calm;
			p.move.y += (Math.random() - 0.5) * 0.06 * (0.5 + p.jerk) * calm;
		}
	}

	function trailIdxSet(p, pos) {
		p.trail[trailIndex * 2] = pos.x;
		p.trail[trailIndex * 2 + 1] = pos.y;
	}

	function drawSpark(p) {
		var pos = { x: p.pos.x * width, y: p.pos.y * height, z: p.pos.z * 1.5 };
		var size = Math.max(
			3,
			((width + height) / 500) * pos.z * z.current * p.sizeMult
		);

		trailIdxSet(p, pos);

		/*
		 * Occasional flicker: sometimes skip drawing entirely,
		 * or jump position.
		 */
		var flicker = Math.random();

		if (flicker < 0.04) return;

		var jitter = flicker < 0.14 ? (Math.random() - 0.5) * size * 3 : 0;

		if (p.blurry) {
			/*
			 * Soft blurred square, no channel split:
			 * contrasts with the crisp glitch fragments.
			 */
			ctx.save();
			ctx.filter = 'blur(' + Math.max(1.5, size * 0.55) + 'px)';
			ctx.fillStyle = 'rgba(215,140,135,' + 0.28 * ALPHA_BOOST + ')';
			ctx.fillRect(
				pos.x - size / 1.3 + jitter,
				pos.y - size / 1.3,
				size * 1.6,
				size * 1.6
			);
			ctx.restore();
			return;
		}

		/*
		 * Small squared fragments with a red/cyan channel split.
		 */
		ctx.fillStyle = 'rgba(210,90,85,' + Math.min(1, 0.55 * ALPHA_BOOST) + ')';
		ctx.fillRect(pos.x - size / 2 - 1.2 + jitter, pos.y - size / 2, size, size);

		ctx.fillStyle = 'rgba(120,200,195,' + Math.min(1, 0.45 * ALPHA_BOOST) + ')';
		ctx.fillRect(pos.x - size / 2 + 1.2 + jitter, pos.y - size / 2, size, size);

		ctx.fillStyle = 'rgba(235,225,220,' + Math.min(1, 0.75 * ALPHA_BOOST) + ')';
		ctx.fillRect(pos.x - size / 2 + jitter, pos.y - size / 2, size, size);
	}

	function drawTrails() {
		for (var i = TRAIL_LEN; i >= 2; i--) {
			/*
			 * Skip segments at random for a discontinuous,
			 * glitchy trail instead of a smooth curved tail.
			 */
			if (Math.random() < 0.3) continue;

			ctx.beginPath();
			ctx.lineWidth = Math.max(1, (i / TRAIL_LEN) * ((width + height) / 1500));
			ctx.setLineDash([2, 5]);
			ctx.strokeStyle =
				'rgba(190,100,95,' + Math.min(1, (i / TRAIL_LEN / 3) * ALPHA_BOOST) + ')';

			var cur = (trailIndex + i) % TRAIL_LEN;
			var last = (trailIndex + i + TRAIL_LEN - 1) % TRAIL_LEN;

			particles.forEach(function (p) {
				if (p.trail[last * 2] && p.trail[cur * 2]) {
					ctx.moveTo(p.trail[cur * 2], p.trail[cur * 2 + 1]);
					ctx.lineTo(p.trail[last * 2], p.trail[last * 2 + 1]);
				}
			});

			ctx.stroke();
		}

		ctx.setLineDash([]);
	}

	function tick() {
		try {
			frame++;
			z.current += (z.target - z.current) / 100;

			ctx.clearRect(0, 0, width, height);

			particles.forEach(function (p) {
				solveMove(p);
				p.pos.x += p.move.x;
				p.pos.y += p.move.y;
				p.pos.z += p.move.z;
			});

			drawTrails();

			trailIndex = (trailIndex + 1) % TRAIL_LEN;

			particles.forEach(drawSpark);
		} catch (e) {
			/* never let a transient glitch permanently kill the loop */
		}

		rafId = requestAnimationFrame(tick);
	}

	/*
	 * Re-randomize the wandering target on an irregular
	 * cadence, not a fixed beat.
	 */
	function driftMouse() {
		mouse.x = Math.random();
		mouse.y = Math.random();
		z.target = 0.4 + Math.random() * 0.8;

		driftTimer = setTimeout(driftMouse, 800 + Math.random() * 1600);
	}

	/*
	 * START / STOP
	 * Only one loop can ever run at a time.
	 */
	function start() {
		if (rafId !== null) return;

		resize();
		driftMouse();
		tick();
	}

	function stop() {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		clearTimeout(driftTimer);
		driftTimer = null;
	}

	function update() {
		if (heroVisible && pageVisible) {
			start();
		} else {
			stop();
		}
	}

	/*
	 * Stop when the hero leaves the screen,
	 * restart as soon as any part of it comes back.
	 */
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(
			function (entries) {
				heroVisible = entries[0].isIntersecting;
				update();
			},
			{ threshold: 0 }
		).observe(hero);
	}

	/*
	 * Stop when the tab is hidden.
	 */
	document.addEventListener('visibilitychange', function () {
		pageVisible = !document.hidden;
		update();
	});

	window.addEventListener('resize', resize);

	create();
	update();
}
/* =========================================================
   SIMPLE VISIBILITY OBSERVER
   ========================================================= */

function initVisibilityObserver() {
	if (!('IntersectionObserver' in window)) {
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
				}
			});
		},
		{
			threshold: 0.05,
		}
	);

	document
		.querySelectorAll('#about, #portfolio, #contact')
		.forEach(function (element) {
			observer.observe(element);
		});
}

/* =========================================================
   MANIFEST LOADING
   ========================================================= */

function loadPortfolio() {
	return fetch(MANIFEST_URL, {
		cache: 'no-cache',
	})
		.then(function (response) {
			if (!response.ok) {
				throw new Error('Unable to load portfolio manifest.');
			}

			return response.json();
		})
		.then(function (manifest) {
			buildPortfolioItems(manifest);

			/*
			 * Initial view:
			 * random mixed portfolio,
			 * excluding Ást.
			 */
			renderPortfolio('mixed');
		})
		.catch(function (error) {
			console.error('Portfolio loading error:', error);
		});
}

/* =========================================================
   WINDOW RESIZE
   ========================================================= */

var resizeTimer;

window.addEventListener('resize', function () {
	clearTimeout(resizeTimer);

	resizeTimer = setTimeout(function () {
		applyResponsiveAstLayout();
	}, 150);
});

/* =========================================================
   TINY CLICK SOUND
========================================================= */

var audioCtx = null;

function playClick() {
	try {
		if (!audioCtx) {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		}

		var o = audioCtx.createOscillator();
		var g = audioCtx.createGain();

		o.type = 'sine';
		o.frequency.value = 900 + Math.random() * 300;

		g.gain.setValueAtTime(0.045, audioCtx.currentTime);
		g.gain.exponentialRampToValueAtTime(
			0.0001,
			audioCtx.currentTime + 0.055
		);

		o.connect(g);
		g.connect(audioCtx.destination);

		o.start();
		o.stop(audioCtx.currentTime + 0.06);
	} catch (e) {
		/* no audio support, fail silently */
	}
}

function initClickSound() {
	document
		.querySelectorAll('.simple-nav a, .btn, .categories a')
		.forEach(function (el) {
			el.addEventListener('click', playClick);
		});
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
	initScramble();
	initFilters();
	initMenu();
	initBirdy();
	initVisibilityObserver();
  initClickSound();


	loadPortfolio();
});

window.addEventListener('pageshow', function (event) {
	if (event.persisted && portfolioItems.length) {
		renderPortfolio(currentFilter);
	}
});
