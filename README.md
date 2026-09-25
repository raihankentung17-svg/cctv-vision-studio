# CCTV Vision & Memory Corruption Studio 🛰️💾

Aplikasi studio grafis web canggih yang mengimplementasikan efek visual **Computer Vision Machine Tracking + Stepped 8-Bit Memory Corruption Glitch** persis seperti yang ada pada video referensi ("CCTV Generator" / "Alpha Prompt").

---

## 🚀 Fitur Lengkap yang Telah Ditanamkan

### 1. Deteksi Kontras & Pencahayaan (Image Processing Engine)
Aplikasi ini dilengkapi algoritma pengolahan citra piksel real-time:
- **DARK (Shadows)**: Mendeteksi area gelap pekat, lipatan kain blazer, celana jeans, atau bayangan leher.
- **BRIGHT (Highlights)**: Mendeteksi area terik sinar matahari, tebing salju, atau highlight kulit overexposed.
- **CONTRAST (Edges)**: Menggunakan filter gradien Sobel (horizontal & vertikal) untuk mengunci garis batas siluet tubuh/objek.
- **COMBINED (Hybrid)**: Kombinasi pintar antara tepian tajam dengan intensitas pencahayaan tertentu.
- **Stepped Pixelation**: Menghasilkan undakan blok piksel 8-bit (*staircase chunky blocks*) yang memotong siluet subjek secara artistik.
- **Confinement Filter**: Opsi untuk membatasi korupsi memori hanya pada area subjek yang terlacak (*inside tracked subject*).

### 2. MediaPipe & Smart Computer Vision Tracking
- **Auto Scan AI**: Secara otomatis mendeteksi wajah, mata kiri/kanan, hidung, tubuh (*torso*), lengan, dan kaki.
- **Nested Bounding Boxes**: Kotak deteksi tipis bertingkat dengan corner brackets reticle (`⌜ ⌝ ⌞ ⌟`), label teknis (`[ID:001A_person]`, `[PART_head]`, `[OBJECT_blazer]`), confidence score, dan frame number.
- **Red Tracking Crosses (`+`)**: Tanda tambah merah presisi pada titik penting anatomi tubuh dan wajah.
- **Interactive Clicking**: Klik di area mana saja pada canvas untuk menambahkan titik tracking baru secara bebas.

### 3. Diagnostic Hex Dump Code Injection
- Otomatis menanamkan barisan teks crash dump memori otentik berwarna putih di dalam blok glitch:
  ```text
  MEM_ERR 0x03DF CORRUPT_PIXEL_BLOCK
  DATA_SEG_A | CORE_SECT: 7A | RETRY_CNT: 3
  PAGE_FLT_0109: 0x8C000300
  0x4F92... /4/S
  ```

### 4. Palette & Scene Presets
- Preset warna siap pakai:
  - **Acid Yellow** (`#FFE600`)
  - **Tokyo Lavender** (`#C4B5FD`)
  - **Cyber Electric Blue** (`#0022FF`)
  - **Matrix Green** (`#39FF14`)
  - **Neon Magenta** (`#FF1493`)
  - **Neon Cyan** (`#00F0FF`)
  - **Glitch Coral** (`#FF3B30`)
  - **Terminal White** (`#FFFFFF`)
  - **Custom Hex Color Picker**
- Scene Presets yang merekonstruksi adegan dari video:
  - Model Fashion Blazer (Tokyo Lavender)
  - Puncak Gunung Alpen (Acid Yellow)
  - Profil Wajah Sunglasses (Electric Blue)
  - Tangga Kayu & Tanaman Hias (Neon Magenta)

### 5. Alpha Prompt Generator & Export
- Tombol **Alpha Prompt**: Menyediakan teks prompt resmi yang telah terisi dinamis sesuai warna dan label aktif untuk digunakan pada Midjourney, Flux, Imagen, atau Stable Diffusion.
- Tombol **Export Hi-Res**: Unduh langsung hasil visual dalam resolusi asli gambar (format PNG).

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi saat ini telah **berjalan aktif di komputer Anda** pada alamat:
👉 **[http://localhost:5173/](http://localhost:5173/)**

Untuk menjalankannya kembali di masa mendatang melalui terminal:
```powershell
cd "C:\Users\user asus\.gemini\antigravity\scratch\cctv-vision-studio"
npm run dev
```
Buka browser dan akses `http://localhost:5173`.
