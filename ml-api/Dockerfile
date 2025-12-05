# 1. Gunakan base image Python yang ringan
FROM python:3.9-slim

# 2. Set folder kerja di dalam container
WORKDIR /app

# 3. Copy file requirements dulu (agar caching efisien)
COPY requirements.txt .

# 4. Install dependencies
# --no-cache-dir agar image tetap kecil
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy seluruh kode dan model .pkl ke dalam container
COPY . .

# 6. Beritahu Docker bahwa aplikasi berjalan di port 8000
EXPOSE 8000

# 7. Perintah untuk menjalankan aplikasi saat container start
# Penting: host="0.0.0.0" agar bisa diakses dari luar container
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]