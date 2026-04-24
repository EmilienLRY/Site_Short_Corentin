const CALENDLY_URL = 'https://calendly.com/corentindemange02/30min';
  const EMAILJS_CONFIG = window.EMAILJS_CONFIG || { publicKey: '', serviceId: '', templateId: '' };
  const EMAILJS_READY = Boolean(EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && typeof window.emailjs !== 'undefined');
  let emailJsInitialized = false;

  // ============================================================
  // WORD REVEAL HERO TITLE
  // ============================================================
  const heroTitle = document.getElementById('hero-title');
  const heroWords = ['Comédia,', 'la', 'référence', 'n°1', 'pour', 'vos', 'contenus', 'longs', 'et', 'courts.'];
  const greenFrom = 7; // index de "longs"

  if (heroTitle) {
    heroWords.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.marginRight = '0.28em';
      if (i >= greenFrom) span.style.color = '#4d644e';
      heroTitle.appendChild(span);
      setTimeout(() => span.classList.add('show'), 100 + i * 75);
    });
  }


  // ============================================================
  // COMPTEURS ANIMÉS
  // ============================================================
  const counters = document.querySelectorAll('.counter');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const step = target / (duration / 16);
      let current = 0;
      const tick = () => {
        current = Math.min(current + step, target);
        el.innerHTML = Math.floor(current) + suffix;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  // ============================================================
  // ORBES - PARALLAX SOURIS LÉGER
  // ============================================================
  const orbs = document.querySelectorAll('.hero-orb');
  if (orbs.length) {
    let orbFrame = null;
    let orbOffsetX = 0;
    let orbOffsetY = 0;

    const applyOrbTransform = () => {
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 14;
        orb.style.transform = `translate(${orbOffsetX * factor}px, ${orbOffsetY * factor}px)`;
      });
      orbFrame = null;
    };

    document.addEventListener('mousemove', (event) => {
      orbOffsetX = event.clientX / window.innerWidth - 0.5;
      orbOffsetY = event.clientY / window.innerHeight - 0.5;

      if (orbFrame === null) {
        orbFrame = window.requestAnimationFrame(applyOrbTransform);
      }
    }, { passive: true });
  }

  // ============================================================
  // CALENDLY
  // ============================================================
  function getCalendlyWidgetUrl() {
    if (!CALENDLY_URL) return '';
    const params = [
      'hide_event_type_details=1',
      'hide_gdpr_banner=1',
      'background_color=faf9f7',
      'text_color=1a1c1b',
      'primary_color=4d644e'
    ];
    return CALENDLY_URL + (CALENDLY_URL.includes('?') ? '&' : '?') + params.join('&');
  }

  function renderCalendlyFallback(message) {
    const embed = document.getElementById('calendly-embed');
    if (!embed) return;

    embed.innerHTML = `
      <div class="min-h-[720px] flex items-center justify-center p-8 sm:p-10 text-center bg-surface-container-lowest">
        <div class="max-w-md">
          <span class="material-symbols-outlined text-primary text-5xl mb-4">calendar_month</span>
          <p class="font-headline text-2xl font-bold text-on-surface mb-3">Calendly est presque prêt.</p>
          <p class="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">${message}</p>
        </div>
      </div>
    `;
  }

  function initCalendlySection() {
    const embed = document.getElementById('calendly-embed');
    const directLink = document.getElementById('calendly-direct-link');
    const setupNote = document.getElementById('calendly-setup-note');

    if (!embed) return;

    const isConfigured =
      /^https:\/\/calendly\.com\/.+/i.test(CALENDLY_URL) &&
      !CALENDLY_URL.includes('votre-identifiant');

    if (!isConfigured) {
      if (directLink) {
        directLink.href = '#calendly';
        directLink.classList.add('opacity-50', 'pointer-events-none');
      }
      if (setupNote) setupNote.classList.remove('hidden');
      renderCalendlyFallback("Remplacez simplement l'URL Calendly dans le script pour afficher vos vrais créneaux ici.");
      return;
    }

    const widgetUrl = getCalendlyWidgetUrl();
    if (directLink) {
      directLink.href = widgetUrl;
      directLink.classList.remove('opacity-50', 'pointer-events-none');
    }
    if (setupNote) setupNote.classList.add('hidden');

    if (typeof window.Calendly === 'undefined') {
      renderCalendlyFallback("Le widget n'a pas pu se charger ici, mais vous pouvez toujours ouvrir Calendly dans un nouvel onglet.");
      return;
    }

    embed.innerHTML = '';
    window.Calendly.initInlineWidget({
      url: widgetUrl,
      parentElement: embed,
      resize: true
    });

    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 900);
  }

  // ============================================================
  // CALENDRIER DE RÉSERVATION
  // ============================================================
  const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const DAYS_FR = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const SLOTS = ['09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
  // Créneaux déjà pris (simulés) - jours: YYYY-MM-DD -> tableau d'heures bloquées
  const BOOKED = {};

  let calDate = new Date();
  calDate.setDate(1);
  let selectedDate = null;
  let selectedSlot = null;
  let currentStep = 1;

  function renderCalendar() {
    const y = calDate.getFullYear();
    const m = calDate.getMonth();
    document.getElementById('cal-month-label').textContent = MONTHS_FR[m] + ' ' + y;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    const firstDay = new Date(y, m, 1);
    // getDay() returns 0=Sunday, convert to Monday-first
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // 0=Mon now

    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) {
      const empty = document.createElement('div');
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const dow = date.getDay(); // 0=Sun, 6=Sat
      const isWeekend = dow === 0 || dow === 6;
      const isPast = date < today;
      const isoStr = date.toISOString().split('T')[0];
      const isSelected = selectedDate === isoStr;

      const btn = document.createElement('button');
      btn.textContent = d;
      btn.className = 'aspect-square rounded-lg text-sm font-body transition-all duration-150 ';

      if (isWeekend || isPast) {
        btn.className += 'text-on-surface-variant/20 cursor-not-allowed';
        btn.disabled = true;
      } else if (isSelected) {
        btn.className += 'bg-primary text-on-primary font-bold';
      } else {
        btn.className += 'hover:bg-surface-container text-on-surface cursor-pointer font-medium';
        btn.addEventListener('click', () => selectDate(isoStr, d, m, y));
      }

      grid.appendChild(btn);
    }
  }

  function selectDate(iso, d, m, y) {
    selectedDate = iso;
    selectedSlot = null;
    renderCalendar();
    const dow = new Date(y, m, d).getDay();
    const label = DAYS_FR[dow === 0 ? 6 : dow - 1] + ' ' + d + ' ' + MONTHS_FR[m] + ' ' + y;
    document.getElementById('slot-date-label').textContent = label;
    document.getElementById('slots-placeholder').classList.add('hidden');
    document.getElementById('slots-panel').classList.remove('hidden');
    renderSlots(iso);
  }

  function renderSlots(iso) {
    const grid = document.getElementById('slots-grid');
    grid.innerHTML = '';
    const booked = BOOKED[iso] || [];

    SLOTS.forEach(slot => {
      const taken = booked.includes(slot);
      const btn = document.createElement('button');
      btn.textContent = slot;
      btn.className = 'py-3 rounded-xl font-label text-sm uppercase tracking-widest font-semibold transition-all duration-150 ';

      if (taken) {
        btn.className += 'bg-surface-container-high text-on-surface-variant/30 cursor-not-allowed line-through';
        btn.disabled = true;
      } else if (selectedSlot === slot) {
        btn.className += 'bg-primary text-on-primary';
      } else {
        btn.className += 'bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary cursor-pointer';
        btn.addEventListener('click', () => selectSlot(slot, iso));
      }
      grid.appendChild(btn);
    });
  }

  function selectSlot(slot, iso) {
    selectedSlot = slot;
    renderSlots(iso);
    const dateLabel = document.getElementById('slot-date-label').textContent;
    document.getElementById('booking-summary').textContent = dateLabel + ' - ' + slot;
    goStep(2);
  }

  function prevMonth() {
    calDate.setMonth(calDate.getMonth() - 1);
    renderCalendar();
  }

  function nextMonth() {
    calDate.setMonth(calDate.getMonth() + 1);
    renderCalendar();
  }

  function goStep(n) {
    [1, 2, 3].forEach(i => {
      const el = document.getElementById('cal-step-' + i);
      if (el) el.classList.add('hidden');
      const ind = document.getElementById('step-ind-' + i);
      if (ind) ind.classList.add('opacity-40');
    });
    const target = document.getElementById('cal-step-' + n);
    if (target) target.classList.remove('hidden');
    currentStep = n;
    const ind = document.getElementById('step-ind-' + n);
    if (ind) ind.classList.remove('opacity-40');
  }

  function setBookingFeedback(message, isError) {
    const feedback = document.getElementById('booking-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove('hidden', 'text-primary', 'text-red-600');
    feedback.classList.add(isError ? 'text-red-600' : 'text-primary');
  }

  function clearBookingFeedback() {
    const feedback = document.getElementById('booking-feedback');
    if (!feedback) return;

    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-primary', 'text-red-600');
  }

  function submitBookingFallback(details) {
    const subject = encodeURIComponent('Reservation appel Comedia - ' + details.dateLabel + ' ' + details.slot);
    const body = encodeURIComponent(
      'Nouvelle reservation\n\nNom : ' + details.prenom + ' ' + details.nom +
      '\nEmail : ' + details.email +
      '\nDate : ' + details.dateLabel + ' - ' + details.slot +
      '\nProjet : ' + details.projet
    );

    setBookingFeedback("EmailJS n'est pas encore configuré, ouverture de votre messagerie.", false);
    setTimeout(() => {
      window.location.href = 'mailto:corentindemange02@gmail.com?subject=' + subject + '&body=' + body;
    }, 500);
  }

  async function sendBookingEmail(details) {
    if (!EMAILJS_READY) {
      submitBookingFallback(details);
      return;
    }

    if (!emailJsInitialized && typeof window.emailjs.init === 'function') {
      window.emailjs.init(EMAILJS_CONFIG.publicKey);
      emailJsInitialized = true;
    }

    await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        prenom: details.prenom,
        nom: details.nom,
        from_name: details.prenom + ' ' + details.nom,
        reply_to: details.email,
        email: details.email,
        projet: details.projet || 'Non renseigné',
        booking_date: details.dateLabel,
        booking_slot: details.slot,
        booking_datetime: details.dateLabel + ' - ' + details.slot
      }
    );
  }

  async function submitBooking(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('booking-submit-btn');
    const prenom = document.getElementById('f-prenom').value.trim();
    const nom = document.getElementById('f-nom').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const projet = document.getElementById('f-projet').value.trim();

    if (!selectedDate || !selectedSlot) {
      setBookingFeedback("Sélectionnez d'abord une date et un créneau.", true);
      return;
    }

    const [y, m, d] = selectedDate.split('-');
    const dateLabel = DAYS_FR[new Date(+y, +m-1, +d).getDay() === 0 ? 6 : new Date(+y, +m-1, +d).getDay() - 1] + ' ' + d + ' ' + MONTHS_FR[+m-1] + ' ' + y;
    const bookingDetails = {
      prenom,
      nom,
      email,
      projet,
      dateLabel,
      slot: selectedSlot
    };

    clearBookingFeedback();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
      await sendBookingEmail(bookingDetails);

      if (!BOOKED[selectedDate]) BOOKED[selectedDate] = [];
      if (!BOOKED[selectedDate].includes(selectedSlot)) {
        BOOKED[selectedDate].push(selectedSlot);
      }

      document.getElementById('confirm-summary').textContent = prenom + ' ' + nom + ' - ' + dateLabel + ' - ' + selectedSlot;
      goStep(3);
    } catch (error) {
      setBookingFeedback("L'envoi a échoué. Réessayez ou contactez Corentin par email.", true);
      console.error('EmailJS booking error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmer la réservation';
    }
  }

  function resetBooking() {
    selectedDate = null;
    selectedSlot = null;
    document.getElementById('booking-form').reset();
    clearBookingFeedback();
    document.getElementById('slots-placeholder').classList.remove('hidden');
    document.getElementById('slots-panel').classList.add('hidden');
    goStep(1);
    renderCalendar();
  }

  let footerEmailFeedbackTimeout;

  function showFooterEmailFeedback(message) {
    const feedback = document.getElementById('footer-email-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove('hidden');
    clearTimeout(footerEmailFeedbackTimeout);
    footerEmailFeedbackTimeout = setTimeout(() => {
      feedback.classList.add('hidden');
    }, 1800);
  }

  function copyFooterEmail() {
    const email = 'corentindemange02@gmail.com';

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email)
        .then(() => showFooterEmailFeedback('Copié !'))
        .catch(() => showFooterEmailFeedback(email));
      return;
    }

    const input = document.createElement('input');
    input.value = email;
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      showFooterEmailFeedback('Copié !');
    } catch (error) {
      showFooterEmailFeedback(email);
    }

    document.body.removeChild(input);
  }

  // Init booking blocks
  renderCalendar();
  initCalendlySection();

  // ============================================================
  // Mobile menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('shadow-[0_1px_24px_rgba(26,28,27,0.06)]');
    } else {
      navbar.classList.remove('shadow-[0_1px_24px_rgba(26,28,27,0.06)]');
    }
  }, { passive: true });

  // FAQ toggle
  function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-answer').classList.remove('open');
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.classList.add('open');
    }
  }

  // Portfolio filter
  function filterPortfolio(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('bg-primary', 'text-on-primary');
      btn.classList.add('bg-surface-variant', 'text-on-surface-variant');
    });
    const activeBtn = document.querySelector(`[data-filter="${cat}"]`);
    activeBtn.classList.add('bg-primary', 'text-on-primary');
    activeBtn.classList.remove('bg-surface-variant', 'text-on-surface-variant');

    document.querySelectorAll('.portfolio-card').forEach(card => {
      if (cat === 'tous' || card.dataset.cat === cat) {
        card.style.display = '';
        setTimeout(() => card.style.opacity = '1', 10);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 300);
      }
    });
  }

  // ============================================================
  // TIMELINE ANIMÉE
  // ============================================================
  const tlSteps = document.querySelectorAll('.tl-step');
  const tlProgress = document.getElementById('tl-progress');

  const tlObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-4');
      }
    });
  }, { threshold: 0.2 });

  tlSteps.forEach(step => tlObserver.observe(step));

  // Progress line grows as user scrolls through the timeline
  const tlSection = document.getElementById('process');
  if (tlSection && tlProgress) {
    window.addEventListener('scroll', () => {
      const rect = tlSection.getBoundingClientRect();
      const sectionH = tlSection.offsetHeight;
      // Progress grows as soon as the section starts entering the viewport
      const windowH = window.innerHeight;
      const visibleStart = windowH - rect.top;
      const total = sectionH + windowH;
      const pct = Math.min(100, Math.max(0, (visibleStart / total) * 100));
      tlProgress.style.height = pct + '%';
    }, { passive: true });
  }

  // ============================================================
  // REVIEWS CAROUSEL
  // ============================================================
  (function() {
    const track     = document.getElementById('reviews-track');
    const dotsEl    = document.getElementById('reviews-dots');
    if (!track || !dotsEl) return;

    const slides    = track.querySelectorAll('.review-slide');
    const total     = slides.length;
    let current     = 0;
    let slidesVisible = window.innerWidth >= 768 ? 3 : 1;
    let maxIndex    = total - slidesVisible;
    let autoTimer;

    function buildDots() {
      dotsEl.innerHTML = '';
      const numDots = Math.ceil(total / slidesVisible);
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full transition-all duration-300 ' + (i === 0 ? 'bg-primary w-5' : 'bg-outline-variant');
        dot.setAttribute('aria-label', 'Avis ' + (i + 1));
        const idx = i;
        dot.addEventListener('click', () => goToReview(idx * slidesVisible));
        dotsEl.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsEl.querySelectorAll('button');
      const activeDot = Math.floor(current / slidesVisible);
      dots.forEach((d, i) => {
        if (i === activeDot) {
          d.className = 'w-5 h-2 rounded-full bg-primary transition-all duration-300';
        } else {
          d.className = 'w-2 h-2 rounded-full bg-outline-variant transition-all duration-300';
        }
      });
    }

    function goToReview(idx) {
      current = Math.max(0, Math.min(idx, maxIndex));
      const pct = (current / total) * 100;
      track.style.transform = 'translateX(-' + pct + '%)';
      updateDots();
    }

    const reviewsNext = () => {
      goToReview(current >= maxIndex ? 0 : current + slidesVisible);
    };
    const reviewsPrev = () => {
      goToReview(current <= 0 ? maxIndex : current - slidesVisible);
    };

    document.querySelectorAll('[data-review-nav]').forEach(button => {
      button.addEventListener('click', () => {
        stopAuto();
        if (button.dataset.reviewNav === 'prev') {
          reviewsPrev();
        } else {
          reviewsNext();
        }
        startAuto();
      });
    });

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => reviewsNext(), 4000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    if (track.parentElement) {
      track.parentElement.addEventListener('mouseenter', stopAuto);
      track.parentElement.addEventListener('mouseleave', startAuto);
    }

    function init() {
      slidesVisible = window.innerWidth >= 768 ? 3 : 1;
      maxIndex = Math.max(0, total - slidesVisible);
      buildDots();
      goToReview(0);
      startAuto();
    }

    window.addEventListener('resize', () => { stopAuto(); init(); });
    init();
  })();

  // ============================================================
  // PRICING CHECKBOXES
  // ============================================================
  const BASE_PRICES = { starter: 1900, croissance: 3800, performance: 3000 };

  function formatPrice(n) {
    return n.toLocaleString('fr-FR').replace(/\s/g, '\u202F') + '\u202F€';
  }

  function updatePrice(pack) {
    let total = BASE_PRICES[pack];
    document.querySelectorAll('#opts-' + pack + ' input[type=checkbox]:checked').forEach(cb => {
      total += parseInt(cb.dataset.price, 10);
    });
    const el = document.getElementById('total-' + pack);
    const suffix = '<span class="font-body text-xs font-normal ' + (pack === 'croissance' ? 'text-on-primary/70' : 'text-on-surface-variant') + '">/mois</span>';
    el.innerHTML = formatPrice(total) + suffix;
  }
document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => filterPortfolio(button.dataset.filter));
  });

  document.querySelectorAll('.offer-opt').forEach(input => {
    input.addEventListener('change', () => updatePrice(input.dataset.pack));
  });

  document.querySelectorAll('[data-faq-toggle]').forEach(button => {
    button.addEventListener('click', () => toggleFaq(button));
  });

  document.querySelectorAll('[data-cal-nav]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.calNav === 'prev') {
        prevMonth();
      } else {
        nextMonth();
      }
    });
  });

  document.querySelectorAll('[data-go-step]').forEach(button => {
    button.addEventListener('click', () => goStep(Number(button.dataset.goStep)));
  });

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', submitBooking);
  }

  document.querySelectorAll('[data-reset-booking]').forEach(button => {
    button.addEventListener('click', resetBooking);
  });

  document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', copyFooterEmail);
  });
