# Panduan Lengkap SEO untuk Ncream (ndys.web.id)

Repo ini sudah dilengkapi file-file SEO dasar. Setelah kamu deploy ulang, ikuti langkah-langkah di bawah ini agar website terindeks dengan baik di Google, Bing, dan muncul bagus saat dishare di WhatsApp/Instagram/Facebook/Twitter.

---

## 1. File SEO yang sudah ditambahkan di zip ini

| File | Fungsi |
|------|--------|
| `robots.txt` | Memberi tahu search engine apa yang boleh di-crawl + lokasi sitemap |
| `sitemap.xml` | Daftar URL website untuk Google/Bing |
| `og-image.png` | Gambar 1200×630 yang bagus saat dishare di media sosial |
| `site.webmanifest` | PWA / Add to Home Screen + icon |
| `apple-touch-icon.png` | Icon untuk iPhone/iPad |
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-192x192.png`, `favicon-512x512.png` | Favicon berbagai ukuran |
| `index.html` (diperbarui) | Meta tags lengkap + Open Graph + Twitter Card + Structured Data (JSON-LD) |

**Catatan:** `og:image` sekarang mengarah ke `og-image.png` (ukuran ideal). File `ftprofil.png` tetap ada kalau kamu mau pakai untuk keperluan lain.

---

## 2. Deploy ulang ke GitHub Pages

1. Download zip revisi ini.
2. Extract semua file ke folder lokal.
3. Upload / commit semua file ke repo `nadyaicecream/ndysice` (branch `main`).
   - Pastikan file baru (`robots.txt`, `sitemap.xml`, `og-image.png`, `site.webmanifest`, favicon-* , `apple-touch-icon.png`) ikut ter-upload di **root** repo.
4. Tunggu 1–3 menit sampai GitHub Pages rebuild.
5. Cek apakah file sudah hidup:
   - https://ndys.web.id/robots.txt
   - https://ndys.web.id/sitemap.xml
   - https://ndys.web.id/og-image.png

---

## 3. Langkah-langkah SEO On-Page yang sudah dilakukan (sudah di zip)

- Title & Description dioptimasi
- Canonical URL
- Open Graph + Twitter Card lengkap (dengan ukuran image)
- Structured Data (Schema.org FoodEstablishment + WebSite)
- Favicon & Apple Touch Icon
- robots meta, theme-color, dll.

---

## 4. Langkah yang HARUS kamu lakukan setelah deploy (Off-page & Tools)

### A. Google Search Console (PALING PENTING)

1. Buka → https://search.google.com/search-console
2. Klik **Add property** → pilih **URL prefix** → masukkan `https://ndys.web.id`
3. Verifikasi kepemilikan:
   - Paling mudah: **HTML tag** (copy meta tag yang diberikan, tempel di `<head>` index.html, commit ulang)  
     ATAU  
   - **DNS** (tambah TXT record di domain registrar kamu)
4. Setelah verified:
   - Masuk ke **Sitemaps** → submit `https://ndys.web.id/sitemap.xml`
   - Minta indexing halaman utama: **URL Inspection** → masukkan `https://ndys.web.id/` → **Request Indexing**

### B. Google Business Profile (kalau punya lokasi fisik / delivery)

1. https://business.google.com
2. Buat profil bisnis "Ncream" atau "Ncream Ice Cream"
3. Isi alamat, jam buka, nomor WhatsApp, foto, dll.
4. Verifikasi (via kartu pos / telepon / email)

### C. Bing Webmaster Tools

1. https://www.bing.com/webmasters
2. Add site `https://ndys.web.id`
3. Verifikasi (mirip Google, bisa pakai meta tag atau XML)
4. Submit sitemap yang sama.

### D. Cek Open Graph / Share Preview

Setelah deploy, cek preview:

- **Facebook / WhatsApp / Instagram**:  
  https://developers.facebook.com/tools/debug/  
  → masukkan `https://ndys.web.id/` → **Scrape Again**

- **Twitter / X**:  
  https://cards-dev.twitter.com/validator  
  (atau cukup share di Twitter, lihat preview)

- **LinkedIn**:  
  https://www.linkedin.com/post-inspector/

### E. PageSpeed & Core Web Vitals

1. https://pagespeed.web.dev/  
   → analisis `https://ndys.web.id/`
2. Perbaiki saran yang muncul (gambar Unsplash sudah cukup baik, tapi bisa compress lebih lanjut nanti).

### F. Lain-lain (opsional tapi bagus)

- **Google Analytics 4** atau **Microsoft Clarity** (gratis) untuk tracking visitor.
- Daftarkan di **Google Merchant Center** kalau nanti jual produk dengan harga tetap (opsional).
- Buat akun **Google My Business** + minta review pelanggan.
- Share link website di Instagram bio, TikTok bio, WhatsApp status, story, dll. (social signal membantu).

---

## 5. Checklist cepat setelah deploy

- [ ] `https://ndys.web.id/robots.txt` bisa dibuka
- [ ] `https://ndys.web.id/sitemap.xml` bisa dibuka
- [ ] `https://ndys.web.id/og-image.png` bisa dibuka
- [ ] Google Search Console → property verified
- [ ] Sitemap sudah disubmit di Search Console
- [ ] Request indexing halaman utama
- [ ] Facebook Sharing Debugger → scrape ulang
- [ ] Preview WhatsApp terlihat bagus (gambar + judul + deskripsi)

---

## 6. Tips lanjutan (setelah 1–2 minggu)

- Update `lastmod` di `sitemap.xml` setiap kali kamu ubah konten penting.
- Tambah halaman baru (misalnya `/menu`, `/promo`, `/about`) kalau nanti mau, lalu update sitemap.
- Buat konten blog sederhana (resep, cerita di balik rasa) untuk long-tail keyword.
- Minta backlink dari teman / komunitas es krim / review lokal.

---

## Kontak & Support

Kalau ada masalah teknis (file tidak muncul, error 404 di robots/sitemap), cek Settings → Pages di GitHub repo apakah sudah set ke branch `main` / root.

Selamat SEO-ing! Semoga Ncream makin banyak yang order 🍦

---
Dibuat otomatis untuk repo nadyaicecream/ndysice  
Website: https://ndys.web.id/
