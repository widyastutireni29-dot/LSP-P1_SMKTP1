/**
 * This service defines the data structure for Google Sheets integration.
 * To use this in production:
 * 1. Create a Google Sheet with the headers listed below.
 * 2. Use a service like SheetDB, Stein, or a custom Google Apps Script to expose the sheet as an API.
 * 3. Set the API URL in your .env file as VITE_GOOGLE_SHEET_API_URL.
 */

export interface APL01Data {
  // Personal Data
  namaLengkap: string;
  nisn: string;
  kelasJurusan: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  email: string;
  
  // Document URLs (Stored as Drive/Cloud Storage links in the sheet)
  urlKartuPelajar: string;
  urlSertifikatMagang: string;
  urlRapot: string;
  
  // Metadata
  timestamp: string;
  status: 'Pending' | 'Valid' | 'Revisi';
}

/**
 * Expected Google Sheet Headers (Valid Structure):
 * 
 * Timestamp | Nama Lengkap | NISN | Kelas Jurusan | Tempat Lahir | Tanggal Lahir | Alamat | No HP | Email | URL Kartu Pelajar | URL Sertifikat Magang | URL Rapot | Status
 * 
 */

export const submitToGoogleSheets = async (data: Partial<APL01Data>) => {
  const meta = import.meta as any;
  const API_URL = meta.env.VITE_GOOGLE_SHEET_API_URL;

  if (!API_URL) {
    console.warn("VITE_GOOGLE_SHEET_API_URL is not set. Simulation mode active.");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: "Data submitted to simulator successfully." };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      })
    });

    if (!response.ok) throw new Error("Failed to connect to Google Sheets API");
    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    throw error;
  }
};
