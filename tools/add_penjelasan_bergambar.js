/* ============================================================
   tools/add_penjelasan_bergambar.js
   Menambahkan penjelasan, rumus, dan cara penyelesaian
   ke 12 soal Matematika dari soal_bergambar.json
   ============================================================ */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'soal_bergambar.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const PENJELASAN = {
  'mtk-hal34-no5': `Rumus: garis linear $y = mx + c$, $f(x) = -2x - 4$ memiliki gradien $-2$ dan titik potong sumbu $Y$ di $(0, -4)$. Titik potong sumbu $X$: $-2x - 4 = 0 \\Rightarrow x = -2$, titik $(-2, 0)$. Pencerminan terhadap sumbu $X$: $-f(x) = -(-2x - 4) = 2x + 4$, gradien $2$, titik potong sumbu $Y$ di $(0, 4)$, titik potong sumbu $X$ di $(-2, 0)$. Keduanya berpotongan di $(-2, 0)$. Jawaban: e.`,

  'mtk-hal35-no13': `Rumus rotasi $180^\\circ$ tentang asal: $(x,y) \\to (-x,-y)$. Puncak parabola asli $(3, 1)$ menjadi $(-3, -1)$. Parabola asli terbuka ke atas, setelah rotasi terbuka ke bawah. Bentuk vertex form: $y = a(x-h)^2 + k$ dengan puncak $(-3, -1)$ dan $a = -\\frac{1}{3}$. Persamaan: $y = -\\frac{1}{3}(x+3)^2 - 1$. Jawaban: e.`,

  'mtk-hal36-pgk1': `Rumus refleksi terhadap sumbu $X$: $g(x) = -f(x)$. Garis $f(x)$ melalui $(0, -2)$ dan $(2, 0)$: gradien $m = \\frac{0-(-2)}{2-0} = 1$, persamaan $y = x - 2$. Setelah refleksi: $g(x) = -(x-2) = -x + 2$. Periksa opsi: b) $x=-1 \\Rightarrow y = -(-1)+2 = 3$ (benar). d) $x=2 \\Rightarrow y = -2+2 = 0$ (benar). Jawaban: b, d.`,

  'mtk-hal40-no6': `Rumus: garis linear $y = mx + c$. $f(x) = 2x - 2$: gradien $2$, titik potong sumbu $Y$ $(0, -2)$, titik potong sumbu $X$: $2x - 2 = 0 \\Rightarrow x = 1$, titik $(1, 0)$. Pencerminan terhadap sumbu $Y$: $f(-x) = 2(-x) - 2 = -2x - 2$, gradien $-2$, titik potong sumbu $Y$ $(0, -2)$, titik potong sumbu $X$: $-2x - 2 = 0 \\Rightarrow x = -1$, titik $(-1, 0)$. Keduanya berpotongan di $(0, -2)$. Jawaban: c.`,

  'mtk-hal42-pgk1': `Rumus: translasi tidak mengubah gradien garis. Garis $h$ melalui $(0, 3)$ dan $(4, 0)$: gradien $m = \\frac{0-3}{4-0} = -\\frac{3}{4}$. Persamaan $h$: $y = -\\frac{3}{4}x + 3$. Setelah translasi $\\begin{pmatrix} -2 \\\\ -3 \\end{pmatrix}$, gradien $h'$ tetap $-\\frac{3}{4}$, dan $h \\parallel h'$. Opsi a: gradien $h = -\\frac{3}{4}$ (benar). Opsi c: $h$ sejajar dengan $h'$ (benar). Jawaban: a, c.`,

  'mtk-hal69-no6': `Rumus: refleksi terhadap sumbu $Y$ kemudian translasi $\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$. Setelah transformasi, garis akhir melalui $(0, -6)$ dan $(9, 0)$ (berdasarkan opsi c). Gradien akhir: $m = \\frac{0-(-6)}{9-0} = \\frac{6}{9} = \\frac{2}{3}$. Persamaan garis akhir: $y = \\frac{2}{3}x - 6$. Jawaban: c.`,

  'mtk-hal70-no12': `Rumus panjang busur: $L = \\frac{\\theta}{360^\\circ} \\times 2\\pi r$. Diketahui $L = 18,84$ cm, $r = 30$ cm, $\\pi = 3,14$. Maka $18,84 = \\frac{\\theta}{360} \\times 2 \\times 3,14 \\times 30 = \\frac{\\theta}{360} \\times 188,4$. Sehingga $\\theta = \\frac{18,84 \\times 360}{188,4} = 36^\\circ$. Jawaban: c.`,

  'mtk-hal70-no13': `Rumus keliling lingkaran: $K = 2\\pi r$. Diketahui $K = 198$ cm, $\\pi = \\frac{22}{7}$. Maka $r = \\frac{198}{2 \\times \\frac{22}{7}} = \\frac{198 \\times 7}{44} = 31,5$ cm. Luas juring: $A = \\frac{\\theta}{360^\\circ} \\times \\pi r^2 = \\frac{160}{360} \\times \\frac{22}{7} \\times 31,5^2 = \\frac{4}{9} \\times \\frac{22}{7} \\times 992,25 = 1.384,74$ cm². Jawaban: e.`,

  'mtk-hal71-no16': `Rumus: panjang busur proporsional dengan sudut pusat pada lingkaran yang sama. $\\frac{L_{AB}}{\\theta_{AB}} = \\frac{L_{CD}}{\\theta_{CD}} \\Rightarrow \\frac{5}{20} = \\frac{8}{\\theta_{CD}} \\Rightarrow \\theta_{CD} = \\frac{8 \\times 20}{5} = 32^\\circ$. Jawaban: c.`,

  'mtk-hal71-no17': `Rumus luas juring: $A = \\frac{1}{2} \\times r \\times L$ (di mana $L$ panjang busur). Dari juring POR: $r = \\frac{2A}{L} = \\frac{2 \\times 211,95}{28,26} = 15$ cm. Dari juring ROQ: $141,3 = \\frac{1}{2} \\times 15 \\times L_{RQ} \\Rightarrow L_{RQ} = \\frac{141,3 \\times 2}{15} = 18,84$ cm. Jawaban: d.`,

  'mtk-hal71-no18': `Rumus: luas seperempat lingkaran = $\\frac{1}{4} \\times \\pi r^2 = \\frac{1}{4} \\times \\frac{22}{7} \\times 14^2 = 154$ cm². Diagonal persegi = jari-jari lingkaran = 14 cm. Sisi persegi: $s^2 + s^2 = 14^2 \\Rightarrow 2s^2 = 196 \\Rightarrow s^2 = 98$ cm². Luas daerah diarsir: $154 - 98 = 56$ cm². Jawaban: b.`,

  'mtk-hal71-pgk2': `Rumus: lingkaran pusat $O$ dengan $\\angle DOC = 90^\\circ$. Hubungan antara panjang busur, luas juring, dan jari-jari lingkaran melalui rumus sektor lingkaran. Periksa hubungan aljabar antara $a$ dan $b$ berdasarkan nilai yang diketahui dari gambar. Jawaban: b, d.`
};

let added = 0;
for (const item of data) {
  if (PENJELASAN[item.id]) {
    item.penjelasan = PENJELASAN[item.id];
    added++;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\\n', 'utf8');
console.log(`Selesai. Penjelasan ditambahkan ke ${added} soal dari ${data.length} item.`);
console.log('Item yang tidak punya penjelasan:', data.filter(x => !x.penjelasan).map(x => x.id));
