# Ncream — Setup Database Google Sheets + Apps Script

Website ini sudah siap pakai **Google Sheets** sebagai database gratis.
Produk & order tersimpan di Sheet, website load data lewat Apps Script.

---

## Bagian 1: Buat Google Sheet (Database)

1. Buka [https://sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**
2. Rename file jadi **Ncream Database** (bebas)
3. Buat **2 sheet** (tab di bawah):

### Tab 1: `Products` (nama tab harus persis)

| id | name | description | price | category | image | stock | active |
|----|------|-------------|-------|----------|-------|-------|--------|
| 1 | Strawberry Bliss | Sweet strawberry | 25000 | classic | https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=700&q=85 | 50 | TRUE |
| 2 | Choco Dream | Rich chocolate | 27000 | classic | https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85 | 50 | TRUE |
| 3 | Mint Cloud | Cool & refreshing | 28000 | special | https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=85 | 40 | TRUE |
| 4 | Vanilla Berry | Vanilla & berry | 30000 | special | https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=700&q=85 | 40 | TRUE |

**Keterangan kolom:**
- `id` → unik (1, 2, 3...)
- `name` → nama produk
- `description` → deskripsi singkat
- `price` → harga angka saja (tanpa Rp)
- `category` → classic / special (atau apapun, akan jadi filter)
- `image` → URL gambar (Unsplash, Drive public, Imgur, dll)
- `stock` → stok (0 = habis, produk tetap tampil tapi tombol + hilang)
- `active` → TRUE / FALSE (FALSE = tidak tampil di website)

### Tab 2: `Orders` (nama tab harus persis)

| id | timestamp | customer_name | customer_wa | items | total | notes | status |
|----|-----------|---------------|-------------|-------|-------|-------|--------|

Header saja dulu. Data akan terisi otomatis saat ada order.

4. **Salin Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/1AbCDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                    ini ID-nya (antara /d/ dan /edit)
   ```

---

## Bagian 2: Setup Apps Script

1. Di Google Sheet yang sama → menu **Extensions → Apps Script**
2. Hapus semua kode default di editor
3. Buka file `apps-script/Code.gs` dari zip ini → **copy semua** → paste ke editor Apps Script
4. Ganti baris ini:
   ```js
   const SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
   ```
   dengan ID Sheet kamu, contoh:
   ```js
   const SPREADSHEET_ID = '1AbCDeFgHiJkLmNoPqRsTuVwXyZ';
   ```
5. Klik **Save** (ikon disket) → beri nama project misal `Ncream API`
6. (Opsional) Jalankan fungsi `setupSheets` sekali:
   - Pilih fungsi `setupSheets` di dropdown atas → klik Run
   - Izinkan permission (Review permissions → Advanced → Go to ... → Allow)
   - Ini akan isi contoh data Products & buat header Orders
7. **Deploy**:
   - Klik **Deploy → New deployment**
   - Type: **Web app**
   - Description: `Ncream v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**
   - Izinkan permission jika diminta
   - **Copy URL** yang muncul (bentuknya `https://script.google.com/macros/s/xxxxx/exec`)

---

## Bagian 3: Hubungkan ke Website

1. Buka folder `website/`
2. Edit file `script.js`
3. Cari bagian CONFIG di paling atas:
   ```js
   const CONFIG = {
     APPS_SCRIPT_URL: 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',
     WA_NUMBER: '6285691428657'
   };
   ```
4. Ganti:
   - `APPS_SCRIPT_URL` → URL Web App yang tadi kamu copy
   - `WA_NUMBER` → nomor WhatsApp toko kamu (format 62..., tanpa +)
5. Simpan

---

## Bagian 4: Deploy ke GitHub Pages

1. Buat repo baru di GitHub (atau update repo yang sudah ada)
2. Upload **semua isi folder `website/`** ke root repo (index.html, script.js, style.css, favicon, dll)
3. Settings repo → **Pages** → Source: Deploy from branch → branch `main` / `master` → folder `/ (root)`
4. Tunggu 1–2 menit, website live di `https://username.github.io/repo-name` atau custom domain kamu

**Catatan CNAME:**  
Kalau pakai domain `ndys.web.id`, pastikan file `CNAME` berisi domain tersebut dan DNS sudah diarahkan ke GitHub Pages.

---

## Cara pakai sehari-hari

| Mau apa | Caranya |
|---------|---------|
| Tambah / ubah produk | Edit baris di sheet **Products** → website otomatis update (refresh halaman) |
| Nonaktifkan produk | Ubah kolom `active` jadi `FALSE` |
| Lihat order masuk | Buka sheet **Orders** |
| Ubah status order | Edit kolom `status` (Baru / Diproses / Selesai / dll) |
| Ubah harga | Edit kolom `price` di Products |

Tidak perlu deploy ulang website setiap ganti menu/harga.

---

## Testing cepat

1. Buka website
2. Pastikan produk muncul (kalau URL belum diisi, akan pakai data fallback lokal)
3. Tambah produk ke keranjang → Checkout
4. Isi nama + nomor WA → Kirim
5. Cek sheet **Orders** → harus ada baris baru
6. WhatsApp harus terbuka dengan pesan pesanan

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Produk tidak muncul | Cek APPS_SCRIPT_URL sudah benar. Cek tab Products namanya persis `Products`. Cek Deploy access = Anyone |
| Order tidak masuk Sheet | Cek Console browser (F12) ada error? Pastikan doPost deploy ulang setelah ubah kode |
| CORS error | Pastikan deploy sebagai Web app + Anyone. Jangan pakai `/dev` URL |
| Stok tidak berkurang | Kolom `stock` harus ada di Products. Order harus kirim `id` produk |

---

## Struktur file zip

```
ncream-deploy/
├── CARA_SETUP.md          ← file ini
├── apps-script/
│   └── Code.gs            ← paste ke Apps Script
└── website/               ← upload ke GitHub Pages
    ├── index.html
    ├── script.js          ← ganti APPS_SCRIPT_URL di sini
    ├── style.css
    ├── favicon.png
    ├── favicon.svg
    ├── CNAME
    └── hotlink/
```

Selamat jualan! 🍦
