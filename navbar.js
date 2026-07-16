document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject FontAwesome icon pack into page head dynamically
  if (!document.getElementById("fa-icons")) {
    const link = document.createElement("link");
    link.id = "fa-icons";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    document.head.appendChild(link);
  }


  // Pre-load audio assets to prevent latency delays on user interaction
  const hoverAudio = new Audio("assets/audio_1.mp3");
  const clickAudio = new Audio("assets/audio_2.mp3");


  // Helper utility function to play audio quickly without clipping overlaps
  const playSound = (audioObj) => {
    audioObj.currentTime = 0; // Rewind to start in case it's already playing
    audioObj.play().catch(err => console.log("Audio play blocked until user interacts with document:", err));
  };


  // 2. Inject CSS Styles for the floating capsule look + distinct layout drawer
  const styles = `
    .nav-container {
      position: fixed;
      top: 25px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9997;
      background: rgba(246, 239, 228, 0.75); /* Frosted Cream matching your brand */
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 8px 14px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      font-family: 'Inter', sans-serif;
      transition: opacity 0.3s ease, transform 0.3s ease, left 0.3s ease;
    }


    .nav-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(101, 148, 185, 0.15); /* Light Steel-Blue tint */
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6594B9;
      text-decoration: none;
      transition: background 0.3s ease;
    }


    .nav-icon-btn:hover {
      background: rgba(101, 148, 185, 0.25);
    }


    /* Menu Toggle Button (Visible only on mobile) */
    .mobile-menu-trigger {
      display: none;
      background: none;
      border: none;
      color: #16232E;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      align-items: center;
      justify-content: center;
    }


    .nav-links {
      display: flex;
      align-items: center;
      gap: 2px;
    }


    /* Links framework decoration styles */
    .nav-links a, .mobile-drawer-links a {
      text-decoration: none;
      color: #16232E;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      display: inline-block;
      position: relative;
      padding: 10px 16px;
      border-radius: 999px;
      transition: color .25s ease, background .25s ease;
      white-space: nowrap;
    }


    .nav-links a.active, .mobile-drawer-links a.active {
      background: #5D89AA; /* Steel Blue active marker */
      color: #ffffff !important;
    }


    .nav-links a:hover:not(.active), .mobile-drawer-links a:hover:not(.active) {
      color: #3E6684;
    }


    .nav-links a span, .mobile-drawer-links a span {
      display: inline-block;
      pointer-events: none;
      transition: transform 0.1s linear;
      will-change: transform;
    }


    /* Left Drawer Overlay Component */
    .mobile-drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease;
    }


    .mobile-drawer-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }


    /* Left Side Drawer Menu Container */
    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: #F6EFE4; /* Frosted solid brand cream */
      box-shadow: 5px 0 30px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      padding: 90px 24px 40px 24px;
      box-sizing: border-box;
      transform: translateX(-100%);
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }


    .mobile-drawer.open {
      transform: translateX(0);
    }


    .mobile-drawer-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }


    .mobile-drawer-links a {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-size: 15px;
      padding: 14px 20px;
      text-align: left;
    }


    .drawer-close-btn {
      position: absolute;
      top: 24px;
      right: 24px;
      background: none;
      border: none;
      color: #16232E;
      font-size: 22px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      z-index: 10001;
    }


    /* Responsive Mobile configuration breaking rules */
    @media (max-width: 760px) {
      .mobile-menu-trigger {
        display: flex;
      }
      .nav-links {
        display: none !important; /* Hides the desktop horizontal links */
      }
     
      /* Shifts the capsule element completely to the extreme top left corner */
      .nav-container {
        left: 20px;
        top: 20px;
        transform: none;
        gap: 12px;
        padding: 6px 12px;
      }
    }


    @media (min-width: 761px) {
      .mobile-drawer, .mobile-drawer-overlay {
        display: none !important;
      }
    }
  `;


  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);


  const currentPath = window.location.pathname.split("/").pop() || "index.html";


  // 3. Construct Isolated Markup Components
  const navMarkup = `
    <!-- Independent Left Side Drawer Menu -->
    <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
    <div class="mobile-drawer" id="mobileDrawerMenu">
      <button class="drawer-close-btn" id="drawerCloseBtn" aria-label="Close Navigation Menu">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="mobile-drawer-links">
        <a href="main.html" class="${currentPath === 'main.html' || currentPath === '' ? 'active' : ''}"><span>Home</span></a>
        <a href="about.html" class="${currentPath === 'about.html' ? 'active' : ''}"><span>About</span></a>
        <a href="projects.html" class="${currentPath === 'projects.html' ? 'active' : ''}"><span>Projects</span></a>
        <a href="media.html" class="${currentPath === 'media.html' ? 'active' : ''}"><span>Media</span></a>
        <a href="assets/akshat_resume.pdf" target="_blank" rel="noopener noreferrer"><span>Resume</span></a>
        <a href="contact.html" class="${currentPath === 'contact.html' ? 'active' : ''}"><span>Contact</span></a>
      </div>
    </div>


    <!-- Top floating navigation capsule bar -->
    <nav class="nav-container">
      <button class="mobile-menu-trigger" id="mobileMenuTrigger" aria-label="Open Navigation Menu">
        <i class="fa-solid fa-bars"></i>
      </button>


      <a href="https://mail.google.com/mail/?view=cm&fs=1&to=akshatshrinate2002@gmail.com" class="nav-icon-btn">
        <i class="fa-regular fa-comment-dots"></i>
      </a>
     
      <div class="nav-links">
        <a href="main.html" class="${currentPath === 'main.html' || currentPath === '' ? 'active' : ''}"><span>Home</span></a>
        <a href="about.html" class="${currentPath === 'about.html' ? 'active' : ''}"><span>About</span></a>
        <a href="projects.html" class="${currentPath === 'projects.html' ? 'active' : ''}"><span>Projects</span></a>
        <a href="media.html" class="${currentPath === 'media.html' ? 'active' : ''}"><span>Media</span></a>
<a href="assets/akshat_resume.pdf" target="_blank" rel="noopener noreferrer"><span>Resume</span></a>
        <a href="contact.html" class="${currentPath === 'contact.html' ? 'active' : ''}"><span>Contact</span></a>
      </div>
    </nav>
  `;


  document.body.insertAdjacentHTML("afterbegin", navMarkup);


  // Get DOM nodes for separate drawer component actions
  const mobileMenuTrigger = document.getElementById("mobileMenuTrigger");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const mobileDrawerOverlay = document.getElementById("mobileDrawerOverlay");
  const mobileDrawerMenu = document.getElementById("mobileDrawerMenu");


  // Drawer Control Methods
  const openMobileMenu = () => {
    mobileDrawerMenu.classList.add("open");
    mobileDrawerOverlay.classList.add("open");
    playSound(clickAudio);
  };


  const closeMobileMenu = () => {
    mobileDrawerMenu.classList.remove("open");
    mobileDrawerOverlay.classList.remove("open");
  };


  // Wire Interaction Listeners
  mobileMenuTrigger.addEventListener("click", openMobileMenu);
  drawerCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid parent overlay execution interference
    playSound(clickAudio);
    closeMobileMenu();
  });
  mobileDrawerOverlay.addEventListener("click", closeMobileMenu);


  // 4. Bind Audio & 360-Degree Mouse Distortion Engines
  const allNavItems = document.querySelectorAll(".nav-links a, .mobile-drawer-links a");


  allNavItems.forEach((item) => {
    const textSpan = item.querySelector("span");


    item.addEventListener("mouseenter", () => {
      playSound(hoverAudio);
    });


    item.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 760) return; // Disable calculations on mobile viewports


      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const itemCenterY = rect.top + rect.height / 2;


      const deltaX = e.clientX - itemCenterX;
      const deltaY = e.clientY - itemCenterY;


      const maxMoveDistance = 4.5;
      const moveX = (deltaX / (rect.width / 2)) * maxMoveDistance;
      const moveY = (deltaY / (rect.height / 2)) * maxMoveDistance;


      if(textSpan) {
        textSpan.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });


    item.addEventListener("mouseleave", () => {
      if(textSpan) {
        textSpan.style.transform = "translate(0px, 0px)";
      }
    });


    item.addEventListener("click", () => {
      playSound(clickAudio);
      closeMobileMenu();
    });
  });
});
