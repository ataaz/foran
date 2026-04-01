(function () {
      // Only initialize the frame sequence when real frame URLs are available.
      const hasFrameData = Array.isArray(window.__FRAME_DATA_URLS) && window.__FRAME_DATA_URLS.length > 0;
      const TOTAL_FRAMES = hasFrameData ? window.__FRAME_DATA_URLS.length : 0;
      const LERP_SPEED = 0.08;
      const images = new Array(TOTAL_FRAMES);
      let currentFrame = 0, targetFrame = 0, loaded = 0, isReady = false;
      const loaderEl = document.getElementById('loader');
      const barEl = document.getElementById('loader-bar');
      const canvas = document.getElementById('bgCanvas');
      const ctx = canvas.getContext('2d');
      function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
      addEventListener('resize', resize); resize();
      function drawFrame(img){ if(!img||!img.naturalWidth) return; const s=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight); const w=img.naturalWidth*s,h=img.naturalHeight*s; ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h); }
      function onFrameLoad(){ loaded++; if(barEl) barEl.style.width=(loaded/TOTAL_FRAMES*100)+'%'; if(loaded>=TOTAL_FRAMES){ isReady=true; if(loaderEl) loaderEl.style.display='none'; animate(); } }
      if (hasFrameData) {
        for(let i=0;i<TOTAL_FRAMES;i++){ images[i]=new Image(); images[i].onload=onFrameLoad; images[i].onerror=onFrameLoad; images[i].src=window.__FRAME_DATA_URLS[i]; }
      } else {
        isReady = true;
        if (loaderEl) loaderEl.style.display = 'none';
        if (canvas) canvas.style.display = 'none';
      }
      
      // CORE SCROLL LOGIC - KEEPS MAPPING INTACT
      function getScrollProgress(){
        const doc = document.documentElement;
        // Map animation exactly to the full scrollable height of the page.
        const maxScroll = Math.max(doc.scrollHeight - innerHeight, 1);
        return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      }
      function updateHero(){
        const hero = document.getElementById('heroContent');
        if (!hero) return;
        const heroHideDistance = Math.max(window.innerHeight * 0.42, 280);
        const heroScroll = Math.min(window.scrollY / heroHideDistance, 1);
        const easedScroll = 1 - Math.pow(1 - heroScroll, 2);
        const o = Math.max(0, 1 - easedScroll);
        hero.style.opacity = String(o);
        hero.style.visibility = o < 0.02 ? 'hidden' : 'visible';
        hero.style.transform = 'translateY(' + (easedScroll * -72) + 'px)';
        hero.style.pointerEvents = o < 0.08 ? 'none' : 'auto';
      }
      function animate(){
        if (isReady && TOTAL_FRAMES > 0) targetFrame = getScrollProgress() * (TOTAL_FRAMES - 1);
        currentFrame += (targetFrame-currentFrame)*LERP_SPEED;
        const idx=Math.round(currentFrame);
        if(idx>=0&&idx<TOTAL_FRAMES) drawFrame(images[idx]);
        updateHero();
        if (TOTAL_FRAMES > 0) requestAnimationFrame(animate);
      }
      addEventListener('scroll', updateHero, { passive: true });
      updateHero();
      
      // CURSOR LOGIC - KEEPS INTERACTION INTACT
      const dot=document.getElementById('cursorDot'), ring=document.getElementById('cursorRing'); let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,lastRipple=0;
      addEventListener('mousemove',(e)=>{ mx=e.clientX; my=e.clientY; if(dot){ dot.style.left=mx+'px'; dot.style.top=my+'px'; }
        const now=performance.now(); if(now-lastRipple>85){ const r=document.createElement('span'); r.className='cursor-ripple'; r.style.left=mx+'px'; r.style.top=my+'px'; document.body.appendChild(r); setTimeout(()=>r.remove(),580); lastRipple=now; }
      });
      (function loop(){ rx+=(mx-rx)*0.15; ry+=(my-ry)*0.15; if(ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; } requestAnimationFrame(loop); })();
      
      // Add hover effect to cursor ring for links
      document.querySelectorAll('a, button').forEach(el => {
        // CHANGED: Hover color to red
        el.addEventListener('mouseenter', () => { if(ring) ring.style.borderColor = 'var(--neon-red)'; });
        el.addEventListener('mouseleave', () => { if(ring) ring.style.borderColor = 'rgba(255,255,255,.55)'; });
      });

      // NEW: Intersection Observer for scroll animations
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Optional: remove class to re-trigger animation on scroll up
            // entry.target.classList.remove('is-visible');
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

      // CHANGED: Observe new animation classes as well
      const animatedElements = document.querySelectorAll('.animate-block, .animate-zoom, .animate-fade');
      animatedElements.forEach(el => observer.observe(el));

      const hoverImages = document.querySelectorAll('.section-app-icon');
      hoverImages.forEach((el) => {
        el.classList.add('hover-float');
        el.addEventListener('mouseenter', () => {
          if (window.innerWidth <= 900) return;
          el.style.transform = 'translate3d(0,-12px,0) scale(1.04)';
        });
        el.addEventListener('mousemove', (event) => {
          if (window.innerWidth <= 900) return;
          const rect = el.getBoundingClientRect();
          const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
          const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
          const moveX = offsetX * 28;
          const moveY = offsetY * 28 - 12;
          el.style.transform = 'translate3d(' + moveX + 'px,' + moveY + 'px,0) scale(1.04)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translate3d(0,0,0)';
        });
      });
    })();
