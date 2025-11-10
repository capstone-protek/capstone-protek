// src/controllers/alert.controller.ts

// (Pastikan Anda menggunakan Request, Response dari express)
import { Request, Response } from 'express';
import { MOCK_ALERTS } from '../data/mockData';

export const getAllAlerts = (req: Request, res: Response) => {
  try {
    // Logika bisnis kita saat ini HANYA mengembalikan data palsu
    // Kita WAJIB mengembalikannya sesuai bentuk Kontrak API
    res.status(200).json({
      alerts: MOCK_ALERTS 
    });

  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data alerts" });
  }
};

// (Buat juga controller untuk endpoint lain, misal machine.controller.ts, dll.)