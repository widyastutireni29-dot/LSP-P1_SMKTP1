/**
 * GOOGLE SHEETS INTEGRATION BLUEPRINT
 * 
 * Recommended Setup:
 * 1. Create ONE Google Sheet named "LSP_Database".
 * 2. Create Two Tabs (Sheets) inside: 
 *    - Tab Name: "Submissions" (for Form APL01 data)
 *    - Tab Name: "Users" (for Authentication data)
 * 
 * 3. Use a service like SheetDB (sheetdb.io) or Stein to generate API URLs for each tab.
 * 4. Add the URLs to your App Settings as Environment Variables.
 */

export interface APL01Data {
  namaLengkap: string;
  nisn: string;
  kelasJurusan: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  email: string;
  urlKartuPelajar: string;
  urlSertifikatMagang: string;
  urlRapot: string;
  timestamp: string;
  status: 'Pending' | 'Valid' | 'Revisi';
}

const getEnv = (key: string): string => {
  try {
    const meta = import.meta as any;
    return meta?.env?.[key] || '';
  } catch (e) {
    return '';
  }
};

export const submitToGoogleSheets = async (data: Partial<APL01Data>) => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_API_URL') || getEnv('VITE_GOOGLE_SHEET');

  if (!API_URL) {
    console.warn("VITE_GOOGLE_SHEET missing. Data saved to SIMULATOR.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString(), status: 'Pending' })
    });
    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
};

export const verifyLogin = async (id: string, pass: string, role: 'student' | 'admin') => {
  const AUTH_URL = getEnv('VITE_GOOGLE_SHEET_AUTH_URL') || getEnv('VITE_GOOGLE_SHEET');

  // Sync dengan User Screenshot: Role "Siswa" atau "Admin"
  const sheetRole = role === 'student' ? 'Siswa' : 'Admin';

  // FALLBACK: Kredensial Demo sesuai Screenshot User
  const DEMO_USERS = [
    { Credential: '1234567890', Password: 'password', Role: 'Siswa', Name: 'Siswa' },
    { Credential: 'admin@lsp.sch.id', Password: 'password', Role: 'Admin', Name: 'Admin' }
  ];

  if (!AUTH_URL) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const found = DEMO_USERS.find(u => 
      u.Credential === id && 
      u.Password === pass && 
      u.Role === sheetRole
    );

    if (found) return { 
      success: true, 
      user: { name: found.Name, role: role } 
    };
    throw new Error("GSheet API belum diset. Gunakan kredensial demo.");
  }

  try {
    // Mencari berdasarkan kolom di GSheet (Credential, Password, Role)
    const response = await fetch(`${AUTH_URL}/search?Credential=${id}&Password=${pass}&Role=${sheetRole}`);
    const users = await response.json();
    
    if (users && users.length > 0) {
      return { success: true, user: { name: users[0].Name || users[0].name, role: role } };
    }
    throw new Error("Data tidak ditemukan di Google Sheet.");
  } catch (error) {
    throw error;
  }
};
