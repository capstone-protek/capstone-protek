
import pandas as pd
import joblib
import os

class MaintenanceModel:
    def __init__(self):
        self.artifacts = None
        # models folder is in src/models/, not at project root
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_path, "models", "maintenance_brain.pkl")
        
        print(f"🔍 [Init] Model path: {self.model_path}")

    def load_artifacts(self):
        """Mencoba memuat model dari file .pkl"""
        if os.path.exists(self.model_path):
            try:
                self.artifacts = joblib.load(self.model_path)
                print(f"✅ [Predict Logic] Model loaded from: {self.model_path}")
                
                # Debug: Print available keys
                if isinstance(self.artifacts, dict):
                    print(f"📋 Available keys in model: {list(self.artifacts.keys())}")
                
                return True
            except Exception as e:
                print(f"❌ [Error] Failed to load model: {e}")
                return False
        else:
            print(f"❌ [Error] File not found at: {self.model_path}")
            print(f"🔍 Current directory: {os.getcwd()}")
            print(f"📁 Please ensure model file exists at: {self.model_path}")
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
        # Use snake_case input, then map to expected feature names
        input_df = pd.DataFrame([input_data])

        # Map type to numeric
        type_map = {'L': 0, 'M': 1, 'H': 2}
        input_df['type_num'] = input_df['type'].map(type_map)

        # Physics features (snake_case)
        input_df['power'] = input_df['torque'] * input_df['rpm']
        input_df['temp_diff'] = input_df['process_temp'] - input_df['air_temp']
        input_df['wear_strain'] = input_df['tool_wear'] * input_df['torque']

        # Rename snake_case into dataset-friendly names (CSV headers)
        rename_dict = {
            'air_temp': 'Air temperature [K]',
            'process_temp': 'Process temperature [K]',
            'rpm': 'Rotational speed [rpm]',
            'torque': 'Torque [Nm]',
            'tool_wear': 'Tool wear [min]',
            'type_num': 'Type',            # numeric encoded
            'power': 'Power',
            'temp_diff': 'Temp_Diff',
            'wear_strain': 'Wear_Strain',
        }
        input_df = input_df.rename(columns=rename_dict)

        # Validasi artifacts (flexible untuk backward compatibility)
        # Only check critical keys
        required_keys_status = ['features_status', 'scaler', 'model_status']
        missing_keys = [key for key in required_keys_status if key not in self.artifacts]
        
        if missing_keys:
            raise Exception(f"❌ Model tidak valid. Missing critical keys: {missing_keys}")
        
        # Check optional keys (for enhanced features)
        has_rul_model = 'model_rul' in self.artifacts and 'features_rul' in self.artifacts
        has_type_model = 'model_type' in self.artifacts and 'features_type' in self.artifacts
        
        if not has_rul_model:
            print("⚠️ RUL model not found. Will use rule-based estimation.")
        if not has_type_model:
            print("⚠️ Failure type model not found. Will use rule-based detection.")

        # ==========================================
        # 2. ENHANCED RUL PREDICTION (ML-based or fallback)
        # ==========================================
        if has_rul_model:
            # Use ML-based RUL prediction
            try:
                X_input_rul = input_df[self.artifacts['features_rul']]
                
                # Check if separate scaler exists for RUL
                if 'scaler_rul' in self.artifacts:
                    X_scaled_rul = self.artifacts['scaler_rul'].transform(X_input_rul)
                else:
                    X_scaled_rul = self.artifacts['scaler'].transform(X_input_rul)
                
                remaining_mins = self.artifacts['model_rul'].predict(X_scaled_rul)[0]
                remaining_mins = max(0, remaining_mins)
            except Exception as e:
                print(f"⚠️ RUL prediction error: {e}. Using fallback method.")
                remaining_mins = self._calculate_rul_fallback(input_df)
        else:
            # Fallback: Rule-based RUL estimation
            remaining_mins = self._calculate_rul_fallback(input_df)
        
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
            "machine_id": input_data.get('machine_id', 'Unknown'),
            "risk_probability": f"{prob:.1%}",
            "rul_estimate": rul_message,
            "rul_status": rul_status,
            "rul_minutes": f"{remaining_mins:.0f}"
        }

        if status == 0:
            result['status'] = "✅ NORMAL"
            result['message'] = f"Mesin beroperasi normal. Estimasi sisa umur: {rul_message}"
            
            # Preventive warning jika RUL rendah meskipun status normal
            if hours_left < 4:
                result['recommendation'] = f"⚠️ Tool wear approaching limit. Schedule maintenance dalam {rul_message}."
        else:
            result['status'] = "⚠️ CRITICAL FAILURE DETECTED"

            # Prediksi jenis kerusakan
            X_input_type = input_df[self.artifacts['features_type']]
            X_scaled_type = self.artifacts['scaler_type'].transform(X_input_type)
            
            type_code = self.artifacts['model_type'].predict(X_scaled_type)[0]
            fail_name = self.artifacts['le_type'].inverse_transform([type_code])[0]
            result['failure_type'] = fail_name

            # Rekomendasi Action
            if "Power" in fail_name: 
                result['action'] = "Cek tegangan listrik & kurangi beban RPM."
            elif "Heat" in fail_name: 
                result['action'] = "Periksa coolant & ventilasi segera."
            elif "Tool" in fail_name: 
                result['action'] = "Jadwalkan penggantian tool segera."
            elif "Overstrain" in fail_name:
                result['action'] = "Kurangi torsi dan periksa beban kerja mesin."
            else: 
                result['action'] = "Lakukan inspeksi menyeluruh."

            # Enhanced urgency based on RUL
            if remaining_mins < 30:
                result['urgency'] = "🚨 SANGAT MENDESAK - Hentikan operasi dalam < 30 menit!"
            elif remaining_mins < 60:
                result['urgency'] = "⚠️ MENDESAK - Maintenance diperlukan dalam 1 jam!"

        return result

    def _calculate_rul_fallback(self, input_df: pd.DataFrame) -> int:
        """
        Fallback RUL calculation using rule-based estimation when ML model unavailable.
        Based on tool wear, temperature, and rotational speed.
        
        Returns:
            int: estimated remaining minutes
        """
        try:
            # Extract key features
            tool_wear = input_df['Tool wear [min]'].values[0] if 'Tool wear [min]' in input_df else 0
            temp_k = input_df['Process temperature [K]'].values[0] if 'Process temperature [K]' in input_df else 298
            rpm = input_df['Rotational speed [rpm]'].values[0] if 'Rotational speed [rpm]' in input_df else 1500
            torque = input_df['Torque [Nm]'].values[0] if 'Torque [Nm]' in input_df else 40
            
            # Rule-based RUL estimation
            # Tool wear baseline: typically fails around 200-240 minutes
            max_tool_wear = 240
            wear_factor = max(0, (max_tool_wear - tool_wear) / max_tool_wear)
            
            # Temperature stress factor (higher temp = faster degradation)
            temp_stress = max(0, min(1, (temp_k - 295) / 15))  # Normalize around 295-310K range
            temp_factor = 1 - (temp_stress * 0.3)  # Up to 30% reduction for high temp
            
            # RPM stress factor (extreme RPM = faster wear)
            rpm_stress = 0
            if rpm < 1200:  # Too slow
                rpm_stress = (1200 - rpm) / 1200 * 0.2
            elif rpm > 2400:  # Too fast
                rpm_stress = (rpm - 2400) / 1000 * 0.2
            rpm_factor = 1 - min(0.3, rpm_stress)
            
            # Torque stress factor
            torque_stress = max(0, (torque - 40) / 40 * 0.2)  # Baseline at 40 Nm
            torque_factor = 1 - min(0.2, torque_stress)
            
            # Combined estimation
            base_hours = 8  # Baseline hours of operation
            estimated_hours = base_hours * wear_factor * temp_factor * rpm_factor * torque_factor
            
            # Ensure minimum and maximum bounds
            estimated_hours = max(0.5, min(24, estimated_hours))
            estimated_mins = int(estimated_hours * 60)
            
            return int(estimated_hours), estimated_mins
            
        except Exception as e:
            print(f"⚠️ [RUL Fallback] Error in calculation: {e}")
            # Return conservative estimate
            return 240
