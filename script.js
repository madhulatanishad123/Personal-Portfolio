/* ==========================================================================
   PORTFOLIO INTERACTIVE CONTROLLER (VANILLA JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- CORE UI MANAGERS ---
  initThemeManager();
  initCustomCursor();
  initNavigation();
  initScrollAnimations();
  initTypingEffect();
  initAboutTabs();
  initProjectFilters();
  initContactForm();
  initProjectModal();
  initGithubStats();
});

/* ==========================================================================
   1. THEME MANAGER (DARK / LIGHT TOGGLE WITH LOCAL STORAGE)
   ========================================================================== */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Retrieve cached theme or default to system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const cachedTheme = localStorage.getItem('theme');
  
  let currentTheme = cachedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });
}

/* ==========================================================================
   2. CUSTOM CURSOR (GLOWING CURSOR FOLLOWER)
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  if (!cursor || !cursorDot) return;

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let dotX = 0;
  let dotY = 0;

  // Linear interpolation for buttery smooth trailing cursor
  const cursorSpeed = 0.15; 
  const dotSpeed = 0.35;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Easing equations
    cursorX += (mouseX - cursorX) * cursorSpeed;
    cursorY += (mouseY - cursorY) * cursorSpeed;
    
    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // Apply hover scaling effects on interactive nodes
  const clickables = document.querySelectorAll('a, button, input, textarea, .filter-btn, .tab-btn, .project-card');
  clickables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
    });
  });
}

/* ==========================================================================
   3. FLOATING NAVBAR & INTERACTIVE NAVIGATION
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('nav-menu');
  const mobileToggle = document.getElementById('mobile-toggle');
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  if (!navbar) return;

  // --- FLOATING SHRUNK HEADER ---
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    // Add background tint and shrink height on scroll
    if (scrollPos > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // --- SCROLL TO TOP TOGGLE ---
    if (scrollToTopBtn) {
      if (scrollPos > 300) {
        scrollToTopBtn.classList.add('active');
      } else {
        scrollToTopBtn.classList.remove('active');
      }
    }

    // --- NAVIGATION LINK STATE HIGHLIGHTS ---
    let activeSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        activeSectionId = section.getAttribute('id');
      }
    });

    if (activeSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === activeSectionId) {
          link.classList.add('active');
        }
      });
    }
  });

  // --- MOBILE NAV OVERLAY TOGGLE ---
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile panel on menu link activation
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // --- SCROLL TO TOP CALLBACK ---
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   4. SCROLL OBSERVER (FADE-INS & TIMELINE ILLUMINATIONS)
   ========================================================================== */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in, .fade-trigger, .timeline-item');
  if (fadeElements.length === 0) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains('timeline-item')) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.add('in-view', 'active');
        }
        
        // Trigger skill bar progress animation when Skill Section is seen
        if (entry.target.classList.contains('skills-section') || entry.target.querySelector('.progress')) {
          animateSkillProgress();
        }

        // Unobserve once triggered to lock animation in place (improves rendering performance)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(element => {
    scrollObserver.observe(element);
  });

  // Observe the skills section container specifically to trigger skills loading
  const skillsSection = document.getElementById('skills');
  if (skillsSection) scrollObserver.observe(skillsSection);
}

function animateSkillProgress() {
  const progresses = document.querySelectorAll('.progress');
  progresses.forEach(bar => {
    // Read style value and map to current width
    const targetWidth = bar.getAttribute('style');
    bar.style.width = '0%';
    setTimeout(() => {
      bar.setAttribute('style', targetWidth);
    }, 100);
  });
}

/* ==========================================================================
   5. HERO SPECIALIZATION TYPING SIMULATOR
   ========================================================================== */
function initTypingEffect() {
  const typedSpan = document.getElementById('typed-text');
  if (!typedSpan) return;

  const roles = [
    'interactive web interfaces.',
    'creative Python solutions.',
    'React Native mobile apps.',
    'responsive web templates.'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedSpan.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40; // Deletes text slightly faster
    } else {
      typedSpan.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80; // Normal typing speed
    }

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at the end of word before deletion
      typingSpeed = 1800; 
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // Small break before typing next phrase
    }

    setTimeout(type, typingSpeed);
  }

  // Start the infinite typing cycle
  setTimeout(type, 1000);
}

/* ==========================================================================
   6. ABOUT TAB SWITCHER
   ========================================================================== */
function initAboutTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(targetPanelId);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. PROJECT FILTER SYSTEM WITH GRID TRANSITIONS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage Active state classes
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        // CSS Transition: Scale and Fade out cards, then hide
        if (filterVal === 'all' || cardCategory === filterVal) {
          card.classList.remove('hide');
          // Subtle timeout to let layout calculations resolve before scaling back up
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          // Add hide display once fade finishes
          setTimeout(() => {
            card.classList.add('hide');
          }, 350);
        }
      });
    });
  });
}

/* ==========================================================================
   8. GLASSMORPHIC CONTACT FORM CONTROLLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('btn-submit');
  if (!form || !submitBtn) return;

  const btnText = submitBtn.querySelector('span');
  const btnIcon = submitBtn.querySelector('svg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Verify fields
    if (!form.checkValidity()) return;

    // Trigger visual Loading State
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Encrypting Transmission...';
    if (btnIcon && typeof lucide !== 'undefined') {
      submitBtn.innerHTML = `<span>Encrypting...</span> <i data-lucide="loader-2" class="animate-spin"></i>`;
      lucide.createIcons();
    }

    // Simulate secure network transaction delay (1.8s)
    setTimeout(() => {
      // Transition to Success State
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('success');
      submitBtn.innerHTML = `<span>Transmission Sent Successfully!</span> <i data-lucide="check-circle-2"></i>`;
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Reset form variables
      form.reset();

      // Reset floating inputs manual cleanups
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.dispatchEvent(new Event('blur'));
      });

      // Restore submit button to normal state after timeout (4s)
      setTimeout(() => {
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Send Message</span> <i data-lucide="send" class="btn-submit-icon"></i>`;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 4000);

    }, 1800);
  });
}

/* ==========================================================================
   9. PREMIUM PROJECT DETAIL MODAL CONTROLLER
   ========================================================================== */
function initProjectModal() {
  console.log("initProjectModal initializing. Modal element:", !!document.getElementById('project-modal'), "Close button:", !!document.getElementById('modal-close'), "Cards count:", document.querySelectorAll('.project-card').length);
  const modal = document.getElementById('project-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const projectCards = document.querySelectorAll('.project-card');

  if (!modal || !modalClose || projectCards.length === 0) {
    console.warn("initProjectModal returning early. Missing elements!");
    return;
  }

  // Rich project data detailing architectures and features
  const projectDetailsData = {
    'expence-tracker': {
      title: 'Expence-Tracker-React-Native',
      badge: 'Mobile Systems',
      year: '2026',
      img: 'assets/project1.png',
      desc: 'An offline-first, highly intuitive mobile expense tracker built in React Native and TypeScript. It leverages custom AsyncStorage data mappings, handles real-time category spending balances, and standardizes local transaction cached states to enable 60fps rendering and seamless usage without network access.',
      features: [
        'Built a custom dashboard layout showing dynamic monthly stats and transactions.',
        'Configured TypeScript state containers caching ledger history safely locally.',
        'Optimized component rendering life-cycles to guarantee buttery-smooth scroll physics.',
        'Integrated modular HSL custom icons and category filter parameters.'
      ],
      tech: ['React Native', 'TypeScript', 'Expo SDK', 'AsyncStorage', 'Flexbox'],
      demo: 'https://github.com/madhulatanishad123/Expence-Tracker-React-Native',
      github: 'https://github.com/madhulatanishad123/Expence-Tracker-React-Native'
    },
    'sos-emergency': {
      title: 'SOS-Emergency-React-Native',
      badge: 'Mobile Safety',
      year: '2026',
      img: 'assets/project2.png',
      desc: 'A robust, rapid-response emergency distress signaling application engineered to capture background camera diagnostics and dispatch live GPS telemetry coordinates alongside audio triggers during critical situations to priority phone lines.',
      features: [
        'Programmed background GPS tracking modules using standard Geolocation protocols.',
        'Engineered an isolated camera active state-cache preventing preview freezing.',
        'Connected real-time SMS gateways to dispatch precise location maps instantly.',
        'Implemented custom panic button micro-animations and status tracers.'
      ],
      tech: ['React Native', 'JavaScript', 'Geolocation API', 'Expo Audio', 'SMS Triggers'],
      demo: 'https://github.com/madhulatanishad123/SOS-Emergency-React-Native',
      github: 'https://github.com/madhulatanishad123/SOS-Emergency-React-Native'
    },
    'college-chatbot': {
      title: 'college-enquiry-chatbot',
      badge: 'AI & ML Chatbot',
      year: '2026',
      img: 'assets/project3.png',
      desc: 'An intelligent query-resolving college chatbot interface built to automate educational admissions inquiries and curriculum query responses, offering instant answer matching for prospective college visitors.',
      features: [
        'Programmed a lightweight natural language matching pipeline in Python.',
        'Designed a custom glassmorphic conversational chat bubble container UI.',
        'Optimized text parsing layers to handle multi-phrase admissions queries.',
        'Created a fast Flask API connector serving query-result pairs instantly.'
      ],
      tech: ['Python', 'Flask', 'Web Technologies', 'CSS Grid', 'Conversational AI'],
      demo: 'https://github.com/madhulatanishad123/college-enquiry-chatbot',
      github: 'https://github.com/madhulatanishad123/college-enquiry-chatbot'
    },
    'ngo-website': {
      title: 'NGO-Website',
      badge: 'Web Architecture',
      year: '2026',
      img: 'assets/project4.png',
      desc: 'A beautiful, fully responsive outreach portal designed to highlight community impact campaigns, coordinate global volunteer activities, and facilitate secure donation processing pipelines.',
      features: [
        'Crafted a pristine responsive layout scaling flawlessly from mobiles to high-res displays.',
        'Engineered dynamic SVG impact tracking timelines with smooth scroll triggers.',
        'Designed frosted glass campaign cards utilizing modern CSS styling parameters.',
        'Implemented validation safeguards for client volunteer registration form fields.'
      ],
      tech: ['HTML5', 'CSS3', 'Vanilla JS', 'Responsive Layouts', 'Glassmorphism'],
      demo: 'https://github.com/madhulatanishad123/NGO-Website',
      github: 'https://github.com/madhulatanishad123/NGO-Website'
    },
    'data-analytics': {
      title: 'data-analytics',
      badge: 'Data Science',
      year: '2026',
      img: 'assets/project5.png',
      desc: 'A modular, python-based telemetry statistical processor designed to ingest multi-variable CSV datasets, compute averages/medians, run trend models, and export clean chart visualizers.',
      features: [
        'Programmed statistical ingestion workflows using Python analytics packages.',
        'Generated interactive scatter and bar graphs mapping coordinate telemetry vectors.',
        'Optimized data cleaning scripts to identify anomalies and missing markers instantly.',
        'Built automated export pipelines saving processed results as high-res images.'
      ],
      tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Data Pipelines'],
      demo: 'https://github.com/madhulatanishad123/data-analytics',
      github: 'https://github.com/madhulatanishad123/data-analytics'
    },
    'doctor-app': {
      title: 'Doctor-App-React-Native',
      badge: 'Mobile Systems',
      year: '2026',
      img: 'assets/project6.png',
      desc: 'A premium full-stack telemedicine mobile platform built with React Native and Expo SDK 54, backed by Supabase for real-time auth and database. The app features a Doctor & Patient dual-role system with appointment booking, live prescription management via voice dictation, push-notification medication reminders, health metric goal tracking, and multi-member family profile management.',
      features: [
        'Dual-role architecture: separate Doctor Dashboard and Patient Dashboard with role-based navigation.',
        'Appointment booking, real-time status updates (accept/reject), and secure server-side deletion with ownership checks.',
        'Voice-dictated prescription input using expo-speech module, with structured prescription records synced to Supabase.',
        'Push-notification medication reminders via expo-notifications scheduled per-user at user-defined times.',
        'Health goal tracking with interactive line-charts (react-native-chart-kit) for steps, water intake, and vitals.',
        'Family Profiles system allowing a single account to manage multiple family members securely.',
        'Cloudinary-powered image uploads for doctor profile photos and document attachments.'
      ],
      tech: ['React Native', 'Expo SDK 54', 'Supabase', 'Node.js / Express', 'Cloudinary', 'React Navigation'],
      demo: 'https://github.com/madhulatanishad123/Doctor-App-React-Native',
      github: 'https://github.com/madhulatanishad123/Doctor-App-React-Native'
    }
  };

  // Click handler to open modal and populate elements dynamically
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      console.log("Project card clicked! Target element:", e.target, "ID attribute:", card.getAttribute('data-project-id'));
      // Prevent opening modal if direct overlay links (github/demo) are clicked
      if (e.target.closest('.stop-propagation')) {
        console.log("Click ignored due to stop-propagation element.");
        return;
      }

      const projectId = card.getAttribute('data-project-id');
      const data = projectDetailsData[projectId];
      if (!data) return;

      // Populate elements
      document.getElementById('modal-project-badge').textContent = data.badge;
      document.getElementById('modal-project-year').textContent = data.year;
      document.getElementById('modal-project-title').textContent = data.title;
      document.getElementById('modal-project-img').setAttribute('src', data.img);
      document.getElementById('modal-project-img').setAttribute('alt', data.title);
      document.getElementById('modal-project-desc').textContent = data.desc;

      // Map features list
      const featuresList = document.getElementById('modal-project-features');
      featuresList.innerHTML = '';
      data.features.forEach(feat => {
        const li = document.createElement('li');
        li.textContent = feat;
        featuresList.appendChild(li);
      });

      // Map tech tags
      const techTags = document.getElementById('modal-project-tech');
      techTags.innerHTML = '';
      data.tech.forEach(t => {
        const span = document.createElement('span');
        span.textContent = t;
        techTags.appendChild(span);
      });

      // Map action links
      document.getElementById('modal-link-live').setAttribute('href', data.demo);
      document.getElementById('modal-link-code').setAttribute('href', data.github);

      // Open Modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
      
      // Update icons if necessary
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  });

  // Modal Closing Triggers
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Close with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   10. GITHUB STATS WIDGET (LIVE GITHUB REST API)
   ========================================================================== */
async function initGithubStats() {
  const USERNAME = 'madhulatanishad123';
  const BASE = 'https://api.github.com';

  // Language color palette
  const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', 'C++': '#f34b7d', C: '#555555',
    Java: '#b07219', Kotlin: '#A97BFF', Dart: '#00B4AB',
    Ruby: '#701516', Shell: '#89e051', Go: '#00ADD8',
    Rust: '#dea584', Swift: '#ffac45', default: '#a855f7'
  };

  function getLangColor(lang) {
    return LANG_COLORS[lang] || LANG_COLORS.default;
  }

  // Animated counter
  function animateCount(el, target) {
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 30);
  }

  try {
    // --- Fetch user profile ---
    const userRes = await fetch(`${BASE}/users/${USERNAME}`);
    if (!userRes.ok) throw new Error('User not found');
    const user = await userRes.json();

    // Populate profile card
    const avatar = document.getElementById('gh-avatar');
    const name   = document.getElementById('gh-name');
    const bio    = document.getElementById('gh-bio');
    if (avatar) { avatar.src = user.avatar_url; avatar.alt = user.name || USERNAME; }
    if (name)   name.textContent = user.name || user.login;
    if (bio)    bio.textContent  = user.bio  || 'BCA Student & Full-Stack Developer';

    // --- Fetch all repos ---
    const reposRes = await fetch(`${BASE}/users/${USERNAME}/repos?per_page=100&sort=updated`);
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Compute totals
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

    // Animate counters
    const elRepos     = document.getElementById('gh-repos');
    const elStars     = document.getElementById('gh-stars');
    const elFollowers = document.getElementById('gh-followers');
    const elForks     = document.getElementById('gh-forks');
    if (elRepos)     animateCount(elRepos,     user.public_repos);
    if (elStars)     animateCount(elStars,     totalStars);
    if (elFollowers) animateCount(elFollowers, user.followers);
    if (elForks)     animateCount(elForks,     totalForks);

    // --- Recent repos list (top 4 by updated) ---
    const reposList = document.getElementById('gh-repos-list');
    if (reposList && repos.length > 0) {
      const top = repos.slice(0, 4);
      reposList.innerHTML = top.map(r => `
        <a class="gh-repo-item" href="${r.html_url}" target="_blank" rel="noopener">
          <div class="gh-repo-top">
            <span class="gh-repo-name">
              <i data-lucide="folder-git-2"></i>
              ${r.name}
            </span>
            <span class="gh-repo-stars">
              <i data-lucide="star"></i>
              ${r.stargazers_count}
            </span>
          </div>
          <p class="gh-repo-desc">${r.description || 'No description provided.'}</p>
          <div class="gh-repo-meta">
            ${r.language ? `<span class="gh-repo-lang" style="--lang-color:${getLangColor(r.language)}">${r.language}</span>` : ''}
            <span class="gh-repo-updated">Updated ${new Date(r.updated_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
        </a>
      `).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- Top Languages from repos ---
    const langMap = {};
    repos.forEach(r => {
      if (r.language) {
        langMap[r.language] = (langMap[r.language] || 0) + 1;
      }
    });
    const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const total  = sorted.reduce((s, [, c]) => s + c, 0);

    const langsGrid = document.getElementById('gh-langs-grid');
    if (langsGrid && sorted.length > 0) {
      langsGrid.innerHTML = sorted.map(([lang, count]) => {
        const pct = Math.round((count / total) * 100);
        const color = getLangColor(lang);
        return `
          <div class="gh-lang-row">
            <div class="gh-lang-label">
              <span class="gh-lang-dot" style="background:${color}"></span>
              <span class="gh-lang-name">${lang}</span>
              <span class="gh-lang-pct">${pct}%</span>
            </div>
            <div class="gh-lang-bar-track">
              <div class="gh-lang-bar-fill" style="width:0%; background:${color}" data-width="${pct}"></div>
            </div>
          </div>
        `;
      }).join('');

      // Animate bars after render
      requestAnimationFrame(() => {
        document.querySelectorAll('.gh-lang-bar-fill').forEach(bar => {
          setTimeout(() => {
            bar.style.width = bar.getAttribute('data-width') + '%';
          }, 100);
        });
      });
    } else if (langsGrid) {
      langsGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem">No public repositories with language data found.</p>';
    }

  } catch (err) {
    console.warn('GitHub API error:', err.message);
    // Graceful fallback UI
    const statsCard = document.getElementById('gh-stats-card');
    if (statsCard) {
      statsCard.innerHTML += '<p style="color:var(--text-muted);font-size:0.85rem;margin-top:12px;">Could not load GitHub data. Make sure the username is public.</p>';
    }
  }
}
