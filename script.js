document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  // Set total frames explicitly to 83
  const TOTAL_FRAMES = 83;
  let frameUrls = [];
  let images = [];
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  let isLoaderHidden = false;

  // Safety timer to force-hide loader after 3 seconds max
  const safetyTimeout = setTimeout(() => {
    hideLoader();
  }, 3000);

  function hideLoader() {
    if (isLoaderHidden) return;
    isLoaderHidden = true;
    clearTimeout(safetyTimeout);
    if (loader) {
      loader.classList.add('hidden');
    }
    updateTargetFrame();
  }

  if (loader) {
    loader.addEventListener('click', hideLoader);
  }

  // Generate default list matching 83 frames in ./images folder
  function generateFallbackUrls() {
    const list = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const num = i.toString().padStart(3, '0');
      list.push(`./images/generate_a_smooth_video_202608110105_${num}.jpg`);
    }
    return list;
  }

  // Load dynamic frame list from server or use 83-frame fallback
  async function resolveFrameUrls() {
    try {
      const res = await fetch('/api/frames');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/frames, using default 83-frame pattern');
    }
    return generateFallbackUrls();
  }

  frameUrls = await resolveFrameUrls();

  // High-DPI Retina Canvas Resize logic
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set backing store dimensions to exact physical pixels for crisp rendering
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Set CSS display dimensions to logical screen pixels
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale canvas context for High-DPI (Retina) displays
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    renderFrame(Math.round(currentFrame));
  }

  // Draw image crisp and centered maintaining aspect ratio
  function drawCoverImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderWidth = width;
      renderHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - renderHeight) / 2;
    } else {
      renderWidth = height * imgRatio;
      renderHeight = height;
      offsetX = (width - renderWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      Math.round(offsetX),
      Math.round(offsetY),
      Math.round(renderWidth),
      Math.round(renderHeight)
    );
  }

  function renderFrame(index) {
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, index));
    const img = images[frameIndex];
    if (img) {
      drawCoverImage(img);
    }
  }

  // Calculate target frame from page scroll position
  function updateTargetFrame() {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
  }

  // Smooth lerp render loop
  function animate() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * 0.15;
      renderFrame(Math.round(currentFrame));
    } else if (Math.round(currentFrame) !== Math.round(targetFrame)) {
      currentFrame = targetFrame;
      renderFrame(Math.round(currentFrame));
    }

    requestAnimationFrame(animate);
  }

  // Preload all 83 images
  function preloadImages() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameUrls[i] || `./images/generate_a_smooth_video_202608110105_${i.toString().padStart(3, '0')}.jpg`;

      const handleLoad = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;

        if (i === 0) {
          renderFrame(0);
        }

        if (loadedCount >= TOTAL_FRAMES) {
          hideLoader();
        }
      };

      img.onload = handleLoad;
      img.onerror = () => {
        handleLoad();
      };

      images.push(img);
    }
  }

  // Initialize Lenis Smooth Scroll if available
  if (typeof Lenis !== 'undefined') {
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      lenis.on('scroll', updateTargetFrame);

      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    } catch (e) {
      window.addEventListener('scroll', updateTargetFrame, { passive: true });
    }
  } else {
    window.addEventListener('scroll', updateTargetFrame, { passive: true });
  }

  window.addEventListener('resize', resizeCanvas);

  // Start initialization
  resizeCanvas();
  preloadImages();
  requestAnimationFrame(animate);
});
