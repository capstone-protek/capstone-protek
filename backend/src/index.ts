// src/index.ts

import app from './app'; // Impor 'app' yang sudah dikonfigurasi

// Tentukan port. Ambil dari environment variable ATAU default ke 4000
const PORT = process.env.PORT || 4000;

//

// JALANKAN SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server BE Mock berjalan di http://localhost:${PORT}`);
});