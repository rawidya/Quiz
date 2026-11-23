/* ==========================================================
   Quiz Interaktif — script.js
   - Data soal dari public/data/soal.json (skema seragam)
   - Tema disimpan di localStorage (quiz-theme)
   - Progres disimpan di localStorage (quiz_state) -> refresh tidak reset
   - KaTeX untuk ekspresi matematika ($...$ dan $$...$$)
   - pg   = single-select (1 jawaban)
   - pg_kompleks = multi-select (beberapa jawaban, incl. tabel Benar/Salah)
   - Render gambar_soal di atas pertanyaan dan opsi[].gambar di dalam pilihan
   ========================================================== */

// ---------- Konfigurasi ----------
const DATA_URL = 'public/data/soal.json';
const SUBJECT_ORDER = ['pp', 'agama', 'bing', 'bin', 'mtk'];
const SUBJECT_LABEL = {
  pp: 'Pendidikan Pancasila',
  agama: 'PAI / Agama',
  bing: 'Bahasa Inggris',
  bin: 'Bahasa Indonesia',
  mtk: 'Matematika'
};
const SUBJECT_EMOJI = { pp: '🏛', agama: '☪', bing: '🇬🇧', bin: '🇮🇩', mtk: '🔢' };

// ---------- Data fallback (skema seragam, digunakan jika fetch gagal) ----------
const FALLBACK_DATA = {
  pp: [
    {
      id: 'fb-pp-1',
      mapel: 'Pendidikan Pancasila',
      tipe: 'pg',
      wacana: null,
      pertanyaan: 'Musyawarah adalah cara penyelesaian masalah yang lebih banyak dipilih masyarakat karena bersifat kekeluargaan.',
      gambar_soal: null,
      opsi: [
        { kode: 'a', teks: 'bersifat kekeluargaan', gambar: null },
        { kode: 'b', teks: 'secara paksa', gambar: null },
        { kode: 'c', teks: 'secara arbitriner', gambar: null },
        { kode: 'd', teks: 'secara litigasi', gambar: null }
      ],
      jawaban: ['a'],
      penjelasan: 'Musyawarah diidentifikasi dengan mekanisme kekeluargaan / musyawarah untuk mufakat.'
    }
  ],
  agama: [],
  bing: [],
  bin: [],
  mtk: []
};

let allQuestions = {};   // { pp: [], agama: [], bing: [], bin: [], mtk: [] } skema seragam
let mapelList = [];
let state = null;        // { subject, count, index, answers[], questions[] }
let autoAdvanceTimer = null;

// ---------- KaTeX ----------
function renderMath(el) {
  if (!el || typeof window.katex === 'undefined') return;
  try {
    let html = el.innerHTML;
    // Display math $$...$$ terlebih dahulu (delimiter lebih panjang)
    html = html.replace(/\$\$(.*?)\$\$/gs, (match, content) => {
      return window.katex.renderToString(content.trim(), {
        displayMode: true,
        throwOnError: false
      });
    });
    // Inline math $...$
    html = html.replace(/\$(.*?)\$/gs, (match, content) => {
      return window.katex.renderToString(content.trim(), {
        displayMode: false,
        throwOnError: false
      });
    });
    el.innerHTML = html;
  } catch (e) {
    console.warn('KaTeX render gagal:', e.message);
  }
}

// ---------- Fisher-Yates shuffle ----------
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Normalisasi jawaban ----------
function normalizeJawaban(q) {
  return (q.jawaban || []).map(j => String(j).toLowerCase().trim()).filter(Boolean);
}
function isJawabanBenar(q, selected) {
  const correct = normalizeJawaban(q);
  const isMulti = q.tipe === 'pg_kompleks';
  const sel = isMulti ? (Array.isArray(selected) ? selected.slice() : []) : (selected ? [selected] : []);
  if (sel.length === 0 && correct.length === 0) return false;
  const a = sel.slice().sort();
  const b = correct.slice().sort();
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
function jawabanTeks(q) {
  return normalizeJawaban(q).map(k => k.toUpperCase()).join(', ');
}
function selectedTeks(selected, isMulti) {
  if (!selected) return '-';
  const arr = isMulti ? (Array.isArray(selected) ? selected : []) : [selected];
  return arr.length ? arr.map(k => k.toUpperCase()).join(', ') : '-';
}
function isDijawab(selected, isMulti) {
  if (selected == null) return false;
  if (isMulti) return Array.isArray(selected) && selected.length > 0;
  return selected !== null && selected !== '';
}

// ---------- Muat soal ----------
async function loadQuestions() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('fetch gagal (' + res.status + ')');
    const data = await res.json();
    allQuestions = data.data || {};
    mapelList = data.mapel || [];
    for (const k of SUBJECT_ORDER) {
      if (!allQuestions[k]) allQuestions[k] = [];
    }
    console.log('[quiz] Data soal dimuat:', Object.entries(allQuestions).map(([k, v]) => k + '=' + v.length).join(', '));
  } catch (e) {
    console.warn('Pemuatan data gagal, pakai fallback:', e.message);
    allQuestions = { ...FALLBACK_DATA };
    mapelList = [];
  }
}

// ---------- Simpan / ambil state ----------
function saveState() {
  if (state) localStorage.setItem('quiz_state', JSON.stringify(state));
}
function clearState() {
  state = null;
  localStorage.removeItem('quiz_state');
}

// ---------- Mulai kuis ----------
function startQuiz(subject, count) {
  const bank = allQuestions[subject] || [];
  if (bank.length === 0) {
    alert('Soal untuk mapel "' + SUBJECT_LABEL[subject] + '" belum tersedia. Silakan pilih mapel lain.');
    return;
  }
  const take = Math.min(count, bank.length);
  const shuffled = shuffle(bank).slice(0, take);
  state = {
    subject,
    count: take,
    index: 0,
    answers: shuffled.map(() => ({ selected: null })),
    questions: shuffled
  };
  saveState();
  showPage('quiz');
  renderQuiz();
}

// ---------- Elemen DOM ----------
const pages = {
  welcome: document.getElementById('page-welcome'),
  mapel: document.getElementById('page-mapel'),
  quiz: document.getElementById('page-quiz'),
  hasil: document.getElementById('page-hasil')
};
const themeToggle = document.getElementById('theme-toggle');

const els = {
  qCurrent: document.getElementById('q-current'),
  qTotal: document.getElementById('q-total'),
  progressPct: document.getElementById('progress-pct'),
  progressFill: document.getElementById('progress-fill'),
  questionWacana: document.getElementById('question-wacana'),
  questionImage: document.getElementById('question-image'),
  questionText: document.getElementById('question-text'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  feedbackText: document.getElementById('feedback-text'),
  feedbackExpl: document.getElementById('feedback-expl'),
  chips: document.getElementById('chips'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next')
};

// ---------- Tema ----------
function initTheme() {
  const saved = localStorage.getItem('quiz-theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☾/☀';
  } else {
    document.body.classList.remove('light');
    themeToggle.textContent = '☀/☾';
  }
}
themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('quiz-theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☾/☀' : '☀/☾';
});

// ---------- Navigasi ----------
function showPage(id) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[id].classList.add('active');
  window.scrollTo(0, 0);
}

// ---------- Render quiz ----------
function renderQuiz() {
  if (!state) return;
  clearTimeout(autoAdvanceTimer);
  const q = state.questions[state.index];
  const isMulti = q.tipe === 'pg_kompleks';

  els.qCurrent.textContent = state.index + 1;
  els.qTotal.textContent = state.count;
  const pct = Math.round(((state.index + 1) / state.count) * 100);
  els.progressPct.textContent = pct + '%';
  els.progressFill.style.width = pct + '%';

  // Wacana (bacaan pelengkap) di atas gambar/pertanyaan
  if (q.wacana) {
    els.questionWacana.innerHTML = q.wacana;
    els.questionWacana.classList.remove('hidden');
    renderMath(els.questionWacana);
  } else {
    els.questionWacana.classList.add('hidden');
    els.questionWacana.innerHTML = '';
  }

  // Gambar soal di atas pertanyaan
  if (q.gambar_soal) {
    els.questionImage.src = q.gambar_soal;
    els.questionImage.alt = 'Ilustrasi soal';
    els.questionImage.classList.remove('hidden');
  } else {
    els.questionImage.classList.add('hidden');
    els.questionImage.removeAttribute('src');
    els.questionImage.alt = '';
  }

  // Pertanyaan
  els.questionText.innerHTML = q.pertanyaan;
  renderMath(els.questionText);

  // Opsi
  els.options.innerHTML = '';
  const answered = isDijawab(state.answers[state.index].selected, isMulti);
  const selected = state.answers[state.index].selected;

  q.opsi.forEach(o => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.kode = o.kode;
    btn.setAttribute('role', isMulti ? 'checkbox' : 'radio');
    btn.setAttribute('aria-checked', 'false');

    // Badge huruf
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = o.kode.toUpperCase();
    btn.appendChild(letter);

    // Konten opsi (gambar atau teks)
    const content = document.createElement('span');
    content.className = 'option-content';
    if (o.gambar) {
      const img = document.createElement('img');
      img.src = o.gambar;
      img.alt = 'Opsi ' + o.kode.toUpperCase();
      img.className = 'option-img';
      content.appendChild(img);
    } else if (o.teks) {
      content.innerHTML = o.teks;
      renderMath(content);
    } else {
      content.textContent = '(' + o.kode + ')';
    }
    btn.appendChild(content);

    if (answered) {
      btn.disabled = true;
      const correct = normalizeJawaban(q);
      const isCorrectOpt = correct.includes(o.kode);
      const isSelected = isMulti
        ? (Array.isArray(selected) && selected.includes(o.kode))
        : selected === o.kode;
      if (isCorrectOpt) btn.classList.add('correct');
      if (isSelected && !isCorrectOpt) btn.classList.add('wrong');
      if (isSelected && isCorrectOpt) btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      if (answered) return;
      let nextSelected;
      if (isMulti) {
        let arr = Array.isArray(selected) ? selected.slice() : [];
        if (arr.includes(o.kode)) {
          arr = arr.filter(k => k !== o.kode);
        } else {
          arr.push(o.kode);
        }
        nextSelected = arr;
        btn.setAttribute('aria-checked', String(arr.includes(o.kode)));
      } else {
        nextSelected = o.kode;
      }
      state.answers[state.index].selected = nextSelected;
      saveState();
      lockAndFeedback(q, nextSelected);
      renderChips();
      updateNav();

      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(() => {
        if (state.index < state.count - 1) {
          state.index++;
          saveState();
          renderQuiz();
        } else {
          showResult();
        }
      }, 1500);
    });

    els.options.appendChild(btn);
  });

  renderChips();
  updateNav();
}

function lockAndFeedback(q, selected) {
  const isMulti = q.tipe === 'pg_kompleks';
  const correct = normalizeJawaban(q);
  const isCorrect = isJawabanBenar(q, selected);
  const allBtns = els.options.querySelectorAll('.option');
  allBtns.forEach(b => {
    b.disabled = true;
    const kode = b.dataset.kode;
    const isCorrectOpt = correct.includes(kode);
    const isSelected = isMulti
      ? (Array.isArray(selected) && selected.includes(kode))
      : selected === kode;
    if (isCorrectOpt) b.classList.add('correct');
    if (isSelected && isCorrectOpt) b.classList.add('selected');
    if (isSelected && !isCorrectOpt) b.classList.add('wrong');
  });

  els.feedbackText.textContent = isCorrect ? 'Jawaban benar!' : 'Salah.';
  els.feedbackExpl.innerHTML = q.penjelasan || '';
  renderMath(els.feedbackExpl);
  els.feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
}

function renderChips() {
  els.chips.innerHTML = '';
  for (let i = 0; i < state.count; i++) {
    const q = state.questions[i];
    const isMulti = q.tipe === 'pg_kompleks';
    const ans = state.answers[i].selected;
    const answered = isDijawab(ans, isMulti);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = i + 1;
    if (i === state.index) btn.classList.add('active');
    if (answered) {
      btn.classList.add('answered');
      if (isJawabanBenar(q, ans)) btn.classList.add('correct');
      else btn.classList.add('wrong');
    }

    btn.addEventListener('click', () => {
      clearTimeout(autoAdvanceTimer);
      state.index = i;
      saveState();
      renderQuiz();
    });
    els.chips.appendChild(btn);
  }

  const terjawab = state.answers.reduce((n, a, i) => {
    const q = state.questions[i];
    return n + (isDijawab(a.selected, q.tipe === 'pg_kompleks') ? 1 : 0);
  }, 0);
  document.getElementById('chips-count').textContent = `(${terjawab}/${state.count})`;
}

function updateNav() {
  if (!state) return;
  const q = state.questions[state.index];
  const isMulti = q.tipe === 'pg_kompleks';
  const answered = isDijawab(state.answers[state.index].selected, isMulti);
  els.btnPrev.disabled = state.index === 0;
  els.btnNext.disabled = !answered; // harus menjawab sebelum lanjut
}

els.btnPrev.addEventListener('click', () => {
  clearTimeout(autoAdvanceTimer);
  if (state.index > 0) {
    state.index--;
    saveState();
    renderQuiz();
  }
});

els.btnNext.addEventListener('click', () => {
  clearTimeout(autoAdvanceTimer);
  if (state.index < state.count - 1) {
    state.index++;
    saveState();
    renderQuiz();
  } else {
    showResult();
  }
});

document.getElementById('btn-kembali-mapel').addEventListener('click', () => {
  clearTimeout(autoAdvanceTimer);
  clearState();
  showPage('mapel');
});

// Toggle menu lompat soal
document.getElementById('btn-toggle-chips').addEventListener('click', () => {
  const wrap = document.getElementById('chips-wrap');
  const expanded = wrap.classList.toggle('hidden');
  document.getElementById('btn-toggle-chips').setAttribute('aria-expanded', String(!expanded));
});

// ---------- Hasil ----------
function showResult() {
  let score = 0;
  const wrong = [];
  state.questions.forEach((q, i) => {
    const ans = state.answers[i].selected;
    const isMulti = q.tipe === 'pg_kompleks';
    if (isJawabanBenar(q, ans)) score++;
    else if (isDijawab(ans, isMulti)) wrong.push({ q, i, your: selectedTeks(ans, isMulti) });
  });
  const pct = Math.round((score / state.count) * 100);

  document.getElementById('hasil-score').textContent = score;
  document.getElementById('hasil-total').textContent = state.count;
  document.getElementById('hasil-pct').textContent = pct + '%';

  const wrongList = document.getElementById('wrong-list');
  wrongList.innerHTML = '';
  if (wrong.length === 0) {
    wrongList.innerHTML = '<div style="text-align:center;color:#6fcf89;font-weight:700;padding:20px;">Semua jawaban benar! Hebat!</div>';
  } else {
    wrong.forEach(w => {
      const div = document.createElement('div');
      div.className = 'wrong-item';
      const qEl = document.createElement('div');
      qEl.className = 'q';
      qEl.innerHTML = 'Soal ' + (w.i + 1) + '. ' + w.q.pertanyaan;
      renderMath(qEl);
      div.innerHTML = '';
      div.appendChild(qEl);
      const your = document.createElement('div');
      your.className = 'your-ans';
      your.textContent = 'Jawaban Anda: ' + w.your;
      div.appendChild(your);
      const correct = document.createElement('div');
      correct.className = 'correct-ans';
      correct.textContent = 'Jawaban benar: ' + jawabanTeks(w.q);
      div.appendChild(correct);
      if (w.q.penjelasan) {
        const expl = document.createElement('div');
        expl.className = 'expl';
        expl.innerHTML = w.q.penjelasan;
        renderMath(expl);
        div.appendChild(expl);
      }
      wrongList.appendChild(div);
    });
  }

  showPage('hasil');
}

document.getElementById('btn-ulangi').addEventListener('click', () => {
  if (!state) return;
  startQuiz(state.subject, state.count);
});
document.getElementById('btn-kembali').addEventListener('click', () => {
  clearState();
  showPage('welcome');
});

// ---------- Pilihan mapel ----------
const mapelGrid = document.getElementById('mapel-grid');
const jumlahHint = document.getElementById('jumlah-hint');
const pilihanSubject = document.getElementById('pilihan-subject');
const chipGroup = document.getElementById('chip-group');
const btnMulaiQuiz = document.getElementById('btn-mulai-quiz');

let selectedSubject = null;
let selectedCount = 10;

// Susun kembali kartu mapel dari data (bi & mtk disorot sebagai target fitur)
function renderMapelGrid() {
  mapelGrid.innerHTML = '';
  SUBJECT_ORDER.forEach(kode => {
    const bank = allQuestions[kode] || [];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mapel-card';
    card.dataset.subject = kode;
    card.innerHTML = `
      <span class="emoji">${SUBJECT_EMOJI[kode] || '📘'}</span>
      <span class="label">${SUBJECT_LABEL[kode]}</span>
      <span class="sub">${bank.length} soal</span>
    `;
    mapelGrid.appendChild(card);
  });
}

mapelGrid.addEventListener('click', e => {
  const card = e.target.closest('.mapel-card');
  if (!card) return;
  document.querySelectorAll('.mapel-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedSubject = card.dataset.subject;
  pilihanSubject.textContent = SUBJECT_LABEL[selectedSubject] + ' (' + selectedSubject.toUpperCase() + ')';
  jumlahHint.classList.remove('hidden');
  chipGroup.classList.remove('hidden');
  btnMulaiQuiz.classList.add('hidden');
  selectedCount = 10;
  chipGroup.scrollIntoView({ block: 'nearest', behavior: 'instant' });
});

chipGroup.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  selectedCount = parseInt(chip.dataset.count, 10) || 10;
  btnMulaiQuiz.classList.remove('hidden');
});

btnMulaiQuiz.addEventListener('click', () => {
  if (!selectedSubject) return;
  clearState();
  startQuiz(selectedSubject, selectedCount);
});

document.getElementById('btn-mulai').addEventListener('click', () => {
  clearState();
  showPage('mapel');
});

// ---------- Boot ----------
function boot() {
  initTheme();
  loadQuestions().then(() => {
    renderMapelGrid();
  });
}
boot();
