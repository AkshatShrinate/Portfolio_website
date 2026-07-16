(function () {
    console.log('Power Off UI Script Loaded');

    // --- Configuration ---
    const ANIMATION_CONFIG = {
        // Timings are in percentages (0-100)
        // To restore "stay bright" delay: set wipeStart to 20, wipeEnd to 40
        // Current "fast" settings: wipeStart: 0, wipeEnd: 30
        wipeStart: 0,
        wipeEnd: 30,

        // Brightness levels
        initialBrightness: 1,
        midBrightness: 8,
        peakBrightness: 12,
        finalBrightness: 20
    };

    // Helper to generate keyframes based on config
    const kf = ANIMATION_CONFIG;

    // 1. Inject CSS for both the Animation and the Button
    const style = document.createElement('style');
    style.textContent = `
        /* Ensure body takes full height for proper centering */
        html, body {
            height: 100%;
            margin: 0;
            overflow: hidden;
        }
        
        /* Force black background on html during shutdown */
        html.powering-off {
            background-color: black !important;
        }

        /* --- Power Off Animation --- */
        .turn-off {
            transform-origin: 50% 50%;
            animation: crt-shutdown 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards !important;
            pointer-events: none; /* Prevent clicks during animation */
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
        }

        @keyframes crt-shutdown {
            0% {
                transform: scale(1, 1);
                filter: brightness(${kf.initialBrightness}) sepia(0);
            }
            ${kf.wipeStart}% {
                transform: scale(1, 1);
                filter: brightness(${kf.midBrightness * 0.3}) sepia(0);
            }
            ${kf.wipeEnd}% {
                transform: scale(1, 0.005);
                filter: brightness(${kf.midBrightness}) sepia(0);
            }
            ${kf.wipeEnd + 10}% {
                transform: scale(0.01, 0.005);
                filter: brightness(${kf.peakBrightness}) sepia(0);
                opacity: 1;
            }
            ${kf.wipeEnd + 30}% {
                transform: scale(0, 0);
                filter: brightness(${kf.finalBrightness});
                opacity: 0;
            }
            100% {
                transform: scale(0, 0);
                opacity: 0;
            }
        }

        /* --- Power Button UI --- */
        .os-power-btn {
        
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 32px;
            height: 32px;
            background: rgba(200, 40, 40, 0.2); /* Low opacity red initially */
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            color: rgba(255, 255, 255, 0.7);
            z-index: 200000; /* Above windows/boot, below cursor */
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
            padding: 0;
            outline: none;
        }

        .os-power-btn:hover {
            background: rgba(220, 20, 60, 0.9);
            border-color: rgba(255, 255, 255, 0.9);
            color: white;
            box-shadow: 0 0 15px rgba(220, 20, 60, 0.6);
            transform: translateX(-50%) scale(1.1);
        }

        .os-power-btn:active {
            transform: translateX(-50%) scale(0.95);
            background: rgba(180, 10, 40, 1);
        }

        .os-power-btn svg {
            width: 16px;
            height: 16px;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    `;
    document.head.appendChild(style);

    // 2. Core Logic Function
    function triggerPowerOff() {
        console.log('Triggering Power Off Sequence...');

        // Add class to body to trigger animation
        document.body.classList.add('turn-off');
        document.documentElement.classList.add('powering-off');

        // Reload after animation
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    // 3. Create and Inject the Button
    const btn = document.createElement('button');
    btn.className = 'os-power-btn';
    btn.title = "Power Off System";
    btn.ariaLabel = "Power Off System";
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 1v10" />
            <path d="M5.6 5.6a9 9 0 1 0 12.8 0" />
        </svg>
    `;
    document.body.appendChild(btn);

    // 4. Attach Event Listeners

    // Click on Button
    btn.addEventListener('click', function () {
        console.log('Power Off Button Clicked');
        triggerPowerOff();
    });

    // Message Listener (Access from IFrame or Parent)
    window.addEventListener('message', function (event) {
        if (event.data === 'powerOff' || (event.data && event.data.type === 'powerOff')) {
            console.log('Power Off Message Received');
            triggerPowerOff();
        }
    });

})();
