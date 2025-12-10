import pandas as pd
import joblib
import os

class MaintenanceModel:
    def __init__(self):
        self.artifacts = None
        # Menggunakan path absolut agar tidak bingung posisi folder
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_path, "models", "maintenance_brain.pkl")

    def load_artifacts(self):
        """Mencoba memuat model dari file .pkl"""
        if os.path.exists(self.model_path):
            self.artifacts = joblib.load(self.model_path)
            print(f"✅ [Predict Logic] Model loaded from: {self.model_path}")
            return True
        else:
            print(f"❌ [Error] File not found at: {self.model_path}")
            return False

    def make_prediction(self, input_data: dict):
        """
        Fungsi prediksi dengan Enhanced RUL Model (Regression-based).
        
        Improvements:
        - RUL sekarang diprediksi menggunakan ML model (tidak lagi static threshold)
        - Consider operating conditions (Torque, RPM, Temperature, dll)
        - Lebih accurate dalam estimasi remaining useful life
        """
        # --- FITUR BARU: LAZY LOADING (PENGAMAN) ---
        # Jika model belum ada (None), coba load sekarang secara paksa
        if self.artifacts is None:
            print("⚠️ Model belum dimuat di awal. Mencoba memuat sekarang...")
            success = self.load_artifacts()
            if not success:
                raise Exception(f"FATAL: File model tidak ditemukan di {self.model_path}. Cek struktur folder!")

        # ==========================================
        # 1. PREPROCESSING
        # ==========================================
        input_df = pd.DataFrame([input_data])

        # Map Type
        type_map = {'L': 0, 'M': 1, 'H': 2}
        input_df['Type'] = input_df['Type'].map(type_map)

        # Hitung Fitur Fisika
        input_df['Power'] = input_df['Torque'] * input_df['RPM']
        input_df['Temp_Diff'] = input_df['Process_Temp'] - input_df['Air_Temp']
        input_df['Wear_Strain'] = input_df['Tool_Wear'] * input_df['Torque']

        # Sesuaikan Nama Kolom
        rename_dict = {
            'Air_Temp': 'Air temperature [K]', 
            'Process_Temp': 'Process temperature [K]',
            'RPM': 'Rotational speed [rpm]', 
            'Torque': 'Torque [Nm]', 
            'Tool_Wear': 'Tool wear [min]'
        }
        input_df = input_df.rename(columns=rename_dict)

        # Validasi artifacts
        required_keys = ['features_status', 'features_type', 'features_rul', 'scaler', 
                        'scaler_rul', 'scaler_type', 'model_status', 'model_rul', 
                        'model_type', 'le_type']
        missing_keys = [key for key in required_keys if key not in self.artifacts]
        if missing_keys:
            raise Exception(f"Format Model Salah: Key berikut tidak ditemukan dalam .pkl: {missing_keys}")

        # ==========================================
        # 2. ENHANCED RUL PREDICTION (ML-based)
        # ==========================================
        # Prepare features for RUL model
        X_input_rul = input_df[self.artifacts['features_rul']]
        X_scaled_rul = self.artifacts['scaler_rul'].transform(X_input_rul)
        
        # Predict RUL using regression model
        remaining_mins = self.artifacts['model_rul'].predict(X_scaled_rul)[0]
        remaining_mins = max(0, remaining_mins)  # Ensure non-negative
        
        hours_left = remaining_mins / 60

        # Format RUL message
        if hours_left < 1:
            rul_message = f"{int(remaining_mins)} Menit Lagi"
            rul_status = "🚨 CRITICAL"
        elif hours_left < 4:
            rul_message = f"{hours_left:.1f} Jam Lagi"
            rul_status = "⚠️ WARNING"
        else:
            rul_message = f"{hours_left:.1f} Jam Lagi"
            rul_status = "✅ SAFE"

        # ==========================================
        # 3. PREDIKSI STATUS (Normal vs Failure)
        # ==========================================
        X_input_status = input_df[self.artifacts['features_status']]
        X_scaled_status = self.artifacts['scaler'].transform(X_input_status)
        
        status = self.artifacts['model_status'].predict(X_scaled_status)[0]
        prob = self.artifacts['model_status'].predict_proba(X_scaled_status)[0][1]

        # ==========================================
        # 4. SIAPKAN OUTPUT
        # ==========================================
        result = {
            "Machine_ID": input_data.get('Machine_ID', 'Unknown'),
            "Risk_Probability": f"{prob:.1%}",
            "RUL_Estimate": rul_message,
            "RUL_Status": rul_status,
            "RUL_Minutes": f"{remaining_mins:.0f}"
        }

        if status == 0:
            result['Status'] = "✅ NORMAL"
            result['Message'] = f"Mesin beroperasi normal. Estimasi sisa umur: {rul_message}"
            
            # Preventive warning jika RUL rendah meskipun status normal
            if hours_left < 4:
                result['Recommendation'] = f"⚠️ Tool wear approaching limit. Schedule maintenance dalam {rul_message}."
        else:
            result['Status'] = "⚠️ CRITICAL FAILURE DETECTED"

            # Prediksi jenis kerusakan
            X_input_type = input_df[self.artifacts['features_type']]
            X_scaled_type = self.artifacts['scaler_type'].transform(X_input_type)
            
            type_code = self.artifacts['model_type'].predict(X_scaled_type)[0]
            fail_name = self.artifacts['le_type'].inverse_transform([type_code])[0]
            result['Failure_Type'] = fail_name

            # Rekomendasi Action
            if "Power" in fail_name: 
                result['Action'] = "Cek tegangan listrik & kurangi beban RPM."
            elif "Heat" in fail_name: 
                result['Action'] = "Periksa coolant & ventilasi segera."
            elif "Tool" in fail_name: 
                result['Action'] = "Jadwalkan penggantian tool segera."
            elif "Overstrain" in fail_name:
                result['Action'] = "Kurangi torsi dan periksa beban kerja mesin."
            else: 
                result['Action'] = "Lakukan inspeksi menyeluruh."

            # Enhanced urgency based on RUL
            if remaining_mins < 30:
                result['Urgency'] = "🚨 SANGAT MENDESAK - Hentikan operasi dalam < 30 menit!"
            elif remaining_mins < 60:
                result['Urgency'] = "⚠️ MENDESAK - Maintenance diperlukan dalam 1 jam!"

        return result