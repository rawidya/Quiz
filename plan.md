# Plan Website Quiz Interaktif

## 1. Tujuan
Membuat website quiz interaktif dengan 4 file terpisah (HTML, CSS, JS, JSON), desain minimalis profesional mirip portfolio pengguna (dark mode, aksen emas/kuning, card-based), tanpa animasi sama sekali.

## 2. File yang Dibuat
| File | Keterangan |
|------|------------|
| `index.html` | 5 halaman dalam satu file (Welcome, Pilihan Mapel, Jumlah Soal, Quiz, Hasil) |
| `style.css` | Desain dark/light mode, aksen emas, minimalis, responsif, **tanpa animasi** |
| `script.js` | Logic quiz vanilla JS, data soal tersemat, state disimpan di localStorage |
| `questions.json` | Bank soal JSON |

## 3. Tema Desain
- Dark mode & Light mode (tombol di pojok kanan atas, preferensi simpan di `localStorage`)
- Clean, modern, minimalis, elegan
- Tidak ada animasi sama sekali (no `transition`, `animation`, `@keyframes`)
- Responsif (bagus di HP dan laptop)
- Aksen warna kuning/emas (mirip portfolio pengguna)
- Background sangat gelap (dark mode default), teks putih/abu-abu
- Card-based layout dengan border radius dan border halus

## 4. Alur Website

### Halaman 1: Welcome
- Foto di atas dengan `src="foto.jpg"`
- Teks besar: "Welcome to My World"
- Tombol "Mulai" ke halaman pilihan mata pelajaran
- Tombol ganti mode gelap/putih di pojok kanan atas

### Halaman 2: Pilihan Mata Pelajaran
Pilihan dalam bentuk card:
- PP (Pendidikan Pancasila)
- BING (Bahasa Inggris)
- BIN (Bahasa Indonesia)
- AGAMA
- MTK (Matematika)

Setelah memilih mapel, muncul pilihan jumlah soal: 10, 20, 30, atau 40.

### Halaman 3: Quiz
- Soal diambil secara acak dari bank soal sesuai mapel
- Setiap soal: pertanyaan, 4 pilihan (A, B, C, D), jawaban benar, penjelasan
- Saat menjawab: feedback benar/salah langsung + penjelasan
- Progress bar sederhana (soal ke berapa dari total)
- Tombol Next untuk lanjut
- **Tombol Sebelumnya** untuk kembali ke soal sebelumnya
- **Chip nomor soal** untuk lompat-lompat ke soal mana saja
- Soal diacak setiap kali mulai (Fisher-Yates shuffle)
- Jika jumlah soal diminta lebih banyak dari yang tersedia, ambil semua yang ada

### Halaman 4: Hasil
- Skor (benar / total) + persentase
- Daftar soal yang dijawab salah beserta penjelasannya
- Tombol "Ulangi Quiz" dan "Kembali ke Beranda"

## 5. Struktur Data Soal (`questions.json`)
```json
{
  "pp": [ { id, question, options: {A,B,C,D}, answer, explanation }, ... ],
  "bing": [],
  "bin": [],
  "agama": [],
  "mtk": []
}
```

## 6. Sumber Soal (dari file `.md`)
- **PP**: 105 soal dari `kumpulan_soal_pilihan_ganda_pendidikan_pancasila.md`
- **PAI / Agama**: 117 soal dari `kumpulan_soal_pilihan_ganda_pai_dan_budi_pekerti.md`
- **BING, BIN, MTK**: array kosong (siap diisi nanti)
- Hanya opsi A–D yang diambil (opsi E dihilangkan), jawaban tunggal

## 7. Teknologi
- HTML, CSS, JavaScript murni (vanilla JS)
- File terpisah: index.html, style.css, script.js, questions.json
- Foto welcome: `src="foto.jpg"`

## 8. State Management
- Preferensi tema disimpan di `localStorage` (key: `quiz-theme`)
- Progres quiz disimpan di `localStorage` (key: `quiz_state`) → refresh tidak reset ke awal
- Data soal PP dan PAI langsung tersemat di dalam `script.js` sebagai fallback jika `fetch questions.json` gagal

## 9. Kriteria Selesai
- [ ] Soal PP dan PAI muncul dengan benar saat memilih mapel
- [ ] Opsi A, B, C, D muncul dan bisa diklik
- [ ] Feedback benar/salah + penjelasan langsung muncul
- [ ] Tombol Sebelumnya dan Selanjutnya berfungsi
- [ ] Bisa klik chip nomor soal untuk lompat ke soal mana saja
- [ ] Refresh halaman tidak mereset progres (lanjut dari soal terakhir)
- [ ] Dark mode / Light mode konsisten di semua halaman
- [ ] Tidak ada animasi sama sekali
- [ ] Tampilan rapi di HP dan laptop
- [ ] Tidak terlihat "AI slop" (desain profesional, tidak generik)

## 10. Catatan Penting
- Jika `index.html` dibuka langsung via `file://` (bukan server lokal), `fetch questions.json` bisa diblokir CORS. Fallback data di `script.js` menjamin quiz tetap berjalan.
- Pastikan file `foto.jpg` ada di folder yang sama untuk halaman Welcome.