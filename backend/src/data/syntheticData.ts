export interface SensorDataRow {
    machine_id: number;
    Type: 'H' | 'M' | 'L';
    'Air temperature [K]': number;
    'Process temperature [K]': number;
    'Rotational speed [rpm]': number;
    'Torque [Nm]': number;
    'Tool wear [min]': number;
}

// Data ini akan dimuat dari file JSON/CSV hasil sintesis Anda
export const SYNTHETIC_DATA: SensorDataRow[] = [
    // ... data 40,000 baris,
    // { machine_id: 1, Type: 'H', 'Air temperature [K]': 300.1, ... },
    // { machine_id: 4, Type: 'M', 'Air temperature [K]': 299.8, ... },
];