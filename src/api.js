const API_URL = import.meta.env.VITE_API_URL;

export const apiRequest = async (payload) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      // Menggunakan text/plain untuk bypass CORS preflight Google Apps Script
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};