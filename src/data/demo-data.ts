import type { AthleteRaw } from "@/types/athlete";

// 24 athletes across 4 positions — realistic sport-science values for soccer
export const DEMO_ATHLETES: AthleteRaw[] = [
  // ── Forwards ──────────────────────────────────────────────────────────────
  { athlete_name: "Jordan Blake",    position: "Forward",    session_date: "2025-06-10", jump_height_cm: 42.1, peak_power_w_kg: 68.3, peak_velocity_ms: 8.92, acceleration_ms2: 4.81, deceleration_ms2: 4.12, asymmetry_index: 6.2, rsi: 1.82, peak_force_n_kg: 31.4, contact_time_ms: 218, hip_rom_deg: 112 },
  { athlete_name: "Marcus Webb",     position: "Forward",    session_date: "2025-06-10", jump_height_cm: 38.7, peak_power_w_kg: 64.1, peak_velocity_ms: 9.21, acceleration_ms2: 5.10, deceleration_ms2: 3.94, asymmetry_index: 4.8, rsi: 1.71, peak_force_n_kg: 29.8, contact_time_ms: 231, hip_rom_deg: 108 },
  { athlete_name: "Luca Ferrante",   position: "Forward",    session_date: "2025-06-10", jump_height_cm: 45.3, peak_power_w_kg: 71.0, peak_velocity_ms: 8.65, acceleration_ms2: 4.60, deceleration_ms2: 4.30, asymmetry_index: 3.1, rsi: 1.95, peak_force_n_kg: 33.2, contact_time_ms: 205, hip_rom_deg: 119 },
  { athlete_name: "Tyler Shaw",      position: "Forward",    session_date: "2025-06-11", jump_height_cm: 36.2, peak_power_w_kg: 59.8, peak_velocity_ms: 8.40, acceleration_ms2: 4.35, deceleration_ms2: 3.50, asymmetry_index: 12.4, rsi: 1.55, peak_force_n_kg: 27.6, contact_time_ms: 258, hip_rom_deg: 102 },
  { athlete_name: "Rahul Nair",      position: "Forward",    session_date: "2025-06-11", jump_height_cm: 40.8, peak_power_w_kg: 66.5, peak_velocity_ms: 8.78, acceleration_ms2: 4.72, deceleration_ms2: 4.05, asymmetry_index: 7.9, rsi: 1.76, peak_force_n_kg: 30.5, contact_time_ms: 224, hip_rom_deg: 115 },
  { athlete_name: "Sam O'Brien",     position: "Forward",    session_date: "2025-06-11", jump_height_cm: 43.5, peak_power_w_kg: 70.2, peak_velocity_ms: 9.05, acceleration_ms2: 4.95, deceleration_ms2: 4.20, asymmetry_index: 5.5, rsi: 1.88, peak_force_n_kg: 32.1, contact_time_ms: 210, hip_rom_deg: 116 },

  // ── Midfielders ───────────────────────────────────────────────────────────
  { athlete_name: "Diego Vargas",    position: "Midfielder", session_date: "2025-06-10", jump_height_cm: 37.5, peak_power_w_kg: 61.2, peak_velocity_ms: 8.30, acceleration_ms2: 4.45, deceleration_ms2: 3.80, asymmetry_index: 5.0, rsi: 1.65, peak_force_n_kg: 28.4, contact_time_ms: 242, hip_rom_deg: 110 },
  { athlete_name: "Noah Fischer",    position: "Midfielder", session_date: "2025-06-10", jump_height_cm: 34.0, peak_power_w_kg: 57.8, peak_velocity_ms: 7.95, acceleration_ms2: 4.10, deceleration_ms2: 3.55, asymmetry_index: 8.7, rsi: 1.48, peak_force_n_kg: 26.1, contact_time_ms: 265, hip_rom_deg: 105 },
  { athlete_name: "Kai Lindström",   position: "Midfielder", session_date: "2025-06-10", jump_height_cm: 39.2, peak_power_w_kg: 63.4, peak_velocity_ms: 8.55, acceleration_ms2: 4.62, deceleration_ms2: 3.90, asymmetry_index: 4.2, rsi: 1.72, peak_force_n_kg: 29.6, contact_time_ms: 235, hip_rom_deg: 113 },
  { athlete_name: "Emre Yıldız",     position: "Midfielder", session_date: "2025-06-11", jump_height_cm: 36.8, peak_power_w_kg: 60.5, peak_velocity_ms: 8.10, acceleration_ms2: 4.28, deceleration_ms2: 3.68, asymmetry_index: 6.3, rsi: 1.58, peak_force_n_kg: 27.9, contact_time_ms: 248, hip_rom_deg: 108 },
  { athlete_name: "Chris Powell",    position: "Midfielder", session_date: "2025-06-11", jump_height_cm: 33.5, peak_power_w_kg: 55.9, peak_velocity_ms: 7.80, acceleration_ms2: 4.05, deceleration_ms2: 3.40, asymmetry_index: 15.2, rsi: 1.41, peak_force_n_kg: 25.3, contact_time_ms: 272, hip_rom_deg: 99  },
  { athlete_name: "Matteo Greco",    position: "Midfielder", session_date: "2025-06-11", jump_height_cm: 38.0, peak_power_w_kg: 62.7, peak_velocity_ms: 8.42, acceleration_ms2: 4.50, deceleration_ms2: 3.82, asymmetry_index: 5.8, rsi: 1.68, peak_force_n_kg: 29.0, contact_time_ms: 239, hip_rom_deg: 111 },
  { athlete_name: "Alex Turnbull",   position: "Midfielder", session_date: "2025-06-12", jump_height_cm: 35.4, peak_power_w_kg: 58.3, peak_velocity_ms: 8.05, acceleration_ms2: 4.20, deceleration_ms2: 3.60, asymmetry_index: 9.1, rsi: 1.52, peak_force_n_kg: 26.8, contact_time_ms: 261, hip_rom_deg: 106 },
  { athlete_name: "Ben Okoro",       position: "Midfielder", session_date: "2025-06-12", jump_height_cm: 41.0, peak_power_w_kg: 65.0, peak_velocity_ms: 8.60, acceleration_ms2: 4.68, deceleration_ms2: 3.95, asymmetry_index: 4.5, rsi: 1.79, peak_force_n_kg: 30.2, contact_time_ms: 228, hip_rom_deg: 114 },

  // ── Defenders ─────────────────────────────────────────────────────────────
  { athlete_name: "James Holt",      position: "Defender",   session_date: "2025-06-10", jump_height_cm: 35.8, peak_power_w_kg: 60.1, peak_velocity_ms: 7.75, acceleration_ms2: 4.15, deceleration_ms2: 4.40, asymmetry_index: 5.5, rsi: 1.60, peak_force_n_kg: 32.8, contact_time_ms: 245, hip_rom_deg: 107 },
  { athlete_name: "Carlos Mendez",   position: "Defender",   session_date: "2025-06-10", jump_height_cm: 37.0, peak_power_w_kg: 62.0, peak_velocity_ms: 7.90, acceleration_ms2: 4.22, deceleration_ms2: 4.55, asymmetry_index: 6.8, rsi: 1.64, peak_force_n_kg: 34.1, contact_time_ms: 238, hip_rom_deg: 109 },
  { athlete_name: "Ivan Petrov",     position: "Defender",   session_date: "2025-06-11", jump_height_cm: 33.0, peak_power_w_kg: 56.8, peak_velocity_ms: 7.55, acceleration_ms2: 3.98, deceleration_ms2: 4.25, asymmetry_index: 11.3, rsi: 1.44, peak_force_n_kg: 31.5, contact_time_ms: 268, hip_rom_deg: 103 },
  { athlete_name: "Tom Bradley",     position: "Defender",   session_date: "2025-06-11", jump_height_cm: 38.5, peak_power_w_kg: 63.8, peak_velocity_ms: 8.10, acceleration_ms2: 4.38, deceleration_ms2: 4.62, asymmetry_index: 4.0, rsi: 1.70, peak_force_n_kg: 35.0, contact_time_ms: 232, hip_rom_deg: 112 },
  { athlete_name: "Oluwaseun Ade",   position: "Defender",   session_date: "2025-06-12", jump_height_cm: 36.5, peak_power_w_kg: 61.5, peak_velocity_ms: 7.82, acceleration_ms2: 4.18, deceleration_ms2: 4.48, asymmetry_index: 7.2, rsi: 1.62, peak_force_n_kg: 33.5, contact_time_ms: 242, hip_rom_deg: 108 },
  { athlete_name: "Henrik Borg",     position: "Defender",   session_date: "2025-06-12", jump_height_cm: 34.8, peak_power_w_kg: 58.9, peak_velocity_ms: 7.68, acceleration_ms2: 4.08, deceleration_ms2: 4.33, asymmetry_index: 8.5, rsi: 1.55, peak_force_n_kg: 32.0, contact_time_ms: 252, hip_rom_deg: 105 },
  { athlete_name: "Fabian Cruz",     position: "Defender",   session_date: "2025-06-12", jump_height_cm: 39.4, peak_power_w_kg: 64.6, peak_velocity_ms: 8.05, acceleration_ms2: 4.40, deceleration_ms2: 4.58, asymmetry_index: 5.2, rsi: 1.73, peak_force_n_kg: 34.8, contact_time_ms: 228, hip_rom_deg: 115 },

  // ── Goalkeepers ───────────────────────────────────────────────────────────
  { athlete_name: "Luis Pareira",    position: "Goalkeeper", session_date: "2025-06-10", jump_height_cm: 48.5, peak_power_w_kg: 72.1, peak_velocity_ms: 7.20, acceleration_ms2: 4.00, deceleration_ms2: 3.85, asymmetry_index: 3.8, rsi: 2.05, peak_force_n_kg: 34.0, contact_time_ms: 195, hip_rom_deg: 122 },
  { athlete_name: "David Kim",       position: "Goalkeeper", session_date: "2025-06-10", jump_height_cm: 46.2, peak_power_w_kg: 69.8, peak_velocity_ms: 7.05, acceleration_ms2: 3.88, deceleration_ms2: 3.72, asymmetry_index: 4.5, rsi: 1.98, peak_force_n_kg: 33.1, contact_time_ms: 201, hip_rom_deg: 118 },
  { athlete_name: "Mo Hassani",      position: "Goalkeeper", session_date: "2025-06-11", jump_height_cm: 44.0, peak_power_w_kg: 67.4, peak_velocity_ms: 7.35, acceleration_ms2: 3.95, deceleration_ms2: 3.78, asymmetry_index: 6.1, rsi: 1.90, peak_force_n_kg: 32.5, contact_time_ms: 208, hip_rom_deg: 120 },
];

// CSV string of the demo data for download
export function generateDemoCSV(): string {
  const headers = [
    "athlete_name", "position", "session_date",
    "jump_height_cm", "peak_power_w_kg", "peak_velocity_ms",
    "acceleration_ms2", "deceleration_ms2", "asymmetry_index",
    "rsi", "peak_force_n_kg", "contact_time_ms", "hip_rom_deg",
  ];
  const rows = DEMO_ATHLETES.map(a =>
    headers.map(h => a[h]).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
