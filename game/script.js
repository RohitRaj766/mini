// Game state management for The Debugging Detective

/** @typedef {{
 *  id: string,
 *  title: string,
 *  description: string,
 *  codeBuggy: string,
 *  codeFixed: string,
 *  clues: string[],
 *  witnesses: string[],
 *  timeline: string[],
 *  culprit: string
 * }} CaseFile
 */

/**
 * Case list loaded at runtime
 * @type {CaseFile[]}
 */
let CASES = [];

const els = {
  startBtn: document.getElementById('startBtn'),
  caseSelect: document.getElementById('caseSelect'),
  caseTitle: document.getElementById('caseTitle'),
  caseDesc: document.getElementById('caseDesc'),
  codeLabel: document.getElementById('codeLabel'),
  codeBlock: document.getElementById('codeBlock'),
  clueBox: document.getElementById('clueBox'),
  feedbackBox: document.getElementById('feedbackBox'),
  nextClueBtn: document.getElementById('nextClueBtn'),
  witnessBtn: document.getElementById('witnessBtn'),
  timelineBtn: document.getElementById('timelineBtn'),
  culpritBtn: document.getElementById('culpritBtn'),
  fixBtn: document.getElementById('fixBtn'),
  resetBtn: document.getElementById('resetBtn'),
  statusList: document.getElementById('statusList'),
  scoreVal: document.getElementById('scoreVal'),
  sfxClue: document.getElementById('sfxClue'),
  sfxSuccess: document.getElementById('sfxSuccess'),
  sfxClick: document.getElementById('sfxClick'),
  sfxClickAlt: document.getElementById('sfxClickAlt'),
  bgm: document.getElementById('bgm'),
  answerInput: document.getElementById('answerInput'),
  submitAnswerBtn: document.getElementById('submitAnswerBtn'),
  skipInvestigationBtn: document.getElementById('skipInvestigationBtn'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  howToBtn: document.getElementById('howToBtn'),
  howToOverlay: document.getElementById('howToOverlay'),
  howToModal: document.getElementById('howToModal'),
  howToClose: document.getElementById('howToClose')
};

/** Global UI state */
const state = {
  activeCase: null,
  started: false,
  clueIndex: 0,
  witnessesShown: false,
  timelineShown: false,
  culpritShown: false,
  fixed: false,
  score: 0,
  soundOn: true,
  musicOn: true,
  stepUnlocked: { clues: false, witnesses: false, timeline: false, culprit: false, fix: false },
  answeredCorrectly: false,
  spoilersOn: true,
  firstAnswerSubmitted: false
};

function setButtonsEnabled(enabled) {
  const allow = enabled && state.started;
  els.nextClueBtn.disabled = !(allow && state.stepUnlocked.clues);
  els.witnessBtn.disabled = !(allow && state.stepUnlocked.witnesses);
  els.timelineBtn.disabled = !(allow && state.stepUnlocked.timeline);
  els.culpritBtn.disabled = !(allow && state.stepUnlocked.culprit);
  els.fixBtn.disabled = !(allow && state.stepUnlocked.fix);
  els.resetBtn.disabled = !enabled;
  if (els.skipInvestigationBtn) {
    els.skipInvestigationBtn.disabled = !(state.started && state.firstAnswerSubmitted);
  }
}

function populateCaseSelect() {
  if (!CASES.length) {
    els.caseSelect.innerHTML = `<option>No cases loaded</option>`;
    return;
  }
  const current = els.caseSelect.value;
  els.caseSelect.innerHTML = CASES
    .map((c, i) => {
      const label = state.spoilersOn ? `Case #${i + 1}` : c.title;
      return `<option stu  value="${c.id}">${label}</option>`;
    })
    .join('');
  // restore selection if possible
  if (current) {
    els.caseSelect.value = current;
  }
}

function renderStatus() {
  const steps = [
    { key: 'clues', label: `Clues found: ${state.clueIndex}/${state.activeCase.clues.length}`, done: state.clueIndex >= state.activeCase.clues.length },
    { key: 'witnesses', label: 'Witnesses interviewed', done: state.witnessesShown },
    { key: 'timeline', label: 'Timeline reconstructed', done: state.timelineShown },
    { key: 'culprit', label: 'Culprit identified', done: state.culpritShown },
    { key: 'fix', label: 'Fix applied', done: state.fixed }
  ];
  els.statusList.innerHTML = steps
    .map(s => `<li class="${s.done ? 'active' : ''}">${s.done ? '✔ ' : '○ '}${s.label}</li>`) 
    .join('');
}

let clueTypeTimer = null;
function setClue(text) {
  const content = text; // Spoiler Shield does not affect clue box
  // cancel previous typing
  if (clueTypeTimer) {
    clearTimeout(clueTypeTimer);
    clueTypeTimer = null;
  }
  typeInto(els.clueBox, content, 18);
  els.clueBox.classList.remove('pop');
  // trigger reflow for animation
  void els.clueBox.offsetWidth;
  els.clueBox.classList.add('pop');
  playClue();
}

function typeInto(el, text, speedMs) {
  if (!el) return;
  // If text contains markup (like span), type using innerHTML safely
  const isHtml = /<[^>]+>/.test(text);
  if (isHtml) {
    el.innerHTML = '';
  } else {
    el.textContent = '';
  }
  el.classList.add('caret');
  let i = 0;
  const write = () => {
    if (i <= text.length) {
      if (isHtml) {
        el.innerHTML = text.slice(0, i);
      } else {
        el.textContent = text.slice(0, i);
      }
      i++;
      clueTypeTimer = setTimeout(write, speedMs);
    } else {
      el.classList.remove('caret');
      clueTypeTimer = null;
    }
  };
  write();
}

// Feedback typing
let feedbackTypeTimer = null;
function setFeedback(text) {
  if (!els.feedbackBox) return;
  if (feedbackTypeTimer) {
    clearTimeout(feedbackTypeTimer);
    feedbackTypeTimer = null;
  }
  const el = els.feedbackBox;
  el.textContent = '';
  el.classList.add('caret');
  let i = 0;
  const msg = String(text || '');
  const speed = 22;
  const write = () => {
    if (i <= msg.length) {
      el.textContent = msg.slice(0, i);
      i++;
      feedbackTypeTimer = setTimeout(write, speed);
    } else {
      el.classList.remove('caret');
      feedbackTypeTimer = null;
    }
  };
  write();
}

function startCase() {
  const selectedId = els.caseSelect.value || CASES[0].id;
  const found = CASES.find(c => c.id === selectedId) || CASES[0];
  state.activeCase = found;
  state.started = true;
  state.clueIndex = 0;
  state.witnessesShown = false;
  state.timelineShown = false;
  state.culpritShown = false;
  state.fixed = false;
  state.answeredCorrectly = false;
  state.firstAnswerSubmitted = false;
  state.stepUnlocked = { clues: false, witnesses: false, timeline: false, culprit: false, fix: false };

  els.caseTitle.textContent = found.title;
  els.caseDesc.textContent = found.description;
  els.codeLabel.textContent = 'Crime Scene';
  els.codeBlock.textContent = found.codeBuggy;
  setClue('<span class="prompt-highlight">Enter your answer above to begin the investigation.</span>');
  if (els.feedbackBox) els.feedbackBox.textContent = '';
  if (els.answerInput) els.answerInput.value = '';
  if (els.submitAnswerBtn) els.submitAnswerBtn.disabled = false;
  if (els.skipInvestigationBtn) els.skipInvestigationBtn.disabled = true;
  setButtonsEnabled(true);
  renderStatus();
  renderSpoilers();
  ensureMusic();
  renderEvidence();
}

function onNextClue() {
  if (!state.activeCase) return;
  const clues = state.activeCase.clues;
  if (state.clueIndex < clues.length) {
    setClue(clues[state.clueIndex]);
    state.clueIndex++;
    addScore(10);
    if (state.clueIndex >= Math.ceil(clues.length / 2)) {
      state.stepUnlocked.witnesses = true;
    }
  } else {
    setClue('No more clues. Try interviewing witnesses or reconstructing the timeline.');
    state.stepUnlocked.witnesses = true;
  }
  renderStatus();
  setButtonsEnabled(true);
  renderSpoilers();
  renderEvidence();
}

function onWitnesses() {
  if (!state.activeCase) return;
  const lines = state.activeCase.witnesses.map(s => `• ${s}`).join('\n');
  setClue(lines);
  state.witnessesShown = true;
  addScore(15);
  state.stepUnlocked.timeline = true;
  renderStatus();
  setButtonsEnabled(true);
  renderSpoilers();
  renderEvidence();
}

function onTimeline() {
  if (!state.activeCase) return;
  const lines = state.activeCase.timeline.map(s => `→ ${s}`).join('\n');
  setClue(lines);
  state.timelineShown = true;
  addScore(15);
  state.stepUnlocked.culprit = true;
  renderStatus();
  setButtonsEnabled(true);
  renderSpoilers();
  renderEvidence();
}

function onCulprit() {
  if (!state.activeCase) return;
  // Always reveal the real culprit during investigation, regardless of Spoiler Shield
  setClue(`Culprit: ${state.activeCase.culprit}`);
  state.culpritShown = true;
  addScore(20);
  state.stepUnlocked.fix = true;
  renderStatus();
  setButtonsEnabled(true);
  renderSpoilers();
  renderEvidence();
}

function onFix() {
  if (!state.activeCase) return;
  els.codeLabel.textContent = 'Case Closed: Fixed Code';
  els.codeBlock.textContent = state.activeCase.codeFixed;
  state.fixed = true;
  addScore(40);
  playSuccess();
  renderStatus();
  renderSpoilers(false);
  renderEvidence();
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text).split(' ').filter(t => t.length > 1);
}

function isAnswerMatch(userInput, options) {
  const userNorm = normalize(userInput);
  const userTokens = new Set(tokenize(userInput));
  if (!userNorm) return false;
  for (const opt of options) {
    const optNorm = normalize(opt);
    if (!optNorm) continue;
    if (userNorm === optNorm) return true;
    // token overlap threshold (>= 70% of option tokens, at least 1)
    const optTokens = tokenize(optNorm);
    if (optTokens.length === 0) continue;
    const matches = optTokens.filter(t => userTokens.has(t)).length;
    const needed = Math.max(1, Math.ceil(optTokens.length * 0.7));
    if (matches >= needed) return true;
  }
  return false;
}

function checkAnswer() {
  if (!state.activeCase) return;
  const raw = els.answerInput && els.answerInput.value;
  const answer = normalize(raw);
  const options = (state.activeCase.answers || []);
  if (answer.length < 2) {
    setFeedback('Please enter a bit more detail for your guess.');
    return;
  }
  const matched = isAnswerMatch(answer, options);
  if (matched) {
    setFeedback('Correct! You identified the culprit.');
    addScore(50);
    state.answeredCorrectly = true;
    state.firstAnswerSubmitted = true;
    // Do not unlock investigation yet; require explicit Skip action
    setButtonsEnabled(true);
  } else {
    setFeedback('Not quite. Try the investigation or refine your guess.');
    state.firstAnswerSubmitted = true;
    setButtonsEnabled(true);
  }
}

function skipToInvestigation() {
  if (!state.firstAnswerSubmitted) {
    setFeedback('Please submit an answer first.');
    return;
  }
  if (state.answeredCorrectly) {
    state.stepUnlocked = { clues: true, witnesses: true, timeline: true, culprit: true, fix: true };
  } else {
    state.stepUnlocked.clues = true;
  }
  setButtonsEnabled(true);
  setFeedback('Investigation unlocked. Start with clues.');
  // Add unlock animation to controls buttons that are now enabled
  [els.nextClueBtn, els.witnessBtn, els.timelineBtn, els.culpritBtn, els.fixBtn].forEach(btn => {
    if (!btn) return;
    if (!btn.disabled) {
      btn.classList.remove('unlock-anim');
      void btn.offsetWidth; // reflow to restart animation
      btn.classList.add('unlock-anim');
    }
  });
}

function onReset() {
  startCase();
}

function attachEvents() {
  els.startBtn.addEventListener('click', withAltClick(startCase));
  els.nextClueBtn.addEventListener('click', withClick(onNextClue));
  els.witnessBtn.addEventListener('click', withClick(onWitnesses));
  els.timelineBtn.addEventListener('click', withClick(onTimeline));
  els.culpritBtn.addEventListener('click', withClick(onCulprit));
  els.fixBtn.addEventListener('click', withClick(onFix));
  els.resetBtn.addEventListener('click', onReset);
  // Enhance non-investigation buttons
  els.resetBtn.addEventListener('click', playAltClick);
  const stEl = document.getElementById('soundToggle');
  if (stEl) {
    state.soundOn = !!stEl.checked;
    stEl.addEventListener('change', () => { state.soundOn = !!stEl.checked; });
  }
  const mt = document.getElementById('musicToggle');
  if (mt) {
    state.musicOn = !!mt.checked;
    mt.addEventListener('change', () => { state.musicOn = !!mt.checked; ensureMusic(); });
  }
  // How to Play modal events
  if (els.howToBtn) els.howToBtn.addEventListener('click', withAltClick(openHowTo));
  if (els.howToOverlay) els.howToOverlay.addEventListener('click', withAltClick(closeHowTo));
  if (els.howToClose) els.howToClose.addEventListener('click', withAltClick(closeHowTo));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHowTo(); });
  // Enable/disable submit depending on case selection
  if (els.caseSelect) {
    els.caseSelect.addEventListener('change', () => {
      const selectedId = els.caseSelect.value;
      const valid = !!(CASES || []).find(c => c.id === selectedId);
      // Do not allow investigation until Start Case clicked
      if (els.submitAnswerBtn) els.submitAnswerBtn.disabled = true;
      if (els.skipInvestigationBtn) els.skipInvestigationBtn.disabled = true;
      state.started = false;
      state.activeCase = valid ? null : null;
      setFeedback(valid ? 'Click Start Case to begin.' : 'Select a case.');
    });
  }
  // (remove duplicate sound toggle binding)
  if (els.submitAnswerBtn) els.submitAnswerBtn.addEventListener('click', withAltClick(() => {
    if (!state.activeCase) {
      setFeedback('Select a case first.');
      return;
    }
    checkAnswer();
  }));
  if (els.answerInput) els.answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });
  if (els.skipInvestigationBtn) els.skipInvestigationBtn.addEventListener('click', withAltClick(skipToInvestigation));
  if (els.spoilerToggle) els.spoilerToggle.addEventListener('change', () => {
    state.spoilersOn = !!els.spoilerToggle.checked;
    populateCaseSelect();
    renderSpoilers();
    // Re-apply masked clue content if needed
    if (els.clueBox && els.clueBox.textContent) {
      const current = els.clueBox.textContent;
      setClue(current);
    }
  });
}

async function loadCases() {
  try {
    const res = await fetch('cases.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load cases');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid cases format');
    CASES = data;
  } catch (err) {
    console.warn('Could not fetch cases.json. Using built-in fallback.', err);
    CASES = [];
  }
}

function addScore(points) {
  state.score += points;
  els.scoreVal.textContent = String(state.score);
}

function playClue() {
  if (!state.soundOn) return;
  const a = els.sfxClue;
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

function playSuccess() {
  if (!state.soundOn) return;
  const a = els.sfxSuccess;
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

function playClick() {
  if (!state.soundOn) return;
  const a = els.sfxClick;
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

function withClick(fn) {
  return function(ev) {
    playClick();
    return fn(ev);
  }
}

function playAltClick() {
  if (!state.soundOn) return;
  const a = els.sfxClickAlt;
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

function withAltClick(fn) {
  return function(ev) {
    playAltClick();
    return fn(ev);
  }
}

function ensureMusic() {
  const a = els.bgm;
  if (!a) return;
  a.volume = 0.2;
  if (!state.musicOn) { a.pause(); return; }

  // Try normal play first
  const tryPlay = () => a.play();
  const onUserGesture = () => {
    a.muted = false;
    a.volume = 0.2;
    tryPlay().catch(() => {});
    removeUnlockers();
  };
  const removeUnlockers = () => {
    document.removeEventListener('click', onUserGesture, opts);
    document.removeEventListener('pointerdown', onUserGesture, opts);
    document.removeEventListener('touchstart', onUserGesture, opts);
    document.removeEventListener('keydown', onUserGesture, opts);
  };
  const opts = { once: true, passive: true };

  const p = tryPlay();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      // Autoplay blocked, start muted to satisfy policy
      a.muted = true;
      a.volume = 0.0;
      tryPlay().catch(() => {});
      // Unmute on the first user gesture
      document.addEventListener('click', onUserGesture, opts);
      document.addEventListener('pointerdown', onUserGesture, opts);
      document.addEventListener('touchstart', onUserGesture, opts);
      document.addEventListener('keydown', onUserGesture, opts);
    });
  }
}

async function initApp() {
  await loadCases();
  populateCaseSelect();
  attachEvents();
  setButtonsEnabled(false);
  if (els.submitAnswerBtn) els.submitAnswerBtn.disabled = true;
  if (els.skipInvestigationBtn) els.skipInvestigationBtn.disabled = true;
  ensureMusic();
}

function hideSplashThenInit() {
  const splash = document.getElementById('splash');
  const splashText = document.getElementById('splashText');
  if (!splash) { initApp(); return; }
  // Start music as soon as loader appears
  ensureMusic();
  // Typewriter effect for "Loading case files..."
  const message = 'Loading case files...';
  if (splashText) {
    splashText.textContent = '';
    splashText.classList.add('caret');
    let i = 0;
    const speed = 60;
    const type = () => {
      if (i <= message.length) {
        splashText.textContent = message.slice(0, i);
        i++;
        setTimeout(type, speed);
      }
    };
    type();
  }
  setTimeout(() => {
    splash.classList.add('hidden');
    initApp();
  }, 4000);
}

document.addEventListener('DOMContentLoaded', hideSplashThenInit);

// -------- Spoiler Shield ----------
function maskKeywords(text) {
  if (!state.activeCase) return text;
  const base = (state.activeCase.answers || []).slice();
  const titleWords = String(state.activeCase.title || '').split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const extras = ['infinite', 'loop', 'semicolon', 'null', 'undefined', 'switch', 'break', 'fallthrough', 'asi', 'off', 'by', 'one', 'fencepost'];
  const keywords = [...new Set([...base, ...titleWords, ...extras].map(s => String(s).toLowerCase()).filter(Boolean))];
  let masked = String(text);
  for (const word of keywords) {
    if (word.length < 3) continue;
    const re = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    masked = masked.replace(re, match => '█'.repeat(match.length));
  }
  return masked;
}

function maskCodeComments(code) {
  const lines = String(code).split('\n');
  return lines.map(line => {
    const idx = line.indexOf('//');
    if (idx >= 0) {
      const head = line.slice(0, idx);
      const comment = line.slice(idx);
      return head + maskKeywords(comment);
    }
    return line;
  }).join('\n');
}

function renderSpoilers(forceOn) {
  const spoilersActive = typeof forceOn === 'boolean' ? forceOn : state.spoilersOn;
  if (!state.activeCase) return;
  if (spoilersActive) {
    // Neutralize title/desc; mask code comments and dynamic clue content
    const caseIndex = Math.max(0, CASES.findIndex(c => c.id === state.activeCase.id));
    els.caseTitle.textContent = `Case #${caseIndex + 1}`;
    els.caseDesc.textContent = 'A coding crime awaits. Proceed with the investigation.';
    els.codeBlock.textContent = maskCodeComments(state.fixed ? state.activeCase.codeFixed : state.activeCase.codeBuggy);
  } else {
    els.caseTitle.textContent = state.activeCase.title;
    els.caseDesc.textContent = state.activeCase.description;
    els.codeBlock.textContent = state.fixed ? state.activeCase.codeFixed : state.activeCase.codeBuggy;
  }
  // Sync checkbox UI with state on any re-render
  const st = document.getElementById('soundToggle');
  if (st) st.checked = !!state.soundOn;
  const mt = document.getElementById('musicToggle');
  if (mt) mt.checked = !!state.musicOn;
  const sp = document.getElementById('spoilerToggle');
  if (sp) sp.checked = !!state.spoilersOn;
}

function renderEvidence() {
  const grid = document.getElementById('evidenceGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!state.activeCase) return;
  const images = Array.isArray(state.activeCase.images) ? state.activeCase.images : [];
  if (!images.length) {
    const empty = document.createElement('div');
    empty.className = 'evidence-empty';
    empty.textContent = 'No evidence attached for this case.';
    grid.appendChild(empty);
    return;
  }
  for (const src of images) {
    const wrap = document.createElement('div');
    wrap.className = 'evidence-item';
    const img = document.createElement('img');
    img.alt = 'Evidence image';
    img.loading = 'lazy';
    img.src = src;
    wrap.appendChild(img);
    grid.appendChild(wrap);
  }
}

// How To Play modal controls
function openHowTo() {
  if (els.howToOverlay) els.howToOverlay.hidden = false;
  if (els.howToModal) els.howToModal.hidden = false;
}
function closeHowTo() {
  if (els.howToOverlay) els.howToOverlay.hidden = true;
  if (els.howToModal) els.howToModal.hidden = true;
}
