/* ============================================================
   tools/build_data.js
   Membangun bank soal skema seragam (public/data/soal.json)
   dari sumber:
     - questions.json         (legacy PP / PAI / BING)
     - soal_bergambar.json    (Matematika ber-gambar, sudah path-public)
     - bin.md                 (Bahasa Indonesia, jika ada)
     - mtk.md                 (Matematika, jika ada)
   Output: public/data/soal.json  (skema seragam, dedup by id)
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');
const OUT_FILE = path.join(PUBLIC_DATA, 'soal.json');

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.warn(`[build] Gagal parse JSON ${file}: ${e.message}`);
    return null;
  }
}

function readText(file) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

/* ---------- Skema tujuan (uniform) ----------
{
  id, mapel, tipe ("pg"|"pg_kompleks"), wacana, pertanyaan,
  gambar_soal, opsi [{kode, teks, gambar}], jawaban [], penjelasan
}
*/

function normalizeOption(o) {
  return {
    kode: String(o.kode || '').toLowerCase().trim(),
    teks: o.teks == null ? null : String(o.teks).trim() || null,
    gambar: o.gambar == null ? null : String(o.gambar).trim() || null
  };
}

function toUniformItem(src, mapel) {
  const opsiSrc = src.opsi || src.options;
  let opsi;
  if (Array.isArray(opsiSrc)) {
    opsi = opsiSrc.map(normalizeOption).filter(o => o.kode);
  } else if (opsiSrc && typeof opsiSrc === 'object') {
    opsi = Object.entries(opsiSrc).map(([kode, teks]) =>
      normalizeOption({ kode, teks })
    ).filter(o => o.kode);
  } else {
    opsi = [];
  }
  const jawaban = Array.isArray(src.jawaban)
    ? src.jawaban.map(j => String(j).toLowerCase().trim()).filter(Boolean)
    : src.answer != null
      ? [String(src.answer).toLowerCase().trim()]
      : [];

  return {
    id: src.id,
    mapel,
    tipe: src.tipe || (jawaban.length > 1 ? 'pg_kompleks' : 'pg'),
    wacana: src.wacana == null ? null : String(src.wacana).trim() || null,
    pertanyaan: src.pertanyaan || src.question || '',
    gambar_soal: src.gambar_soal == null ? null : String(src.gambar_soal).trim() || null,
    opsi,
    jawaban,
    penjelasan: (src.penjelasan == null ? src.explanation : src.penjelasan) == null ? null : String(src.penjelasan == null ? src.explanation : src.penjelasan).trim() || null
  };
}

/* ---------- Sumber 1: questions.json (legacy) ---------- */
function loadLegacy() {
  const data = readJson(path.join(ROOT, 'questions.json'));
  if (!data) return [];
  const mapelByKey = {
    pp: 'Pendidikan Pancasila',
    agama: 'PAI / Agama',
    bing: 'Bahasa Inggris',
    bin: 'Bahasa Indonesia',
    mtk: 'Matematika'
  };
  const items = [];
  for (const [key, list] of Object.entries(data)) {
    if (!Array.isArray(list)) continue;
    const mapel = mapelByKey[key] || key;
    for (const src of list) {
      items.push(toUniformItem(src, mapel));
    }
  }
  return items;
}

/* ---------- Sumber 2: soal_bergambar.json ---------- */
function loadBergambar() {
  const data = readJson(path.join(ROOT, 'soal_bergambar.json'));
  if (!data) return [];
  const items = [];
  for (const src of data) {
    items.push(toUniformItem(src, 'Matematika'));
  }
  return items;
}

/* ---------- Sumber 3 & 4: bin.md / mtk.md (placeholder parser) ---------- */
/*
  Format markdown yang didukung (contoh):

  ## Bab X

  > Wacana / bacaan boleh diletakkan di sini (blockquote). Opsional.

  **1. Pertanyaan dengan $matematika$?**
  - a. Teks opsi A
  - b. Teks opsi B
  - c. Teks opsi C
  - d. Teks opsi D
  - e. Teks opsi E (opsional)

  **Jawaban: b**

  *Penjelasan: ...*   (opsional)

  Soal berikutnya dipisahkan dengan baris kosong atau judul soal baru (**N. ...).
*/
const QUESTION_BLOCK = /^(?:\*\*)?(\d+)\.\s*(.+?)(?:\*\*)?\s*$/m;
const OPTION_LINE = /^\s*(?:[-*]\s*)?(?:\*\*)?([a-z])(?:\*\*)?\.\s*(.*)$/i;
const JAWABAN_LINE = /^\*\*?Jawaban\s*[:]\s*([a-zA-Z](?:\s*,\s*[a-zA-Z])*)\*\*?\s*$/im;
const PENJELASAN_LINE = /^\*?Penjelasan\s*[:]\s*(.*)\*?\s*$/im;
/* Tanda jawaban inline, gaya kumpulan_lengkap_soal_pilihan_ganda.md:
   "- **e. opsi** *(Jawaban dipilih)*" dan mtk.md "a. opsi (Jawaban dipilih)" */
const JAWABAN_INLINE = /jawaban\s*dipilih/i;

function parseMdQuestions(text, mapel, tipeDefault = 'pg') {
  const items = [];
  if (!text) return items;

  const lines = text.split(/\r?\n/);
  let current = null;
  let wacanaBuf = [];
  let inWacana = false;
  let seq = 0; // counter berjalan agar id unik meskipun nomor soal di file berulang

  function flush() {
    if (!current) return;
    const opsi = current.opsi.map(normalizeOption).filter(o => o.kode);
    const jawaban = current.jawaban.map(j => String(j).toLowerCase().trim()).filter(Boolean);
    items.push({
      id: current.id,
      mapel,
      tipe: current.tipe || tipeDefault || (jawaban.length > 1 ? 'pg_kompleks' : 'pg'),
      wacana: current.wacana || null,
      pertanyaan: current.pertanyaan || '',
      gambar_soal: current.gambar_soal || null,
      opsi,
      jawaban,
      penjelasan: current.penjelasan || null
    });
    current = null;
    wacanaBuf = [];
    inWacana = false;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Blockquote = wacana / bacaan pelengkap
    if (line.startsWith('>')) {
      inWacana = true;
      wacanaBuf.push(line.replace(/^>\s?/, ''));
      continue;
    }
    if (inWacana && line === '') {
      inWacana = false;
      continue;
    }

    const mBlock = line.match(QUESTION_BLOCK);
    if (mBlock) {
      flush();
      seq += 1;
      const code = mapel.toLowerCase().slice(0, 2);
      current = {
        id: `${code}-md-${seq}`,
        pertanyaan: mBlock[2].trim(),
        opsi: [],
        jawaban: []
      };
      if (wacanaBuf.length) {
        current.wacana = wacanaBuf.join('\n');
        wacanaBuf = [];
      }
      continue;
    }

    if (current) {
      // Lepas penurunan ** di sekunder baris opsi (dukung format kumpulan/*.md)
      let cleanLine = line.replace(/^\*\*|\*\*$/g, '');
      const mOpt = cleanLine.match(OPTION_LINE);
      if (mOpt) {
        let teksRaw = mOpt[2].trim();
        const isMarked = JAWABAN_INLINE.test(teksRaw);
        if (isMarked) {
          current.jawaban.push(mOpt[1]);
          teksRaw = teksRaw.replace(/\(\s*jawaban[^)]*\)\*?/gi, '').replace(/\*/g, '').trim() || null;
        } else {
          teksRaw = teksRaw.trim() || null;
        }
        current.opsi.push({ kode: mOpt[1], teks: teksRaw, gambar: null });
        continue;
      }
      const mJawab = line.match(JAWABAN_LINE);
      if (mJawab) {
        current.jawaban = mJawab[1].split(/\s*,\s*/);
        continue;
      }
      const mPenj = line.match(PENJELASAN_LINE);
      if (mPenj) {
        current.penjelasan = mPenj[1].trim();
        continue;
      }
    }
  }
  flush();
  return items;
}

function loadMd() {
  const items = [];
  const binText = readText(path.join(ROOT, 'bin.md'));
  if (binText) {
    const parsed = parseMdQuestions(binText, 'Bahasa Indonesia');
    console.log(`[build] bin.md: ${parsed.length} soal`);
    items.push(...parsed);
  } else {
    console.warn('[build] bin.md tidak ditemukan (kosongkan array Bahasa Indonesia).');
  }

  const mtkText = readText(path.join(ROOT, 'mtk.md'));
  if (mtkText) {
    const parsed = parseMdQuestions(mtkText, 'Matematika');
    console.log(`[build] mtk.md: ${parsed.length} soal`);
    items.push(...parsed);
  } else {
    console.warn('[build] mtk.md tidak ditemukan (kosongkan kontribusi Matematika dari md).');
  }
  return items;
}

/* ---------- Gabungkan + dedup ---------- */
function build() {
  fs.mkdirSync(PUBLIC_DATA, { recursive: true });

  const sources = [];
  const all = [];

  const legacy = loadLegacy();
  sources.push(`questions.json (legacy): ${legacy.length}`);
  all.push(...legacy);

  const bergambar = loadBergambar();
  sources.push(`soal_bergambar.json: ${bergambar.length}`);
  all.push(...bergambar);

  const md = loadMd();
  sources.push(...md.length ? [`bin.md/mtk.md: ${md.length}`] : ['bin.md/mtk.md: tidak ada file']);
  all.push(...md);

  // Lewatkan soal tanpa opsi (tidak bisa dijawab di quiz)
  let skippedNoOption = 0;
  const filtered = [];
  for (const it of all) {
    if (!it.opsi || it.opsi.length === 0) {
      skippedNoOption++;
      console.warn(`[build] Lewatkan soal tanpa opsi: ${it.id} (${it.mapel})`);
      continue;
    }
    filtered.push(it);
  }

  // Dedup by id (pertahankan yang pertama)
  const byId = new Map();
  let dupes = 0;
  for (const it of filtered) {
    if (byId.has(it.id)) {
      dupes++;
      continue;
    }
    byId.set(it.id, it);
  }

  const data = {};
  const mapelOrder = ['pp', 'agama', 'bing', 'bin', 'mtk'];
  const mapelNama = {
    pp: 'Pendidikan Pancasila',
    agama: 'PAI / Agama',
    bing: 'Bahasa Inggris',
    bin: 'Bahasa Indonesia',
    mtk: 'Matematika'
  };
  for (const k of mapelOrder) data[k] = [];
  for (const it of byId.values()) {
    const key = {
      'Bahasa Indonesia': 'bin',
      Matematika: 'mtk',
      'Pendidikan Pancasila': 'pp',
      'PAI / Agama': 'agama',
      'Bahasa Inggris': 'bing'
    }[it.mapel] || String(it.mapel).toLowerCase().slice(0, 2);
    if (!data[key]) data[key] = [];
    data[key].push(it);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    sources,
    mapel: mapelOrder.map(k => ({ kode: k, nama: mapelNama[k] })),
    data,
    total: byId.size,
    dupesRemoved: dupes
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`\n[build] Selesai. ${out.total} soal unik ditulis ke ${OUT_FILE}`);
  console.log(`[build] Duplikasi dihapus: ${dupes}`);
  for (const [k, v] of Object.entries(data)) {
    console.log(`[build]   ${k} (${mapelNama[k] || k}): ${v.length} soal`);
  }
}

module.exports = { parseMdQuestions, toUniformItem, normalizeOption, loadLegacy, loadBergambar, loadMd, build };

if (require.main === module) {
  build();
}
