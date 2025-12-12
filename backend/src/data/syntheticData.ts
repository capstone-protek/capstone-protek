export interface SensorDataRow {
  machine_id: number;
  Type: 'L' | 'M' | 'H';
  Air_Temp: number;
  Process_Temp: number;
  RPM: number;
  Torque: number;
  Tool_Wear: number;
}

export const SYNTHETIC_DATA: SensorDataRow[] = [
  {
    machine_id: 1,
    Type: 'M',
    Air_Temp: 298.1,
    Process_Temp: 308.6,
    RPM: 1551,
    Torque: 42.8,
    Tool_Wear: 0,
  },
  {
    machine_id: 1,
    Type: 'L',
    Air_Temp: 298.2,
    Process_Temp: 308.7,
    RPM: 1408,
    Torque: 46.3,
    Tool_Wear: 3,
  },
  {
    machine_id: 1,
    Type: 'L',
    Air_Temp: 298.1,
    Process_Temp: 308.5,
    RPM: 1498,
    Torque: 49.4,
    Tool_Wear: 5,
  },
  {
    machine_id: 1,
    Type: 'M',
    Air_Temp: 298.2,
    Process_Temp: 308.6,
    RPM: 1433,
    Torque: 39.5,
    Tool_Wear: 7,
  },
  {
    machine_id: 1,
    Type: 'L',
    Air_Temp: 298.2,
    Process_Temp: 308.7,
    RPM: 1408,
    Torque: 40.0,
    Tool_Wear: 9,
  },
];