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

export const saveFinalSubmission = async (studentName: string, scheme: string, apl01Link: string, apl02Link: string) => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_SUBMISSION_URL') || getEnv('VITE_GOOGLE_SHEET_API_URL') || getEnv('VITE_GOOGLE_SHEET');

  if (!API_URL) {
    console.warn("VITE_GOOGLE_SHEET_SUBMISSION_URL missing. Simulated saving.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        Name: studentName, 
        Scheme: scheme, 
        APL01_Link: apl01Link,
        APL02_Link: apl02Link,
        Date: new Date().toLocaleDateString('id-ID'),
        Status: 'Pending',
        Timestamp: new Date().toISOString()
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
};

export const getSubmissionStatus = async (studentName: string) => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_SUBMISSION_URL') || getEnv('VITE_GOOGLE_SHEET_API_URL') || getEnv('VITE_GOOGLE_SHEET');

  if (!API_URL) {
    // Simulasi data jika tidak ada API
    return { success: true, status: 'Pending' };
  }

  try {
    const response = await fetch(`${API_URL}/search?Name=${encodeURIComponent(studentName)}`);
    if (!response.ok) return { success: false, status: 'Unknown' };
    
    const submissions = await response.json();
    if (Array.isArray(submissions) && submissions.length > 0) {
      // Ambil yang paling baru (asumsi baris terakhir atau sorting by timestamp)
      const lastSubmission = submissions[submissions.length - 1];
      return { success: true, status: lastSubmission.Status || 'Pending' };
    }
    return { success: false, status: 'Belum Ada' };
  } catch (error) {
    console.error("Fetch status error:", error);
    return { success: false, status: 'Error' };
  }
};

export const verifyLogin = async (id: string, pass: string, role: 'student' | 'admin') => {
  const AUTH_URL = getEnv('VITE_GOOGLE_SHEET_AUTH_URL') || getEnv('VITE_GOOGLE_SHEET');

  // Sync dengan User Screenshot: Role "Siswa" atau "Admin"
  const sheetRole = role === 'student' ? 'Siswa' : 'Admin';

  // FALLBACK: Kredensial Demo (Simulasi jika GSheet belum terkoneksi)
  const DEMO_USERS = [
    { Credential: '1234567890', Password: 'password', Role: 'Siswa', Name: 'Budi Santoso' },
    { Credential: 'siswa2@lsp.sch.id', Password: 'password', Role: 'Siswa', Name: 'Siti Aminah' },
    { Credential: 'siswa3@lsp.sch.id', Password: 'password', Role: 'Siswa', Name: 'Andi Wijaya' },
    { Credential: 'siswa4@lsp.sch.id', Password: 'password', Role: 'Siswa', Name: 'Rina Putri' },
    { Credential: 'siswa5@lsp.sch.id', Password: 'password', Role: 'Siswa', Name: 'Fajar Ramadhan' },
    { Credential: 'admin@lsp.sch.id', Password: 'password', Role: 'Admin', Name: 'Admin Utama LSP' }
  ];

  // Gunakan Fallback jika URL masih default atau kosong
  if (!AUTH_URL || AUTH_URL.includes('your-api-url') || AUTH_URL === '') {
    await new Promise(resolve => setTimeout(resolve, 800));
    const found = DEMO_USERS.find(u => 
      u.Credential.toLowerCase() === id.toLowerCase() && 
      u.Password === pass && 
      u.Role === sheetRole
    );

    if (found) return { 
      success: true, 
      user: { name: found.Name, role: role } 
    };
    throw new Error("Akun tidak ditemukan. Gunakan kredensial demo atau hubungi admin.");
  }

  try {
    // API akan mencari secara otomatis ke SELURUH baris di Google Sheet Anda
    // Berapapun jumlah siswanya (10, 100, atau 1000), prosesnya tetap cepat.
    const response = await fetch(`${AUTH_URL}/search?Credential=${id}&Password=${pass}&Role=${sheetRole}`);
    
    if (!response.ok) throw new Error("Gagal menghubungi Database Google Sheet.");
    
    const users = await response.json();
    
    if (Array.isArray(users) && users.length > 0) {
      // Mengambil data pertama yang cocok
      return { 
        success: true, 
        user: { 
          name: users[0].Name || users[0].name || "User", 
          role: role 
        } 
      };
    }
    throw new Error("NISN/Email atau Password salah.");
  } catch (error: any) {
    throw new Error(error.message || "Terjadi kesalahan koneksi database.");
  }
};

// --- CRUD FOR USERS ---

export const getAllUsers = async () => {
  const AUTH_URL = getEnv('VITE_GOOGLE_SHEET_AUTH_URL') || getEnv('VITE_GOOGLE_SHEET');
  if (!AUTH_URL) return [];
  try {
    const response = await fetch(AUTH_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const addUser = async (userData: any) => {
  const AUTH_URL = getEnv('VITE_GOOGLE_SHEET_AUTH_URL') || getEnv('VITE_GOOGLE_SHEET');
  if (!AUTH_URL) return { success: true }; // Simulator
  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// --- CRUD FOR STUDENT DATA (APL-01) ---

export const getAllStudents = async () => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_API_URL') || getEnv('VITE_GOOGLE_SHEET');
  if (!API_URL) return [];
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

// --- SUBMISSION MANAGEMENT ---

export const getAllSubmissions = async () => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_SUBMISSION_URL') || getEnv('VITE_GOOGLE_SHEET');
  if (!API_URL) return [];
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
};

export const updateSubmissionStatus = async (id: string, status: string) => {
  const API_URL = getEnv('VITE_GOOGLE_SHEET_SUBMISSION_URL') || getEnv('VITE_GOOGLE_SHEET');
  if (!API_URL) return { success: true };
  try {
    const response = await fetch(`${API_URL}/Name/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Status: status })
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating submission:", error);
    throw error;
  }
};
