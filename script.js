/* ═══════════════════════════════════════
   ARIHANT DENTAL CARE — script.js
   ═══════════════════════════════════════ */

/* ── NAVBAR SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── MOBILE NAV ── */
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500;
  const step     = target / (duration / 16);
  let current    = 0;
  const timer    = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
      el.textContent = (target >= 1000 ? target.toLocaleString('en-IN') : target) + '+';
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.classList.contains('counted')) {
      e.target.classList.add('counted');
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter[data-target]').forEach(el => counterObserver.observe(el));

/* ── FAQ TOGGLE ── */
function toggleFaq(btn) {
  const item   = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ═══════════════════════════════════════
   PERSISTENT SLOT BOOKING
   Uses localStorage so booked slots stay
   booked even after a page refresh.
   Key: "adc__{date}__{slot}"
   ═══════════════════════════════════════ */
const LS_PREFIX = 'adc__';

function getBookedKey(date, slot) {
  return LS_PREFIX + date + '__' + slot;
}

function isSlotBooked(date, slot) {
  try {
    return localStorage.getItem(getBookedKey(date, slot)) === '1';
  } catch(e) { return false; }
}

function markSlotBooked(date, slot) {
  try {
    localStorage.setItem(getBookedKey(date, slot), '1');
  } catch(e) {}
}

/* ── TIME SLOTS ── */
const morningSlots = ['11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM'];
const eveningSlots = ['5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM'];

function renderSlots() {
  const session  = document.getElementById('sessionPref').value;
  const date     = document.getElementById('apptDate').value;
  const slots    = session === 'morning' ? morningSlots : eveningSlots;
  const grid     = document.getElementById('slotsGrid');
  const selected = document.getElementById('selectedSlot').value;
  grid.innerHTML = '';

  let allBooked = true;

  slots.forEach(slot => {
    const btn     = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'slot-btn';
    btn.textContent = slot;

    if (isSlotBooked(date, slot)) {
      // Permanently booked — grey out, disabled
      btn.classList.add('booked');
      btn.title    = 'Already booked';
      btn.disabled = true;
    } else {
      allBooked = false;
      if (slot === selected) btn.classList.add('selected');
      btn.onclick = function () {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('selectedSlot').value = slot;
      };
    }
    grid.appendChild(btn);
  });

  // If every slot in this session is taken, show a notice
  if (allBooked) {
    const notice = document.createElement('p');
    notice.style.cssText = 'grid-column:1/-1;font-size:0.8rem;color:var(--text-light);text-align:center;padding:10px 0;';
    notice.textContent   = 'All slots for this session are booked. Please try a different date or session.';
    grid.appendChild(notice);
  }
}

document.getElementById('sessionPref').addEventListener('change', () => {
  document.getElementById('selectedSlot').value = '';
  renderSlots();
});
document.getElementById('apptDate').addEventListener('change', () => {
  document.getElementById('selectedSlot').value = '';
  renderSlots();
});

// Initialise
const today = new Date().toISOString().split('T')[0];
document.getElementById('apptDate').min   = today;
document.getElementById('apptDate').value = today;
renderSlots();

/* ── APPOINTMENT SUBMIT ── */
function submitAppointment() {
  const name      = document.getElementById('patientName').value.trim();
  const phone     = document.getElementById('patientPhone').value.trim();
  const treatment = document.getElementById('treatmentType').value;
  const date      = document.getElementById('apptDate').value;
  const slot      = document.getElementById('selectedSlot').value;
  const notes     = document.getElementById('apptNotes').value.trim();

  if (!name)                                   { alert('Please enter your full name.');                         return; }
  if (!phone || !/^[6-9]\d{9}$/.test(phone))  { alert('Please enter a valid 10-digit Indian mobile number.'); return; }
  if (!treatment)                              { alert('Please select a treatment.');                           return; }
  if (!date)                                   { alert('Please select a preferred date.');                      return; }
  if (!slot)                                   { alert('Please select a time slot.');                           return; }
  if (isSlotBooked(date, slot))                { alert('This slot was just taken! Please choose another.');    return; }

  // Persist booking
  markSlotBooked(date, slot);
  document.getElementById('selectedSlot').value = '';
  renderSlots();

  const dateObj = new Date(date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const msg =
    `*New Appointment Request - Arihant Dental Care*\n\n` +
    `👤 *Patient:* ${name}\n` +
    `📞 *Phone:* ${phone}\n` +
    `🦷 *Treatment:* ${treatment}\n` +
    `📅 *Date:* ${dateStr}\n` +
    `⏰ *Slot:* ${slot}\n` +
    `📝 *Notes:* ${notes || 'None'}\n\n` +
    `_Please confirm this appointment._`;

  document.getElementById('modalBody').textContent =
    `Hi ${name}! Your appointment for ${treatment} on ${dateStr} at ${slot} has been requested. Dr. Rohan will confirm shortly on WhatsApp.`;
  document.getElementById('waConfirmBtn').href =
    `https://wa.me/917385344761?text=${encodeURIComponent(msg)}`;

  document.getElementById('confirmModal').classList.add('open');

  // Fire a browser notification for confirmation
  sendNotification(
    '✅ Appointment Booked — Arihant Dental Care',
    `${name}, your ${treatment} is on ${dateStr} at ${slot}. Dr. Rohan will confirm shortly.`,
    'appt-confirmed'
  );

  // Clear form
  document.getElementById('patientName').value   = '';
  document.getElementById('patientPhone').value  = '';
  document.getElementById('treatmentType').value = '';
  document.getElementById('apptNotes').value     = '';
}

/* ── BOOKING CONFIRMATION MODAL ── */
function closeModal() {
  document.getElementById('confirmModal').classList.remove('open');
}
document.getElementById('confirmModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeIntakeModal(); }
});

/* ═══════════════════════════════════════
   BROWSER NOTIFICATIONS
   ═══════════════════════════════════════ */

// Show the permission banner 4 s after load
// (only when browser supports it and user hasn't decided yet)
window.addEventListener('load', () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    setTimeout(() => {
      document.getElementById('notifBanner').classList.add('show');
    }, 4000);
  }
});

function requestNotifPermission() {
  if (!('Notification' in window)) {
    alert('Your browser does not support desktop notifications.');
    dismissNotifBanner();
    return;
  }
  Notification.requestPermission().then(permission => {
    dismissNotifBanner();
    if (permission === 'granted') {
      sendNotification(
        '🦷 Arihant Dental Care',
        "You're all set! We'll notify you when your appointment is confirmed.",
        'welcome'
      );
    }
  });
}

function dismissNotifBanner() {
  const banner = document.getElementById('notifBanner');
  banner.style.opacity    = '0';
  banner.style.transition = 'opacity 0.3s ease';
  setTimeout(() => banner.classList.remove('show'), 320);
}

function sendNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon : 'https://cdn-icons-png.flaticon.com/512/2925/2925058.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/2925/2925058.png',
      tag  : tag || 'arihant-dental',
    });
  } catch(e) { /* silently ignore if blocked */ }
}

/* ═══════════════════════════════════════
   PATIENT INTAKE FORM
   3-step multi-page modal
   ═══════════════════════════════════════ */
let currentIntakePage = 1;

function openIntakeModal() {
  currentIntakePage = 1;
  showIntakePage(1);
  // Reset success screen
  const success = document.getElementById('intakeSuccess');
  if (success) success.style.display = 'none';
  document.getElementById('intakeModal').classList.add('open');
}

function closeIntakeModal() {
  document.getElementById('intakeModal').classList.remove('open');
}

document.getElementById('intakeModal').addEventListener('click', function(e) {
  if (e.target === this) closeIntakeModal();
});

function showIntakePage(num) {
  [1, 2, 3].forEach(n => {
    const page = document.getElementById('intakePage' + n);
    if (page) page.style.display = (n === num) ? 'block' : 'none';
  });
  currentIntakePage = num;
  updateStepIndicator(num);
  // Scroll modal content to top
  const box = document.querySelector('.intake-modal-box');
  if (box) box.scrollTop = 0;
}

function updateStepIndicator(active) {
  [1, 2, 3].forEach(n => {
    const step = document.getElementById('istep' + n);
    if (!step) return;
    step.classList.remove('active', 'done');
    if (n < active)      step.classList.add('done');
    else if (n === active) step.classList.add('active');
  });
  // Colour connector lines
  document.querySelectorAll('.intake-step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < active);
  });
}

function intakeNext(toPage) {
  if (currentIntakePage === 1) {
    const name   = document.getElementById('iFullName').value.trim();
    const age    = document.getElementById('iAge').value.trim();
    const gender = document.getElementById('iGender').value;
    const phone  = document.getElementById('iPhone').value.trim();
    if (!name)                                  { alert('Please enter your full name.'); return; }
    if (!age)                                   { alert('Please enter your age.'); return; }
    if (!gender)                                { alert('Please select your gender.'); return; }
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) { alert('Please enter a valid 10-digit mobile number.'); return; }
  }
  // Page 2 has no required fields
  showIntakePage(toPage);
}

function intakeBack(toPage) {
  showIntakePage(toPage);
}

function selectPain(btn) {
  document.querySelectorAll('.pain-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('iPainValue').value = btn.getAttribute('data-val');
}

function submitIntakeForm() {
  const complaint = document.getElementById('iChiefComplaint').value.trim();
  if (!complaint) { alert('Please describe your main dental concern.'); return; }

  // Gather all fields
  const name      = document.getElementById('iFullName').value.trim();
  const age       = document.getElementById('iAge').value.trim();
  const gender    = document.getElementById('iGender').value;
  const phone     = document.getElementById('iPhone').value.trim();
  const address   = document.getElementById('iAddress').value.trim()          || 'Not provided';
  const emergency = document.getElementById('iEmergencyContact').value.trim() || 'Not provided';

  const conditions = [...document.querySelectorAll('.intake-checklist input:checked')]
    .map(cb => cb.value).join(', ') || 'None';
  const allergies  = document.getElementById('iAllergies').value.trim()   || 'None';
  const meds       = document.getElementById('iMedications').value.trim() || 'None';
  const surgery    = document.getElementById('iPrevSurgery').value.trim() || 'None';

  const painVal   = document.getElementById('iPainValue').value || 'Not specified';
  const lastVisit = document.getElementById('iLastVisit').value || 'Not specified';
  const anxiety   = document.getElementById('iAnxiety').value   || 'Not specified';
  const extra     = document.getElementById('iExtraInfo').value.trim() || 'None';

  const msg =
    `*Patient Intake Form – Arihant Dental Care*\n\n` +
    `👤 *Name:* ${name}\n` +
    `🎂 *Age:* ${age}  |  *Gender:* ${gender}\n` +
    `📞 *Phone:* ${phone}\n` +
    `📍 *Address:* ${address}\n` +
    `🆘 *Emergency Contact:* ${emergency}\n\n` +
    `*── Medical History ──*\n` +
    `🏥 *Conditions:* ${conditions}\n` +
    `💊 *Allergies:* ${allergies}\n` +
    `💉 *Medications:* ${meds}\n` +
    `🏨 *Past Surgeries:* ${surgery}\n\n` +
    `*── Dental Information ──*\n` +
    `🦷 *Chief Complaint:* ${complaint}\n` +
    `😣 *Pain Level:* ${painVal}/10\n` +
    `📅 *Last Dental Visit:* ${lastVisit}\n` +
    `😰 *Anxiety Level:* ${anxiety}\n` +
    `📝 *Additional Notes:* ${extra}`;

  // Hide all pages
  [1, 2, 3].forEach(n => {
    const p = document.getElementById('intakePage' + n);
    if (p) p.style.display = 'none';
  });
  updateStepIndicator(4); // marks all steps done

  // Build or reuse the success screen
  let success = document.getElementById('intakeSuccess');
  if (!success) {
    success    = document.createElement('div');
    success.id = 'intakeSuccess';
    success.className = 'intake-success';
    document.querySelector('.intake-modal-box').appendChild(success);
  }
  success.innerHTML = `
    <div class="intake-success-icon">✅</div>
    <div class="intake-success-title">Form Ready to Send!</div>
    <p class="intake-success-body">
      Your intake form is prepared, ${name}. Tap below to send it to Dr. Rohan on WhatsApp —
      he will review it before your appointment so your visit is faster and better prepared.
    </p>
    <a href="https://wa.me/917385344761?text=${encodeURIComponent(msg)}"
       target="_blank"
       class="btn btn-whatsapp"
       style="justify-content:center;width:100%;margin-bottom:12px;">
      💬 Send Intake Form on WhatsApp
    </a>
    <button onclick="closeIntakeModal()" class="btn btn-outline" style="width:100%;">Close</button>
  `;
  success.style.display = 'block';

  // Send a browser notification
  sendNotification(
    '📋 Intake Form Ready — Arihant Dental Care',
    `${name}, your patient intake form is ready. Send it to Dr. Rohan on WhatsApp!`,
    'intake-ready'
  );

  const box = document.querySelector('.intake-modal-box');
  if (box) box.scrollTop = 0;
}
