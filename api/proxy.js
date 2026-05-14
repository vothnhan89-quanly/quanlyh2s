// api/proxy.js
export default async function handler(req, res) {
  // Chỉ cho phép GET và POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Địa chỉ Apps Script của bạn (thay bằng URL thật)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNsTFOYI5mDlMK-jbIwxZj1UdE5p9M5WFFBSUuNbyVbihZfELxnq8Jl92gW_WS62G7oA/exec';

  let url = APPS_SCRIPT_URL;
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (req.method === 'GET') {
    // Chuyển toàn bộ query params từ client sang Apps Script
    const params = new URLSearchParams(req.query);
    url += `?${params.toString()}`;
  } else if (req.method === 'POST') {
    options.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: 'Invalid JSON from Apps Script', raw: text };
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}