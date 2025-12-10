# ml-api/src/data_loader.py

import pandas as pd
import os
from typing import List, Dict, Any

# Tentukan path relatif ke folder dataset
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')

# Mapping untuk menetapkan machine_id berdasarkan nama file
FILE_TO_ID_MAP = {
    'SYNTHETIC_SPEED_LOW.csv': 1,
    'SYNTHETIC_TEMP_HIGH.csv': 2,
    'SYNTHETIC_TORQUE_HIGH.csv': 3,
    'SYNTHETIC_WEAR_HIGH.csv': 4,
}

def load_and_combine_data() -> List[Dict[str, Any]]:
    """
    Memuat, menggabungkan, dan mengurutkan data simulasi dari 4 file CSV.
    """
    combined_df = pd.DataFrame()
    
    print("Loading and combining simulation data...")
    for filename, machine_id in FILE_TO_ID_MAP.items():
        file_path = os.path.join(DATASET_DIR, filename)
        
        if os.path.exists(file_path):
            try:
                df = pd.read_csv(file_path)
                df['machine_id'] = machine_id
                combined_df = pd.concat([combined_df, df], ignore_index=True)
            except Exception as e:
                print(f"Error reading file {filename}: {e}")
        else:
            print(f"WARNING: File {filename} not found at {file_path}")
            
    # Langkah Kritis: Urutkan data berdasarkan urutan waktu simulasi
    # Asumsi: Kita urutkan berdasarkan index/UID dan machine_id (untuk round-robin)
    if 'UID' in combined_df.columns:
        combined_df = combined_df.sort_values(by=['UID', 'machine_id'])
    else:
        # Jika tidak ada UID, urutkan berdasarkan index dan machine_id
        combined_df = combined_df.sort_values(by=['machine_id']).sample(frac=1).sort_index()

    print(f"Total {len(combined_df)} rows of combined simulation data loaded.")
    
    # Konversi DataFrame ke List of Dictionaries
    return combined_df.to_dict('records')