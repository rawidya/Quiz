/* ==========================================================
   Quiz Interaktif — script.js
   - Tema disimpan di localStorage (quiz-theme)
   - Progres disimpan di localStorage (quiz_state) -> refresh tidak reset
   - Muat soal dari questions.json; fallback ke data tersemat jika fetch gagal (file:// CORS)
   - Fisher-Yates shuffle, opsi A-D, jawaban tunggal, tanpa animasi
   ========================================================== */

// ---------- Data fallback (digunakan jika fetch questions.json gagal) ----------
const FALLBACK_DATA = {
  pp: [
    {
      id: "fp-1",
      question: "Musyawarah menjadi salah satu cara penyelesaian masalah yang lebih banyak dipilih masyarakat karena bersifat kekeluargaan. Salah satu perilaku yang tidak dibenarkan dalam musyawarah adalah",
      options: {
        A: "melakukan aksi walk out ketika terjadi kericuhan",
        B: "menyetujui pendapat teman yang sesuai dengan idenya",
        C: "siap melaksanakan apa pun hasil musyawarah",
        D: "tidak mengungkapkan pendapat"
      },
      answer: "A",
      explanation: "Walk out (kelingar dari forum) bukan sikap yang dianjurkan dalam musyawarah untuk mufakat."
    },
    {
      id: "fp-2",
      question: "Sesuai sila pertama Pancasila, bangsa Indonesia adalah bangsa yang bertuhan. Cara perwujudan sila ini yang paling tepat adalah",
      options: {
        A: "beribadah sesuai agamanya secara bebas",
        B: "melaksanakan ajaran agamanya dengan tetap memperhatikan kepentingan pemeluk agama lain",
        C: "beribadah tanpa memedulikan pemeluk agama lain",
        D: "mempelajari agama lain untuk mengetahui kelebihan dan kekurangan masing-masing"
      },
      answer: "B",
      explanation: "Kemanusiaan yang adil dan beradab meminta kita menghormati agama lain, bukan hanya mengabaikannya."
    },
    {
      id: "fp-3",
      question: "Intoleransi merupakan salah satu tantangan yang kita hadapi di era globalisasi. Salah satu cara untuk menghindari sikap intoleransi adalah",
      options: {
        A: "meningkatkan pemahaman bahwa semua orang sama dan sederajat",
        B: "menuntut pemerintah meratakan kesejahteraan masyarakat",
        C: "menyatukan perbedaan dalam masyarakat",
        D: "sikap mengalah oleh pihak minoritas demi kebersamaan"
      },
      answer: "A",
      explanation: "Pemahaman terhadap kesederajatan merupakan dasar menolak intoleransi."
    },
    {
      id: "fp-4",
      question: "Menentang keras segala bentuk bullying adalah contoh perilaku sesuai sila kedua Pancasila. Tindakan nyata yang sesuai adalah",
      options: {
        A: "membalas perbuatan pelaku bullying",
        B: "melakukan demo dan kampanye anti-bullying ke gedung pemerintah daerah",
        C: "membentuk kelompok pertemanan anti-bullying",
        D: "melaporkan segala bentuk bullying kepada pihak berwenang di lingkungan kejadian"
      },
      answer: "D",
      explanation: "Melaporkan ke pihak berwenang adalah tindak tegas dan sesuai hukum."
    },
    {
      id: "fp-5",
      question: "Demokrasi di Indonesia adalah demokrasi yang berlandaskan permusyawaratan. Yang dapat mencirikan demokrasi di Indonesia adalah",
      options: {
        A: "sering dilakukan kegiatan pemilu",
        B: "pemilu diikuti oleh banyak partai politik",
        C: "pemilu dilakukan secara demokratis tanpa ada intimidasi",
        D: "pemilu menjadi ajang untuk menunjukkan kekuasaan pemimpin"
      },
      answer: "C",
      explanation: "Demokrasi yang sehat memerlukan pemilu bebas dari intimidasi."
    },
    {
      id: "fp-6",
      question: "Bangsa Indonesia menempatkan persatuan dan kesatuan di atas kepentingan pribadi. Perbuatan yang sesuai adalah",
      options: {
        A: "gemar menggunakan produk dalam negeri",
        B: "dengan kerelaan hati melaksanakan hasil musyawarah meskipun bertentangan dengan kehendak pribadinya",
        C: "rela berkorban demi kepentingan orang lain",
        D: "ikut terlibat dalam usaha pertahanan dan keamanan negara"
      },
      answer: "B",
      explanation: "Sila ketiga menekankan kerukunan dan menyelesaikan perselisihan melalui musyawarah."
    },
    {
      id: "fp-7",
      question: "Globalisasi membawa dampak besar bagi bangsa Indonesia. Salah satu bentuk tantangannya adalah",
      options: {
        A: "korupsi yang semakin merajalela",
        B: "kesenjangan ekonomi",
        C: "sumber daya manusia yang rendah",
        D: "menguatnya individualisme"
      },
      answer: "D",
      explanation: "Individualisme yang menguat merupakan salah satu tantangan nilai-nilai kebersamaan Pancasila."
    },
    {
      id: "fp-8",
      question: "Pancasila menjadi salah satu kekuatan Indonesia di tengah gempuran globalisasi. Alasan yang paling tepat adalah",
      options: {
        A: "Pancasila merupakan dasar negara Indonesia",
        B: "Pancasila mengandung nilai-nilai positif yang membentuk karakter dan kepribadian bangsa Indonesia yang kuat dan tangguh untuk menangkal efek buruk globalisasi",
        C: "Pancasila menunjukkan jati diri bangsa Indonesia",
        D: "Pancasila tidak mudah ditiru bangsa lain"
      },
      answer: "B",
      explanation: "Nilai-nilai positif Pancasila membentuk karakter bangsa yang tangguh menghadapi globalisasi."
    },
    {
      id: "fp-9",
      question: "Pasal 33 UUD 1945 memuat tentang perekonomian nasional. Perekonomian nasional dilaksanakan berdasarkan",
      options: {
        A: "demokrasi ekonomi dengan prinsip kebersamaan",
        B: "persaingan bebas",
        C: "monopoli",
        D: "kemenangan di tangan pemilik modal"
      },
      answer: "A",
      explanation: "Pasal 33 UUD 1945 mengatur perekonomian sebagai usaha bersama berdasarkan prinsip kepramukaan."
    },
    {
      id: "fp-10",
      question: "Gotong royong merupakan tradisi bangsa Indonesia. Istilah gotong royong di Bengkulu adalah",
      options: {
        A: "mapalus",
        B: "alak tau",
        C: "batobo",
        D: "ngacau gelamai"
      },
      answer: "D",
      explanation: "Ngacau gelamai adalah istilah gotong royong di Bengkulu."
    }
  ],
  agama: [
    {
      id: "fa-1",
      question: "Perhatikan Q.S. al-Baqarah/ 2: 155. Arti ayat yang bergaris bawah (وَبَشِّرِ الصّٰبِرِيْنَۙ) adalah",
      options: {
        A: "dan sungguh akan kami uji manusia",
        B: "kami uji dengan kelaparan",
        C: "dengan sedikit harta",
        D: "dan berikan kabar gembira kepada orang-orang yang sabar"
      },
      answer: "D",
      explanation: "بَشِّرِ الصّٰبِرِيْنَ berarti sampaikan kabar gembira kepada orang-orang yang sabar."
    },
    {
      id: "fa-2",
      question: "Dalam hadis riwayat Ummu Salamah, Rasulullah Saw. mengajarkan do'a Inna lillahi wa inna ilaihi raji'un. Artinya adalah?",
      options: {
        A: "Kami mohon ampun kepada Allah",
        B: "Segala puji bagi Allah",
        C: "Sesungguhnya kami milik Allah dan kepada-Nya kami kembali",
        D: "Allah Maha Pengampun"
      },
      answer: "C",
      explanation: "Kalimat istirja' mengakui bahwa segala sesuatu milik Allah dan akan kembali kepada-Nya."
    },
    {
      id: "fa-3",
      question: "Sabar dalam melaksanakan ketaatan kepada Allah Swt. adalah contoh perilaku yang diberikan oleh",
      options: {
        A: "Pak Rahman yang rajin salat jamaah di masjid walaupun gerimis",
        B: "seseorang yang menghindari kemaksiatan",
        C: "seseorang yang menerima takdir Allah",
        D: "seseorang yang beribadah hanya saat senang"
      },
      answer: "A",
      explanation: "Rajin salat jamaah meskipun dalam kondisi sulit mencerminkan sabar dalam ketaatan."
    },
    {
      id: "fa-4",
      question: "Mengapa sabar dalam menerima takdir Allah dianggap penting?",
      options: {
        A: "Agar orang lain melihat kita sebagai contoh yang baik",
        B: "Karena Allah suka melihat orang menderita",
        C: "Karena takdir Allah tidak dapat diubah",
        D: "Agar kita bisa mengeluh dan meratapi nasib kita"
      },
      answer: "C",
      explanation: "Takdir Allah (qada' dan qadar) tidak dapat diubah oleh manusia."
    },
    {
      id: "fa-5",
      question: "Yang termasuk perilaku sabar dalam menghadapi musibah adalah",
      options: {
        A: "acuh tak acuh terhadap musibah yang dialami",
        B: "minta bantuan orang pintar",
        C: "menerima dengan lapang dada dan ikhlash",
        D: "melakukan kegiatan yang menyenangkan"
      },
      answer: "C",
      explanation: "Sabar dalam musibah berarti menerima dengan lapang dada dan ikhlash."
    },
    {
      id: "fa-6",
      question: "Ciri-ciri sifat sabar, kecuali adalah",
      options: {
        A: "tidak suka berkeluh kesah",
        B: "tabah dalam menghadapi musibah",
        C: "tidak mudah putus asa",
        D: "selalu mengeluh ketika menghadapi musibah"
      },
      answer: "D",
      explanation: "Mengeluh bukan merupakan ciri seseorang yang sabar."
    },
    {
      id: "fa-7",
      question: "Ayat yang berbicara tentang masalah warisan adalah",
      options: {
        A: "Q.S. al-Hadid/57: 12",
        B: "Q.S. al-Waqi'ah/56: 15-24",
        C: "Q.S. al-Hujurat/9: 12",
        D: "Q.S. an-Nisa'/4 : 11-12"
      },
      answer: "D",
      explanation: "Ayat warisan (faraid) terdapat dalam Q.S. an-Nisa' ayat 11 dan 12."
    },
    {
      id: "fa-8",
      question: "Menurut bahasa ashabah berarti",
      options: {
        A: "terhalang",
        B: "bertambah",
        C: "sisa harta",
        D: "harta yang rusak"
      },
      answer: "C",
      explanation: "Ashabah dalam kata berarti sisa harta yang diterima ahli waris."
    },
    {
      id: "fa-9",
      question: "Ahli waris yang tidak pernah hilang hak warisnya adalah",
      options: {
        A: "saudara laki-laki dan perempuan",
        B: "anak laki-laki dan perempuan",
        C: "ayah dan ibu",
        D: "cucu laki-laki dan perempuan"
      },
      answer: "B",
      explanation: "Anak (laki-laki dan perempuan) adalah ahli waris yang haknya tidak pernah hilang."
    },
    {
      id: "fa-10",
      question: "Ahli waris yang mendapat bagian 2/3 adalah",
      options: {
        A: "anak perempuan lebih dari satu",
        B: "cucu laki laki lebih dari satu",
        C: "anak perempuan tunggal",
        D: "suami apabila tidak ada anak"
      },
      answer: "A",
      explanation: "Dua anak perempuan atau lebih tanpa pihak lain mendapat 2/3."
    }
  ],
  bing: [],
  bin: [],
  mtk: []
};

// ---------- Elemen DOM ----------
const pages = {
  welcome: document.getElementById('page-welcome'),
  mapel: document.getElementById('page-mapel'),
  quiz: document.getElementById('page-quiz'),
  hasil: document.getElementById('page-hasil')
};
const themeToggle = document.getElementById('theme-toggle');

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

// ---------- State quiz ----------
const STATE_KEY = 'quiz_state';
let state = null;        // { subject, count, index, answers[], questions[] }
let allQuestions = {};   // { pp: [], agama: [], ... } dari JSON
let autoAdvanceTimer = null;

// ---------- Fisher-Yates shuffle ----------
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Muat soal ----------
async function loadQuestions() {
  try {
    const res = await fetch('questions.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('fetch gagal');
    const data = await res.json();
    allQuestions = {
      pp: data.pp || [],
      agama: data.agama || [],
      bing: data.bing || [],
      bin: data.bin || [],
      mtk: data.mtk || []
    };
  } catch (e) {
    console.warn('Fetch questions.json gagal, pakai fallback:', e.message);
    allQuestions = {
      pp: FALLBACK_DATA.pp,
      agama: FALLBACK_DATA.agama,
      bing: FALLBACK_DATA.bing,
      bin: FALLBACK_DATA.bin,
      mtk: FALLBACK_DATA.mtk
    };
  }
}

// ---------- Simpan / ambil state ----------
function saveState() {
  if (state) localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
function clearState() {
  state = null;
  localStorage.removeItem(STATE_KEY);
}

// ---------- Mulai kuis ----------
function startQuiz(subject, count) {
  const bank = allQuestions[subject] || [];
  if (bank.length === 0) {
    alert('Soal untuk mapel ini belum tersedia. Silakan pilih mapel lain.');
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

// ---------- Render quiz ----------
const els = {
  qCurrent: document.getElementById('q-current'),
  qTotal: document.getElementById('q-total'),
  progressPct: document.getElementById('progress-pct'),
  progressFill: document.getElementById('progress-fill'),
  questionText: document.getElementById('question-text'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  feedbackText: document.getElementById('feedback-text'),
  feedbackExpl: document.getElementById('feedback-expl'),
  chips: document.getElementById('chips'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next')
};

function renderQuiz() {
  if (!state) return;
  clearTimeout(autoAdvanceTimer);
  const q = state.questions[state.index];
  els.qCurrent.textContent = state.index + 1;
  els.qTotal.textContent = state.count;
  const pct = Math.round(((state.index + 1) / state.count) * 100);
  els.progressPct.textContent = pct + '%';
  els.progressFill.style.width = pct + '%';

  els.questionText.textContent = q.question;
  els.options.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.dataset.letter = letter;
    const spanLetter = document.createElement('span');
    spanLetter.className = 'letter';
    spanLetter.textContent = letter;
    const spanText = document.createElement('span');
    spanText.textContent = q.options[letter];
    btn.appendChild(spanLetter);
    btn.appendChild(spanText);

    const answered = state.answers[state.index].selected !== null;
    if (answered) {
      btn.disabled = true;
      if (letter === q.answer) btn.classList.add('correct');
      if (state.answers[state.index].selected === letter && letter !== q.answer) {
        btn.classList.add('wrong');
      }
    }

    btn.addEventListener('click', () => {
      if (answered) return;
      const selected = letter;
      state.answers[state.index].selected = selected;
      saveState();

      // Tandai semua
      const allBtns = els.options.querySelectorAll('.option');
      allBtns.forEach(b => b.disabled = true);
      allBtns.forEach(b => {
        if (b.dataset.letter === q.answer) b.classList.add('correct');
        if (b.dataset.letter === selected && selected !== q.answer) b.classList.add('wrong');
      });

      // Feedback
      const isCorrect = selected === q.answer;
      els.feedbackText.textContent = isCorrect ? 'Jawaban benar!' : 'Salah.';
      els.feedbackExpl.textContent = q.explanation;
      els.feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');

      renderChips();
      updateNav();

      // Otomatis lanjut ke soal berikutnya setelah jeda (feedback tetap terlihat)
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

function renderChips() {
  els.chips.innerHTML = '';
  for (let i = 0; i < state.count; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = i + 1;
    if (i === state.index) btn.classList.add('active');

    const ans = state.answers[i].selected;
    if (ans !== null) {
      btn.classList.add('answered');
      if (ans === state.questions[i].answer) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
      }
    }

    btn.addEventListener('click', () => {
      state.index = i;
      saveState();
      renderQuiz();
    });
    els.chips.appendChild(btn);
  }

  // Tampilkan jumlah terjawab di tombol toggle
  const terjawab = state.answers.filter(a => a.selected !== null).length;
  document.getElementById('chips-count').textContent = `(${terjawab}/${state.count})`;
}

function updateNav() {
  const answered = state.answers[state.index].selected !== null;
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

// Toggle menu lompat soal (buka/tutup)
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
    if (ans === q.answer) score++;
    else if (ans !== null) wrong.push({ q, i, your: ans });
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
      div.innerHTML = `
        <div class="q">Soal ${w.i + 1}. ${w.q.question}</div>
        <div class="your-ans">Jawaban Anda: ${w.your} — ${w.q.options[w.your]}</div>
        <div class="correct-ans">Jawaban benar: ${w.q.answer} — ${w.q.options[w.q.answer]}</div>
        <div class="expl">${w.q.explanation}</div>
      `;
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

mapelGrid.addEventListener('click', e => {
  const card = e.target.closest('.mapel-card');
  if (!card) return;
  document.querySelectorAll('.mapel-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedSubject = card.dataset.subject;
  pilihanSubject.textContent = selectedSubject.toUpperCase();
  jumlahHint.classList.remove('hidden');
  chipGroup.classList.remove('hidden');
  btnMulaiQuiz.classList.add('hidden');
  selectedCount = 10;
  // Bawa opsi jumlah soal ke layar supaya tidak perlu scroll manual di HP
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
initTheme();
loadQuestions();
