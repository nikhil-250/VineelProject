// ---------- BUTTERFLY ANIMATION ----------
function startButterflies() {
  // Create a container for the butterflies so they don't interfere with the form
  const container = document.createElement('div');
  container.className = 'butterfly-container';
  document.body.appendChild(container);

  const butterflyEmojis = ['🦋', '🦋', '🦋', '🧚‍♀️', '✨']; 
  const flightPaths = ['fly-diag', 'fly-diag-rev', 'fly-updown', 'fly-cross'];
 
  setInterval(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const b = document.createElement('div');
    b.className = 'butterfly';
    b.textContent = butterflyEmojis[Math.floor(Math.random() * butterflyEmojis.length)];
    
    // Pick a random flight path
    const path = flightPaths[Math.floor(Math.random() * flightPaths.length)];
    b.classList.add(path);
    
    // Randomize size, opacity, and speed
    b.style.fontSize = `${Math.random() * 15 + 18}px`; 
    b.style.opacity = Math.random() * 0.6 + 0.4;
    
    // Set a random duration (between 8s and 15s)
    const duration = Math.random() * 7 + 8;
    b.style.animationDuration = `${duration}s, 0.4s`; // First duration for flight, second for flapping

    container.appendChild(b);

    // Clean up the DOM so it doesn't lag after flying off screen
    setTimeout(() => {
      b.remove();
    }, duration * 1000);
  }, 800); // Spawns a new butterfly every 0.8 seconds
}

startButterflies();

// ---------- TIME SLOT GENERATOR ----------
const timeSelect = document.getElementById('time');
const durationRow = document.getElementById('durationRow');
const customTimeField = document.getElementById('customTimeField');
const customTimeInput = document.getElementById('customTime');

function buildTimeOptions(minutes) {
  timeSelect.innerHTML = '<option value="">-- choose a time --</option>';
  for (let m = 0; m < 24 * 60; m += minutes) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const value = `${h}:${mm}`;
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    timeSelect.appendChild(opt);
  }
  // Add the Custom Time option at the very bottom
  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = '✍️ Custom Time';
  timeSelect.appendChild(customOpt);
}

// Initial build
const defaultMin = Number(document.querySelector('input[name="duration"]:checked').value);
buildTimeOptions(defaultMin);

durationRow.addEventListener('change', (e) => {
  if (e.target.name === 'duration') buildTimeOptions(Number(e.target.value));
});

// Toggle the custom text box if she picks "Custom Time"
timeSelect.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    customTimeField.style.display = 'block';
    customTimeInput.required = true;
    customTimeInput.focus();
  } else {
    customTimeField.style.display = 'none';
    customTimeInput.required = false;
    customTimeInput.value = '';
  }
});

// ---------- DATE MIN = TODAY ----------
const dateInput = document.getElementById('date');
dateInput.min = new Date().toISOString().split('T')[0];

// ---------- YES/NO TOGGLE LOGIC ----------
const confirmRow = document.getElementById('confirmRow');
const scheduleFields = document.getElementById('scheduleFields');
const commentField = document.getElementById('commentField');

confirmRow.addEventListener('change', (e) => {
  if (e.target.name === 'joining') {
    if (e.target.value === 'Yes') {
      scheduleFields.style.display = 'block';
      commentField.style.display = 'none';
    } else {
      scheduleFields.style.display = 'none';
      commentField.style.display = 'block';
    }
  }
});

// ---------- SUBMIT FORM ----------
const form = document.getElementById('scheduleForm');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('modal');
const modalTime = document.getElementById('modalTime');
const doneBtn = document.getElementById('doneBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const isJoining = document.querySelector('input[name="joining"]:checked').value === 'Yes';

  // Validation
  if (isJoining) {
    if (!dateInput.value) {
      alert("Please pick a date! 💖");
      return;
    }
    if (!timeSelect.value) {
      alert("Please pick a time! 💖");
      return;
    }
    if (timeSelect.value === 'custom' && !customTimeInput.value.trim()) {
      alert("Please type your custom time! 💖");
      return;
    }
  } else {
    const comment = document.getElementById('comment').value;
    if (!comment.trim()) {
      alert("Please leave a short note so Jer_vin_ knows 💌");
      return;
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'sending… 🦋';

  // Format the data so Jer_vin_ gets a clean notification email
  const data = new FormData(form);
  
  // If she chose custom time, replace the "custom" value in the email with her actual text
  if (isJoining && timeSelect.value === 'custom') {
    data.set('time', `Custom: ${customTimeInput.value}`);
  }

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('submit failed');

    // Show Popup
    if (isJoining) {
      const finalTime = timeSelect.value === 'custom' ? customTimeInput.value : timeSelect.value;
      modalTime.textContent = `${dateInput.value} · ${finalTime}`;
    } else {
      modalTime.textContent = `Sent your note to Jer_vin_`;
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    form.reset();
    
    // Reset UI
    scheduleFields.style.display = 'block';
    commentField.style.display = 'none';
    customTimeField.style.display = 'none';
    buildTimeOptions(Number(document.querySelector('input[name="duration"]:checked').value));
    
  } catch (err) {
    alert('Could not send. Please try again 💗');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'send to Jer_vin_ 💌';
  }
});

// ---------- CLOSE MODAL ----------
function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
doneBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });