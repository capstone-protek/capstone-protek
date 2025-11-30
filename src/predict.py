import pandas as pd
import joblib
import os

class MaintenanceModel:
    def __init__(self):
        self.artifacts = None
        # Path ke root directory (parent dari src), lalu ke folder model
        root_dir = os.path.dirname(os.path.dirname(__file__))
        self.model_path = os.path.join(root_dir, "model", "maintenance_brain.pkl")

    def load_artifacts(self):
        """Memuat model .pkl ke memori"""
        try:
            self.artifacts = joblib.load(self.model_path)
            print(f"✅ Model loaded from: {self.model_path}")
        except FileNotFoundError:
            raise Exception(f"File model tidak ditemukan di: {self.model_path}")

    def make_prediction(self, input_data: dict):
        """
        Logika utama prediksi.
        Menerima dictionary (dari request body), mengembalikan dictionary hasil.
        """
        if self.artifacts is None:
            raise Exception("Model belum dimuat! Jalankan load_artifacts() terlebih dahulu.")

        # --- 1. Preprocessing & Feature Engineering ---
        input_df = pd.DataFrame([input_data])
        
        # Rename kolom (Agar sesuai training)
        rename_dict = {
            'Air_Temp': 'Air temperature [K]', 
            'Process_Temp': 'Process temperature [K]',
            'RPM': 'Rotational speed [rpm]', 
            'Torque': 'Torque [Nm]', 
            'Tool_Wear': 'Tool wear [min]'
        }
        input_df = input_df.rename(columns=rename_dict)

        # Mapping Type
        type_map = {'L': 0, 'M': 1, 'H': 2}
        input_df['Type'] = input_df['Type'].map(type_map)

        # Physics Features
        input_df['Power'] = input_df['Torque [Nm]'] * input_df['Rotational speed [rpm]']
        input_df['Temp_Diff'] = input_df['Process temperature [K]'] - input_df['Air temperature [K]']
        input_df['Wear_Strain'] = input_df['Tool wear [min]'] * input_df['Torque [Nm]']

        # --- 2. Persiapan Fitur ---
        X_status = input_df[self.artifacts['features_status']]
        X_status_scaled = self.artifacts['scaler'].transform(X_status)
        X_fail_type = input_df[self.artifacts['features_type_rul']]

        # --- 3. Logika RUL & Prediksi ---
        threshold_limit = self.artifacts.get('failure_threshold', 200)  # Default 200 menit jika tidak ada
        current_wear = input_data['Tool_Wear']
        remaining_mins = threshold_limit - current_wear
        hours_left = remaining_mins / 60

        # Prediksi AI
        prob_failure = self.artifacts['model_status'].predict_proba(X_status_scaled)[0][1]

        # Penentuan Status (Hybrid)
        is_failure = False
        status_msg = "✅ NORMAL"
        
        if remaining_mins <= 0 or prob_failure > 0.5:
            is_failure = True
            status_msg = "⚠️ CRITICAL FAILURE"

        # Pesan RUL
        if remaining_mins <= 0:
            rul_msg = "OVERDUE: Segera ganti komponen!"
        elif hours_left < 1:
            rul_msg = f"PERINGATAN: Sisa {int(remaining_mins)} Menit lagi."
        else:
            rul_msg = f"Aman. Estimasi {hours_left:.1f} Jam Operasional lagi."

        # --- 4. Susun Hasil ---
        result = {
            "machine_id": input_data.get('Machine_ID'),
            "status": status_msg,
            "risk_score": float(round(prob_failure, 4)),
            "rul_estimation": rul_msg,
            "recommendation": "Lakukan monitoring rutin."
        }

        if is_failure:
            type_code = self.artifacts['model_type'].predict(X_fail_type)[0]
            fail_name = self.artifacts['le_type'].inverse_transform([type_code])[0]
            
            result['detected_failure'] = fail_name
            
            if "Power" in fail_name: result['recommendation'] = "Cek Power Supply & RPM."
            elif "Heat" in fail_name: result['recommendation'] = "Periksa sistem pendingin."
            elif "Tool" in fail_name: result['recommendation'] = "Ganti Tool segera."
            else: result['recommendation'] = "Inspeksi manual diperlukan."

        return result