// api/proxy.js
export default async function handler(req, res) {
    // Chỉ cho phép GET và POST
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // Thay URL dưới đây bằng URL Apps Script của bạn
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNsTFOYI5mDlMK-jbIwxZj1UdE5p9M5WFFBSUuNbyVbihZfELxnq8Jl92gW_WS62G7oA/exec?action=getDonVi&apiKey=123456';
  
    let url = APPS_SCRIPT_URL;
    let fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };
  
    if (req.method === 'GET') {
      // Chuyển toàn bộ query parameters
      const params = new URLSearchParams(req.query);
      url += `?${params.toString()}`;
    } else if (req.method === 'POST') {
      fetchOptions.body = JSON.stringify(req.body);
    }
  
    try {
      const response = await fetch(url, fetchOptions);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        data = { error: 'Invalid JSON from Apps Script', raw: text };
      }
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.toString() });
    }
  }