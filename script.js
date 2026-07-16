document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------------------------
        STARTUP DUST & LIGHT RAY MATRIX ENGINE
    ------------------------------------------- */
    const canvas = document.getElementById('startup-dust-canvas');
    if (!canvas) return; // Terminate engine if initialized inside index.html home workspace
   
    const ctx = canvas.getContext('2d');
    const panel = document.getElementById('main-panel');
    const lightRay = document.getElementById('window-light-ray');
    let particles = [];
    let mouse = { x: undefined, y: undefined, radius: 140 };




    const windowImg = new Image();
    windowImg.src = 'assets/window.png';




    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();




    function getCenterTarget() {
        const rect = panel.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }




    class Particle {
        constructor(isInitial = false) {
            this.reset();
            if (isInitial) {
                this.y = Math.random() * canvas.height;
                this.x = (canvas.width * 0.58) + (Math.random() * 400 - 200);
                this.alpha = Math.random() * this.maxAlpha;
            }
        }
        reset() {
            this.y = -20 - (Math.random() * 100);
            this.x = (canvas.width * 0.58) + (Math.random() * 400 - 200);
            this.size = Math.random() * 1.5 + 0.4;
            this.alpha = 0;
            this.maxAlpha = Math.random() * 0.5 + 0.15;
            this.vx = (Math.random() * 0.2 - 0.1) - 0.15;
            this.vy = Math.random() * 0.3 + 0.25;        
            this.repelAngleOffset = (Math.random() * Math.PI * 0.5) - (Math.PI * 0.25);
            this.isDead = false;
            this.spawnX = this.x;
        }
        update() {
            if (mouse.x !== undefined && mouse.y !== undefined) {
                let mDx = this.x - mouse.x; let mDy = this.y - mouse.y;
                let mDist = Math.sqrt(mDx * mDx + mDy * mDy);
                if (mDist < mouse.radius) {
                    let baseAngle = Math.atan2(mDy, mDx);
                    let finalAngle = baseAngle + this.repelAngleOffset;
                    let force = (mouse.radius - mDist) / mouse.radius;
                    this.x += Math.cos(finalAngle) * force * 3.5;
                    this.y += Math.sin(finalAngle) * force * 3.5;
                }
            }
            this.x += this.vx; this.y += this.vy;
            if (this.y > 0 && this.alpha < this.maxAlpha) this.alpha += 0.008;
            let distanceFromStream = Math.abs(this.x - (this.spawnX + (this.y * 0.1)));
            if (distanceFromStream > 350) { this.alpha -= 0.01; if (this.alpha <= 0) this.isDead = true; }
            const target = getCenterTarget();
            const tDx = target.x - this.x; const tDy = target.y - this.y;
            const tDist = Math.sqrt(tDx * tDx + tDy * tDy);
            if (tDist < 160) { this.alpha -= 0.04; if (this.alpha <= 0) this.isDead = true; }
            if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) this.isDead = true;
            if (this.isDead) this.reset();
        }
        draw() {
            const rect = panel.getBoundingClientRect();
            if (this.x > rect.left && this.x < rect.right && this.y > rect.top && this.y < rect.bottom) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 4; ctx.shadowColor = '#ffffff';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }




    for (let i = 0; i < 35; i++) { particles.push(new Particle(true)); }




    function drawDarkWindowTexture() {
        if (windowImg.complete && windowImg.naturalWidth !== 0) {
            ctx.save(); ctx.globalAlpha = 0.16; ctx.globalCompositeOperation = 'multiply';
            const sizeFactor = window.innerHeight * 0.75;
            const imgW = sizeFactor * 1.3; const imgH = sizeFactor * 1.3;
            const posX = (canvas.width * 0.35); const posY = -(window.innerHeight * 0.15);
            ctx.drawImage(windowImg, posX, posY, imgW, imgH); ctx.restore();
        }
    }




    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDarkWindowTexture();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();




    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX; mouse.y = e.clientY;
        const rayX = (e.clientX / window.innerWidth) * 100;
        const rayY = (e.clientY / window.innerHeight) * 100;
        lightRay.style.setProperty('--ray-x', `${70 + rayX * 0.05}%`);
        lightRay.style.setProperty('--ray-y', `${15 + rayY * 0.05}%`);




        const sheenName = document.getElementById('sheen-name');
        const panelRect = sheenName.getBoundingClientRect();
        const mx = ((e.clientX - panelRect.left) / panelRect.width) * 100;
        const my = ((e.clientY - panelRect.top) / panelRect.height) * 100;
        sheenName.style.setProperty('--mx', `${mx}%`);
        sheenName.style.setProperty('--my', `${my}%`);




        const powerBtn = document.getElementById('power-btn');
        const reflection = document.getElementById('btn-reflection');
        const btnRect = powerBtn.getBoundingClientRect();
        const bx = e.clientX - (btnRect.left + btnRect.width / 2);
        const by = e.clientY - (btnRect.top + btnRect.height / 2);
       
        if (Math.sqrt(bx*bx + by*by) < 150) {
            reflection.style.opacity = '0.15';
            reflection.style.transform = `translate(calc(-50% + ${bx * 0.4}px), calc(-50% + ${by * 0.4}px)) scale(0.85)`;
        } else { reflection.style.opacity = '0'; }
    });




    /* -------------------------------------------
        STARTUP DISC — HOVER-TO-SPIN (desktop) /
        DRAG-TO-ROTATE (mobile) ENGINE
        Spins ONLY when the pointer/finger is over the
        rotating disc band itself — never over the power
        button or the area around it — and plays
        assets/dialoge.mp3 while it rotates.
    ------------------------------------------- */
    (function setupDiscRotation() {
        const ringWrapper = document.getElementById('startup-ring-wrapper');
        const ringText = document.querySelector('.startup-ring-text');
        if (!ringWrapper || !ringText) return;

        const dialAudio = new Audio('assets/dialoge.mp3');
        dialAudio.loop = true;

        // Browsers block audio.play() unless it's tied to a genuine user
        // gesture — a hover/mousemove does NOT count as one, only a real
        // click/tap/keypress does. Prime the audio element on the very
        // first such gesture so subsequent hover-triggered play() calls
        // are no longer silently blocked.
        function unlockDialAudio() {
            dialAudio.play().then(() => dialAudio.pause()).catch(() => {});
            window.removeEventListener('pointerdown', unlockDialAudio);
            window.removeEventListener('keydown', unlockDialAudio);
        }
        window.addEventListener('pointerdown', unlockDialAudio, { once: true });
        window.addEventListener('keydown', unlockDialAudio, { once: true });

        // The disc band sits between the outer edge of the power button
        // (~75% of the wrapper's radius) and the rim of the ring.
        const DISC_INNER_RATIO = 0.75;
        const DISC_OUTER_RATIO = 1.05;

        let discRotation = 0;
        let isDragging = false;
        let dragStartAngle = 0;
        let dragStartRotation = 0;
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

        function pointerInfo(clientX, clientY) {
            const rect = ringWrapper.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = rect.width / 2;
            return { dx, dy, ratio: radius ? dist / radius : 0 };
        }

        function isOverDisc(clientX, clientY) {
            const { ratio } = pointerInfo(clientX, clientY);
            return ratio >= DISC_INNER_RATIO && ratio <= DISC_OUTER_RATIO;
        }

        function playDialAudio() {
            dialAudio.currentTime = dialAudio.currentTime || 0;
            dialAudio.play().catch(() => {});
        }
        function stopDialAudio() {
            dialAudio.pause();
        }

        if (!isCoarsePointer) {
            // ---- Laptop / desktop: spin only while hovering the disc band ----
            ringWrapper.addEventListener('mousemove', (e) => {
                if (isDragging) return;
                if (isOverDisc(e.clientX, e.clientY)) {
                    if (!ringText.classList.contains('is-spinning')) {
                        ringText.classList.add('is-spinning');
                        playDialAudio();
                    }
                } else if (ringText.classList.contains('is-spinning')) {
                    ringText.classList.remove('is-spinning');
                    stopDialAudio();
                }
            });
            ringWrapper.addEventListener('mouseleave', () => {
                if (ringText.classList.contains('is-spinning')) {
                    ringText.classList.remove('is-spinning');
                    stopDialAudio();
                }
            });
        } else {
            // ---- Mobile / touch: click + physically drag the disc to spin it ----
            ringWrapper.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                if (!touch || !isOverDisc(touch.clientX, touch.clientY)) return;
                isDragging = true;
                const { dx, dy } = pointerInfo(touch.clientX, touch.clientY);
                dragStartAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                dragStartRotation = discRotation;
                playDialAudio();
            }, { passive: true });

            ringWrapper.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const touch = e.touches[0];
                if (!touch) return;
                const { dx, dy } = pointerInfo(touch.clientX, touch.clientY);
                const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                discRotation = dragStartRotation + (currentAngle - dragStartAngle);
                ringText.style.transform = `rotate(${discRotation}deg)`;
            }, { passive: true });

            function endDrag() {
                if (!isDragging) return;
                isDragging = false;
                stopDialAudio();
            }
            ringWrapper.addEventListener('touchend', endDrag);
            ringWrapper.addEventListener('touchcancel', endDrag);
        }
    })();




    /* -------------------------------------------
        BOOT ANIMATION SEQUENCER ARCHITECTURE
    ------------------------------------------- */
    const powerBtn = document.getElementById('power-btn');
    const termScreen = document.getElementById('terminal-screen');
    const upperPane = document.getElementById('terminal-upper-pane');
    const lowerPane = document.getElementById('terminal-lower-pane');
    const logOutput = document.getElementById('terminal-log-output');
    const logo = document.getElementById('capsule-logo');
    const roboLayer = document.getElementById('robo-os-layer');
    const segmentsBox = document.getElementById('loadbar-segments-box');
    const whiteFlash = document.getElementById('white-flash');




    const totalSegments = 16;
    for (let s = 0; s < totalSegments; s++) {
        const seg = document.createElement('div');
        seg.className = 'load-segment';
        segmentsBox.appendChild(seg);
    }
    const segmentElements = document.querySelectorAll('.load-segment');




    const bootScript = [
        "Capsule Corp BIOS v4.51PGR, An Energy Star Ally\nCopyright (C) Capsule Corp Industries, West City\n",
        "\nChecking System Health...\nMemory Test .......... 32768K OK\n",
        "\nLoading Career.SYS - Booting Reverse-Chronologically...\nTotal Experience ...... 1 Year and 2 months\nCopperpod - 6 months\nResearch Analyst Intern......Jan 2024- Aug 2024\nBIRD Lab, IIT Jodhpur\nLower Limb Exoskeleton......Sept 2025\nDextrous Robotic Hand................2025-2026\nPika Quadruped..................2025-2026\n",
        "\nPositions of Responsibility\nNatyamanch Executive Member.....2021-2025\nBranch In-charge......2023-2025\n",
        "\nCalculating 3D Vectors... OK\nCompiling Pixel Shaders... OK\nReady to Design... OK\nBooting System...\n",
        "<span style='color:#00ffaa; text-shadow:0 0 6px rgba(0,255,170,0.4); font-weight:bold;'>\nC:> LOAD_SCENE.EXE</span>\n"
    ];




    powerBtn.addEventListener('mousedown', () => { powerBtn.classList.add('pressed'); });
    window.addEventListener('mouseup', () => {
        if (powerBtn.classList.contains('pressed')) {
            powerBtn.classList.remove('pressed'); triggerTerminalBoot();
        }
    });




    function triggerTerminalBoot() {
        gsap.to(panel, { scale: 0.85, opacity: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => {
            panel.style.display = 'none'; termScreen.style.display = 'flex';
            gsap.to(termScreen, { scaleY: 1, duration: 0.5, ease: "expo.out", onComplete: startTextDeployment });
        }});
    }




    function typeText(text, speed = 8) {
        return new Promise((resolve) => {
            let i = 0; let inTag = false;
            function type() {
                if (i < text.length) {
                    let char = text.charAt(i);
                    if (char === '<') inTag = true;
                    if (char === '>') { inTag = false; logOutput.innerHTML += '>'; i++; type(); return; }
                    logOutput.innerHTML += char; i++;
                    upperPane.scrollTop = upperPane.scrollHeight;
                    setTimeout(type, inTag ? 0 : speed);
                } else { resolve(); }
            }
            type();
        });
    }




    async function startTextDeployment() {
        logOutput.innerHTML = ""; upperPane.scrollTop = 0;
        segmentElements.forEach(el => el.style.opacity = 0);
        roboLayer.style.display = 'none'; roboLayer.style.opacity = 0;
        upperPane.style.opacity = 1; lowerPane.style.opacity = 1;
        gsap.to(logo, { opacity: 1, duration: 0.3 });
        await new Promise(r => setTimeout(r, 200));




        await typeText(bootScript[0], 10); await new Promise(r => setTimeout(r, 1000));
        await typeText(bootScript[1], 12); await new Promise(r => setTimeout(r, 800));
        await typeText(bootScript[2], 6);  await new Promise(r => setTimeout(r, 600));
        await typeText(bootScript[3], 8);  await new Promise(r => setTimeout(r, 400));
        await typeText(bootScript[4], 10); await new Promise(r => setTimeout(r, 500));
        await typeText(bootScript[5], 15);




        await new Promise(r => setTimeout(r, 800));
        gsap.to([upperPane, lowerPane, logo], { opacity: 0, duration: 0.4, onComplete: launchRoboOSLoader });
    }




    function launchRoboOSLoader() {
        roboLayer.style.display = 'flex';
        gsap.to(roboLayer, { opacity: 1, duration: 0.5, onComplete: triggerProgressBarFilling });
    }




    function triggerProgressBarFilling() {
        let currentSeg = 0;
        function fillSegment() {
            if (currentSeg < totalSegments) {
                segmentElements[currentSeg].style.opacity = 1; currentSeg++;
                let randomSpeedGap = Math.random() * 140 + 50;
                if (currentSeg === 4 || currentSeg === 11) randomSpeedGap += 300;
                setTimeout(fillSegment, randomSpeedGap);
            } else {
                setTimeout(executeWhiteFlashTransition, 600);
            }
        }
        fillSegment();
    }




    const flickerAudio = new Audio('assets/flicker.mp3');
    const FLICKER_FALLBACK_HOLD_MS = 1400; // used only if the audio's length can't be read in time

    // CRITICAL TRANSITION ROUTE: Fires the flash overlay only after the boot sequences terminate
    function executeWhiteFlashTransition() {
        function goToMain() {
            // Signal the parent index.html wrapper that the boot is complete
            if (window.parent && window.parent !== window) {
                window.parent.postMessage('bootComplete', '*');
            } else {
                // Fallback protection if opened directly outside iframe environment
                window.location.href = "main.html";
            }
        }

        // Step 1: fade the screen to full white first.
        gsap.to(whiteFlash, { opacity: 1, duration: 0.4, ease: "power2.out", onComplete: () => {
            // Step 2: only once it's fully white, start the flicker sound.
            flickerAudio.currentTime = 0;
            flickerAudio.play().catch(() => {});

            // Step 3: let it play out fully, then load main.html.
            const knownDuration = isFinite(flickerAudio.duration) && flickerAudio.duration > 0
                ? flickerAudio.duration
                : null;
            const holdMs = knownDuration ? knownDuration * 1000 : FLICKER_FALLBACK_HOLD_MS;
            setTimeout(goToMain, holdMs);
        }});
    }
});
/* ==========================================================================
   PROJECTS MATRIX CONTROLLER (CLAMPED SEGMENT TRACKING PARADIGM)
   ========================================================================== */
/* ==========================================================================
   PROJECTS MATRIX CONTROLLER (CLAMPED SEGMENT TRACKING PARADIGM)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const stagePjm = document.getElementById('stage-pjm-wrapper');
    if (!stagePjm) return;




    // Structurally mapped profile array tracking specific asset targets
    const portfolioYears = [
      {
        year: "2019",
        role: "Education : 10th grade, ICSE, India",
        detail: "City: Gorakhpur, Uttar Pradesh",
        type: "image",
        source: "assets/1.jpg"
      },
      {
        year: "2021",
        role: "Education : 12th grade, CBSE, India",
        detail: "City: Gorakhpur, Uttar Pradesh",
        type: "image",
        source: "assets/2.jpg"
      },
      {
        year: "2022-2025",
        role: "Education : PEC India",
        detail: "Joined Punjab Engineering College, Chandigarh.<br><br><span class='bullet-line'>• Recipient of the Certificate of Achievement Award in All-rounder category in 2023</span><span class='bullet-line'>• Recipient of the Certificate of Achievement Award in All-rounder category in 2024</span><span class='bullet-line'>• Recipient of the Achiever's Award in 2025</span>",
        type: "projects",
        projects: [
          { title: "Detachable powerdrive for Manual Wheelchairs", desk: "Modular motorized drive subsystem engineered for dynamic retrofitting setups.", color: "#718096" },
          { title: "Object-Detection-and-Reidentification-using-Yolov11-Model", desk: "Computer vision optimization loops processing unified frame identification paths.", color: "#4a5568" }
        ]
      },
      {
        year: "2024",
        role: "Copperpod IP, India",
        detail: "Worked as Research Analyst Intern on technical analysis of 80+ Patents over a period of 6 months.",
        type: "image",
        source: "assets/3.jpg"
      },
      {
        year: "2026",
        role: "IIT Jodhpur, India",
        detail: "Worked at BIRD LAB in Indian Institute of Technology in Rajasthan, India.",
        type: "projects",
        projects: [
          { title: "PIKA Quadruped", desk: "Chassis locomotion pipeline utilizing embedded inverse kinematics calculations.", color: "#1a202c" },
          { title: "EMG and Voice based Prosthetic Robotic hands", desk: "Biomimetic signal loop translation handling raw muscle/audio capture tracking arrays.", color: "#2d3748" },
          { title: "Dextrous robotic Hand - Patent Pending", desk: "Multi-DoF anthropomorphic system layout optimization framework.", color: "#4a5568" },
          { title: "Lower limb Exoskeleton", desk: "Active torque compensation array rendering high-torque walking profiles.", color: "#718096" }
        ]
      }
    ];




    const vinylDisc = document.getElementById('vinyl-pjm-disc');
    const scrollHint = document.getElementById('hint-pjm-footer');
    const yearNode = document.getElementById('t-year-pjm');
    const roleNode = document.getElementById('t-role-pjm');
    const detailNode = document.getElementById('t-detail-pjm');
    const spotMask = document.getElementById('spotlight-pjm-mask');
   
    const scrollBoxWrapper = document.getElementById('projects-pjm-scroll-box');
    const projectListContainer = document.getElementById('projects-pjm-list');
    const mediaFrameBox = document.getElementById('media-frame-pjm-box');
    const mediaFrameImg = document.getElementById('media-frame-pjm-img');




    let isBlackoutActive = false;




    function executeFlickerCycle() {
        if (isBlackoutActive) return;
        let randomIntensity = 0.82 + Math.random() * 0.18;
        if (Math.random() < 0.06) randomIntensity = 0.2 + Math.random() * 0.25;
        spotMask.style.opacity = randomIntensity.toFixed(2);
    }
    setInterval(executeFlickerCycle, 110);




    function triggerLensBlackout() {
        isBlackoutActive = true;
        spotMask.style.opacity = '0';
        setTimeout(() => { isBlackoutActive = false; }, 190);
    }




    /* -------------------------------------------
        PRECISE SPACING CRADLE ENGINE
    ------------------------------------------- */
    const totalItems = portfolioYears.length;
    const allocationDegPerYear = 45;
   
    const minAngleLimit = -(totalItems - 1) * allocationDegPerYear;
    const maxAngleLimit = 0;




    let dynamicAngle = minAngleLimit; // Bootstrap positioned at 2026 terminal index
    let rotationalVel = 0;
    let baselineIndex = -1;
    let hasUserInteracted = false;




    function initTerminalProjectLaunch(projectName) {
        console.log(`[System Deployment]: Triggering Terminal pipeline for context -> "${projectName}"`);
    }




    function renderActiveYear(targetIndex) {
        if (targetIndex === baselineIndex) return;
        baselineIndex = targetIndex;
        triggerLensBlackout();
       
        const packageData = portfolioYears[targetIndex];
       
        [yearNode, roleNode, detailNode, scrollBoxWrapper, mediaFrameBox].forEach(node => node.style.opacity = 0);
       
        setTimeout(() => {
            yearNode.textContent = packageData.year;
            roleNode.textContent = packageData.role;
           
            // --- PARSES LIVE HTML DURING TYPING HOOKS ---
            let textCursor = 0;
            detailNode.innerHTML = "";
           
            function executeInlineHtmlType() {
                if (textCursor < packageData.detail.length) {
                    if (packageData.detail.charAt(textCursor) === '<') {
                        let closingTagIndex = packageData.detail.indexOf('>', textCursor);
                        if (closingTagIndex !== -1) {
                            detailNode.innerHTML += packageData.detail.substring(textCursor, closingTagIndex + 1);
                            textCursor = closingTagIndex + 1;
                            executeInlineHtmlType();
                            return;
                        }
                    }
                    detailNode.innerHTML += packageData.detail.charAt(textCursor);
                    textCursor++;
                    setTimeout(executeInlineHtmlType, 4);
                }
            }
            executeInlineHtmlType();
           
            // Layout Generation Switch Module
            if (packageData.type === "image") {
                scrollBoxWrapper.classList.add('hidden-pjm-view');
                mediaFrameBox.classList.remove('hidden-pjm-view');
                mediaFrameImg.src = packageData.source;
                mediaFrameImg.alt = `Data card for ${packageData.year}`;
                mediaFrameBox.style.opacity = 1;
            } else {
                mediaFrameBox.classList.add('hidden-pjm-view');
                scrollBoxWrapper.classList.remove('hidden-pjm-view');
               
                projectListContainer.innerHTML = '';
               
                packageData.projects.forEach((proj, index) => {
                    const projectCardNode = document.createElement('div');
                    projectCardNode.className = 'item-pjm-card';
                    projectCardNode.innerHTML = `
                        <span class="index-pjm-num">0${index + 1}</span>
                        <div class="swatch-pjm-color" style="background:${proj.color};"></div>
                        <div class="body-pjm-meta">
                            <h3>${proj.title}</h3>
                            <p>${proj.desk}</p>
                        </div>
                    `;
                   
                    projectCardNode.addEventListener('click', () => {
                        initTerminalProjectLaunch(proj.title);
                    });
                   
                    projectListContainer.appendChild(projectCardNode);
                });
               
                scrollBoxWrapper.scrollTop = 0;
                scrollBoxWrapper.style.opacity = 1;
            }
           
            [yearNode, roleNode].forEach(node => node.style.opacity = 1);
            detailNode.style.opacity = 1;
        }, 160);
    }




    stagePjm.addEventListener('wheel', event => {
        event.preventDefault();
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            scrollHint.style.opacity = '0';
        }
       
        rotationalVel -= event.deltaY * 0.015;
    }, { passive: false });




    function renderLoopTick() {
        dynamicAngle += rotationalVel;
        rotationalVel *= 0.88;
        if (Math.abs(rotationalVel) < 0.01) rotationalVel = 0;
       
        // Rigid hard clamp limits
        if (dynamicAngle > maxAngleLimit) {
            dynamicAngle = maxAngleLimit;
            rotationalVel = 0;
        } else if (dynamicAngle < minAngleLimit) {
            dynamicAngle = minAngleLimit;
            rotationalVel = 0;
        }
       
        vinylDisc.style.transform = `rotate(${dynamicAngle}deg)`;
       
        const stepProgression = Math.abs(dynamicAngle / allocationDegPerYear);
        const targetedIndex = Math.max(0, Math.min(totalItems - 1, Math.round(stepProgression)));
       
        renderActiveYear(targetedIndex);
       
        requestAnimationFrame(renderLoopTick);
    }
   
    // Explicit system setup vector points to 2026 baseline item on page launch
    renderActiveYear(portfolioYears.length - 1);
    requestAnimationFrame(renderLoopTick);
});




/* ==========================================================
   PAGE: index.html  (boot shell / iframe swap)
   ========================================================== */
(function () {
        // Listen for the custom event sent from inside the loader iframe
        window.addEventListener('message', function(event) {
            if (event.data === 'bootComplete') {
                const loader = document.getElementById('loader-view');
                const mainContent = document.getElementById('main-view');




                // Instant transition match to handle the white flash elegantly
                mainContent.style.pointerEvents = 'auto';
                mainContent.style.opacity = '1';
                loader.style.opacity = '0';




                // Clean up the loader iframe completely after it fades out
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }
        });
    })();


/* ==========================================================
   PAGE: main.html
   ========================================================== */
(function () {
        document.addEventListener('DOMContentLoaded', () => {
            // Handle fade-out of the white flash screen on successful landing page entry
            gsap.to("#white-flash", { opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => {
                document.getElementById("white-flash").remove();
            }});
            gsap.to("#home-page", { opacity: 1, duration: 0.6 });




            const btnHome = document.getElementById('nav-home');
            const btnContact = document.getElementById('nav-contact');
            const viewHome = document.getElementById('view-home');
            const viewContact = document.getElementById('view-contact');




            const updateNav = (activeBtn) => {
                [btnHome, btnContact].forEach(btn => {
                    if(btn) btn.classList.remove('active');
                });
                activeBtn.classList.add('active');
            };




            btnHome.addEventListener('click', (e) => {
                e.preventDefault();
                updateNav(btnHome);
                viewContact.classList.add('hidden');
                viewHome.classList.remove('hidden');
            });




            btnContact.addEventListener('click', (e) => {
                e.preventDefault();
                updateNav(btnContact);
                viewHome.classList.add('hidden');
                viewContact.classList.remove('hidden');
            });
           
            updateNav(btnHome);
        });
    })();


/* ==========================================================
   PAGES: media.html + timeline.html  (shared 'PJM gallery' module —
   identical inline <script> block was duplicated on both pages,
   kept once here. NOTE: the <script type="importmap"> and the
   <script type="module"> (three.js GLB loader) blocks on those two
   pages were intentionally left inline — module/importmap scripts
   cannot be merged into a classic deferred script.js without
   changing how the browser loads/executes them.)
   ========================================================== */


  // True Cycloid loops
  const setupTrueLoop = (colId) => {
    const col = document.getElementById(colId);
    const originalCards = Array.from(col.children);
    originalCards.forEach(card => col.appendChild(card.cloneNode(true)));
    originalCards.forEach(card => col.insertBefore(card.cloneNode(true), col.firstChild));
  };
 
  setupTrueLoop('col1');
  setupTrueLoop('col2');
  setupTrueLoop('col3');




  const getSingleSetHeight = (colId) => {
    const col = document.getElementById(colId);
    return col.scrollHeight / 3;
  };




  const set1Height = getSingleSetHeight('col1');
  const set2Height = getSingleSetHeight('col2');
 
  gsap.set("#col1, #col3", { y: -set1Height });
  gsap.set("#col2", { y: -set2Height * 1.5 });




  const wrapper = document.querySelector(".parallax-wrapper");




  let masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      pin: true,
      scrub: 1.2,
      start: "top top",
      end: "+=7000",
      invalidateOnRefresh: true
    }
  });




  masterTl.to(wrapper, {
    x: () => -(wrapper.scrollWidth - window.innerWidth),
    ease: "none"
  }, 0);




  masterTl.to(".nav-container", {
    opacity: 0,
    y: -45,
    pointerEvents: "none",
    duration: 0.05,
    ease: "power2.out"
  }, 0);




  masterTl.to("#col1, #col3", {
    y: () => -(set1Height * 2),
    ease: "none"
  }, 0);




  masterTl.to("#col2", {
    y: () => -set2Height * 0.5,
    ease: "none"
  }, 0);




  masterTl.to(".white-card-cover", {
    y: "0%",
    ease: "power2.out"
  }, 0.75);




  masterTl.to(".nav-container", {
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    duration: 0.1,
    ease: "power2.out"
  }, 0.77);




  /* ==========================================
     LIGHTBOX / DIALOG CAROUSEL DATA PIPELINE
     ========================================== */
  const galleryData = [
    { src: "assets/image_1.jpg", title: "Alumni Meet 2025", desc: "Visited my alma mater for the Alumni Meet conducted at Little Flower School, Gorakhpur in October 2025." },
    { src: "assets/image10.jpeg", title: "IIT Roorkee", desc: "Participated in various competitions at Thomso 2022-2023 at Indian Institute of Technology, Roorkee, India" },
    { src: "assets/image_12.jpeg", title: "IIT Kharagpur", desc: "A team participated in cultural fest Springfest 2022-23 organized by Indian Institute of Technology, Kharagpur, India and won the 4th prize" },
    { src: "assets/theatre.jpg", title: "Creative Horizon", desc: "Wrote and Directed various theatre plays as a Member of Natyamanch Drama Society from 2022-2025." },
    { src: "assets/school.jpg", title: "School Life", desc: "Met the Principal of my school before the commencement of the college journey." },
    { src: "assets/image_15.jpg", title: "Major Project Presentation", desc: "Presented the final year project on \"Development of a detachable Power Drive for Manual Wheelchairs\" at PEC Chandigarh." },
    { src: "assets/image_16.jpeg", title: "Sports Organizing Committee", desc: "Served as an active member of the Sports Organizing Team through the seasons of 2022-23 and 2023-24." },
    { src: "assets/image_20.jpeg", title: "Neurorobotics Hackathon", desc: "An interaction session with various professors regarding Intellectual Property Rights." },
    { src: "assets/hack.jpg", title: "Hackathon Team - StormBreakers", desc: "Collaborative hackathon team that had a brilliant run across various hackathons including Bajaj Ohm 2025." },
    { src: "assets/image_18.jpeg", title: "IIT Bombay", desc: "Participated in various events at the Asia's Largest Student-run Fest Mood Indigo in the 2024-2025 season conducted by Indian Institute of Technology, Bombay, India." },
    { src: "assets/image_19.jpeg", title: "Branch Incharge", desc: "Served as the Branch Incharge of ECE and VLSI Branches for 3 consecutive years for 2022-26, 2023-27 and 2024-28 batches of PEC Chandigarh" },
    { src: "assets/image-21.jpg", title: "IIT Jodhpur", desc: "Currently working at BIRD Lab in Indian Institute of Technology Jodhpur, India Under Dr. Bhivraj Suthar in embedded systems domain." },
    { src: "assets/image_22.jpeg", title: "Core Milestone", desc: "Lifted the Best Contingent Trophy at Indian Institute of Technology, Mandi by representing PEC Chandigarh at multiple events held in 2024-25 season." },
    { src: "assets/image_23.jpeg", title: "Award Ceremony", desc: "Recepient of the Achiever's Award from PEC Chandigarh for my contributions to the Cultural and Technical Co-ordination Committees." },
    { src: "assets/image_24.jpeg", title: "Convocation 2025", desc: "Received my B.Tech degree in Electroncis and Communication Engineering with a minor in Digital VLSI Technologies." },
    { src: "assets/image_25.jpeg", title: "Hackathon Committee", desc: "Successfully conducted a Neuro-Robotics Hackathon, fostering innovation and collaboration among interdisciplinary students from IIT Jodhpur." }
  ];




  let currentGalleryIndex = 0;
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDesc = document.getElementById("lightbox-desc");




  const openLightbox = (idx) => {
    currentGalleryIndex = parseInt(idx);
    updateLightboxContent();
    lightbox.classList.add("active");
  };




  const updateLightboxContent = () => {
    const data = galleryData[currentGalleryIndex];
    lightboxImg.src = data.src;
    lightboxTitle.textContent = data.title;
    lightboxDesc.textContent = data.desc;
  };




  const closeLightbox = () => {
    lightbox.classList.remove("active");
  };




  const navigateLightbox = (direction) => {
    currentGalleryIndex += direction;
    if (currentGalleryIndex < 0) currentGalleryIndex = galleryData.length - 1;
    if (currentGalleryIndex >= galleryData.length) currentGalleryIndex = 0;
    updateLightboxContent();
  };




  // Event delegation capture for dynamic loops + hero + extended containers
  document.addEventListener("click", (e) => {
    const targetCard = e.target.closest(".photo-card, .hero-card, .extended-card");
    if (targetCard && targetCard.hasAttribute("data-index")) {
      openLightbox(targetCard.getAttribute("data-index"));
    }
  });




  document.getElementById("close-btn").addEventListener("click", closeLightbox);
  document.getElementById("prev-btn").addEventListener("click", () => navigateLightbox(-1));
  document.getElementById("next-btn").addEventListener("click", () => navigateLightbox(1));




  // Close lightbox on clicking dark backdrop mask space
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-viewport")) {
      closeLightbox();
    }
  });




  // Keyboard accessibility matrix navigation
  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });