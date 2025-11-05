# 💡 capstone-protek (A25-CS050)

Monorepo untuk Proyek Capstone **A25-CS050 - Predictive Maintenance Copilot**.  
Repositori ini berisi tiga layanan utama: **Backend (Express.js)**, **Frontend (React)**, dan **ML-API (FastAPI)**.

---

## 🏛️ Arsitektur Proyek

Proyek ini menggunakan arsitektur **microservice** yang diatur dalam satu **monorepo**.

![Diagram Arsitektur Microservice](https://img.shields.io/badge/Arsitektur-Microservice-blue)

1. **`frontend` (React):** Aplikasi web yang digunakan oleh pengguna.  
2. **`backend` (Express.js):** Mengelola logika bisnis, status mesin, dan komunikasi antar layanan.  
3. **`ml-api` (FastAPI):** Layanan untuk menerima data sensor dan memberikan hasil prediksi dari model machine learning.

---

## 📜 Aturan & Panduan Repository

Berikut beberapa aturan penting agar workflow tim tetap rapi dan sinkron.

### 1. Alur Cabang (Git Workflow)

> **Main adalah cabang produksi. Jangan pernah melakukan push langsung ke `main`.**

Semua pekerjaan dilakukan melalui **Pull Request (PR)** agar dapat direview dan diuji sebelum digabung ke `main`.

#### Langkah-langkah kerja Git:

1. **Ambil update terbaru dari `main`:**
   ```bash
   git checkout main
   git pull origin main
# Format: <tipe>/<tim>-<deskripsi-singkat>
git checkout -b feat/BE-logika-prioritas-alert
git checkout -b fix/FE-tampilan-dashboard
git checkout -b feat/ML-endpoint-predict
git push origin feat/BE-logika-prioritas-alert

Pull Request (PR):

Setiap perubahan (PR) dari branch ke main harus direview oleh minimal satu anggota tim lain sebelum boleh digabung ke branch utama.

1. Kesepakatan API & Tipe Data (API Contract)

Semua bentuk data yang digunakan antara BE dan FE didefinisikan di file:
backend/src/types/index.ts

Panduan kontrak data:

File backend/src/types/index.ts adalah referensi utama untuk semua interface dan struktur data.

Jika file ini diubah, pastikan frontend juga diperbarui (frontend/src/types/index.ts) dalam commit yang sama.

Backend, Frontend, dan ML harus saling mengikuti struktur data yang telah disepakati (misalnya PredictRequestML, Machine, Alert, dll).

3. Isolasi Antar Layanan

Setiap layanan harus saling berkomunikasi melalui API (HTTP Request), bukan import langsung.

Contoh yang tidak diperbolehkan:

// ❌ Tidak boleh
import '../backend/src/services'
import '../ml-api/src/predict'

#### Struktur Repository
capstone-protek/
│
├── .gitignore
├── README.md
├── docker-compose.yml        # Menjalankan semua layanan secara bersamaan
│
├── backend/                  # Tim Backend (Express.js)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── types/index.ts    # Definisi tipe data utama (API Contract)
│
├── frontend/                 # Tim Frontend (React + Vite)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── types/index.ts    # Salinan dari kontrak tipe data backend
│
└── ml-api/                   # Tim Machine Learning (FastAPI)
    ├── Dockerfile
    ├── requirements.txt
    └── src/
        ├── main.py
        └── predict.py


🚀 Cara Menjalankan Proyek
1. Mode Demo (Simulasi Produksi)

Cara ini akan membangun image untuk ketiga layanan dan menjalankannya secara bersamaan melalui Docker.

# Pastikan Docker Desktop sudah aktif
docker-compose up --build


Setelah berjalan, layanan dapat diakses melalui:

Frontend: http://localhost:3000

Backend: http://localhost:4000

ML-API: http://localhost:8000

2. Mode Development (Lokal)

Jalankan layanan secara terpisah di tiga terminal berbeda:

Terminal 1 – Backend

cd backend
npm install
npm run dev


Terminal 2 – Frontend

cd frontend
npm install
npm run dev


Terminal 3 – ML API

cd ml-api
# (Opsional: gunakan virtual environment)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000


👥 Anggota Tim
| Nama                    | Peran                      | Learning Path    |
| ----------------------- | -------------------------- | ---------------- |
| Faris Andi Muhammad     | Project Manager & Back-End | React & Back-End |
| Ahmad Fillah Alwy       | Back-End Developer         | React & Back-End |
| Ulil Absor              | Front-End Developer        | React & Back-End |
| Muhammad Zayga Ernesto  | Machine Learning Engineer  | Machine Learning |
| Muhamad Dekhsa Afnan    | Machine Learning Engineer  | Machine Learning |
