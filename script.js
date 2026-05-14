// ==================== CẤU HÌNH ====================
const API_URL = '/api/proxy';  // Đây là endpoint proxy trên Vercel
const CORRECT_API_KEY = '123456'; // ⚠️ PHẢI GIỐNG API_KEY TRONG APPS SCRIPT

let API_KEY = localStorage.getItem('api_key') || '';

// Hàm gọi API qua proxy (không còn lỗi CORS)
async function callApi(action, method = 'GET', payload = null) {
  let url, options = { method, headers: { 'Content-Type': 'application/json' } };
  
  if (method === 'GET') {
    url = `${API_URL}?action=${action}&apiKey=${API_KEY}`;
  } else {
    url = API_URL;
    options.body = JSON.stringify({ action, apiKey: API_KEY, ...payload });
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ========== LOAD & RENDER DỮ LIỆU ==========
let donViData = [], lienHeData = [], donHangData = [], sanPhamData = [];

async function loadDonVi() { donViData = await callApi('getDonVi'); renderDonVi(); }
async function loadLienHe() { lienHeData = await callApi('getLienHe'); renderLienHe(); }
async function loadDonHang() { donHangData = await callApi('getDonHang'); renderDonHang(); }
async function loadSanPham() { sanPhamData = await callApi('getSanPham'); renderSanPham(); }

function renderDonVi() {
  const tbody = document.querySelector('#donvi-table tbody');
  tbody.innerHTML = donViData.map(dv => `
    <tr>
      <td>${dv.ID_don_vi || ''}</td>
      <td>${dv.Ten_don_vi || ''}</td>
      <td>${dv.Tinh || ''}</td>
      <td>${dv.Huyen || ''}</td>
      <td><button class="small edit-donvi" data-id="${dv.ID_don_vi}">Sửa</button> <button class="small danger delete-donvi" data-id="${dv.ID_don_vi}">Xóa</button></td>
    </tr>
  `).join('');
}

function renderLienHe() {
  const tbody = document.querySelector('#lienhe-table tbody');
  tbody.innerHTML = lienHeData.map(lh => `
    <tr>
      <td>${lh.ID_lien_he || ''}</td>
      <td>${lh.ten_don_vi || ''}</td>
      <td>${lh.Ten_khach_hang || ''}</td>
      <td>${lh['DT di dong'] || ''}</td>
      <td><button class="small edit-lienhe" data-id="${lh.ID_lien_he}">Sửa</button> <button class="small danger delete-lienhe" data-id="${lh.ID_lien_he}">Xóa</button></td>
    </tr>
  `).join('');
}

function renderDonHang() {
  const tbody = document.querySelector('#donhang-table tbody');
  tbody.innerHTML = donHangData.map(dh => `
    <tr>
      <td>${dh.ID_Hop_dong_ban || ''}</td>
      <td>${dh.so_hop_dong || ''}</td>
      <td>${dh.Don_vi_quan_ly || ''}</td>
      <td>${dh.Tong || ''}</td>
      <td><button class="small edit-donhang" data-id="${dh.ID_Hop_dong_ban}">Sửa</button> <button class="small danger delete-donhang" data-id="${dh.ID_Hop_dong_ban}">Xóa</button></td>
    </tr>
  `).join('');
}

function renderSanPham() {
  const tbody = document.querySelector('#sanpham-table tbody');
  tbody.innerHTML = sanPhamData.map(sp => `
    <tr>
      <td>${sp.ID_SP || ''}</td>
      <td>${sp.Ten_san_pham || ''}</td>
      <td>${sp.Model || ''}</td>
      <td>${sp.Don_gia || ''}</td>
      <td><button class="small edit-sanpham" data-id="${sp.ID_SP}">Sửa</button> <button class="small danger delete-sanpham" data-id="${sp.ID_SP}">Xóa</button></td>
    </tr>
  `).join('');
}

// ========== MODAL THÊM/SỬA ==========
let currentTable = '', currentId = null;

function openForm(table, id = null) {
  currentTable = table;
  currentId = id;
  const isEdit = !!id;
  let fields = [], data = null;
  if (table === 'donvi') {
    fields = ['Ten_don_vi','Tinh','Huyen','Phan_loai','phan_loai_chi_tiet','Linh_vuc','Ong/ba','dai_dien','Chuc_vu','Dia_chi','Dien_thoai','tai_khoan_don_vi','MST'];
    if (isEdit) data = donViData.find(d => d.ID_don_vi == id);
  } else if (table === 'lienhe') {
    fields = ['ten_don_vi','PM','Ten_khach_hang','DT di dong','EMAIL','Dia_chi','Gioi_tinh','Chuc_vu','Ghi chú','ID_don_vi'];
    if (isEdit) data = lienHeData.find(l => l.ID_lien_he == id);
  } else if (table === 'donhang') {
    fields = ['so_hop_dong','Nam_TH','Don_vi_quan_ly','Noi_dung_hop_dong','Tong','Phan_loai','Ngay_bat_dau','ngay_ket_thuc','CB_kinh_doanh','LINK','Huyen','Tinh','PL','TAG','Ngay_cap_nhat','ID_du_an','ID_don_vi'];
    if (isEdit) data = donHangData.find(d => d.ID_Hop_dong_ban == id);
  } else if (table === 'sanpham') {
    fields = ['Ten_san_pham','Model','Phan_nhom','DVT','Bao_hanh','Xuat_xu','SL_ban','Don_gia','Thanh_tien','ID_hop_dong_ban','ID_du_an','ID_bao_gia','Hinh_anh','Chi_tiet','Link','Datasheet','Manual','Trangthai','Ghi_chu'];
    if (isEdit) data = sanPhamData.find(s => s.ID_SP == id);
  }
  const formHtml = fields.map(f => `<label>${f}</label><input type="text" name="${f}" value="${data ? (data[f] || '') : ''}">`).join('');
  document.getElementById('modal-form').innerHTML = formHtml;
  document.getElementById('modal-title').innerText = isEdit ? `Sửa ${table}` : `Thêm ${table}`;
  document.getElementById('modal').style.display = 'flex';
}

document.getElementById('modal-save').onclick = async () => {
  const inputs = document.querySelectorAll('#modal-form input');
  const newData = {};
  inputs.forEach(inp => { newData[inp.name] = inp.value; });
  let action = '';
  if (currentTable === 'donvi') action = currentId ? 'updateDonVi' : 'addDonVi';
  else if (currentTable === 'lienhe') action = currentId ? 'updateLienHe' : 'addLienHe';
  else if (currentTable === 'donhang') action = currentId ? 'updateDonHang' : 'addDonHang';
  else if (currentTable === 'sanpham') action = currentId ? 'updateSanPham' : 'addSanPham';
  await callApi(action, 'POST', { id: currentId, data: newData });
  document.getElementById('modal').style.display = 'none';
  await Promise.all([loadDonVi(), loadLienHe(), loadDonHang(), loadSanPham()]);
};

// ========== SỰ KIỆN XÓA, SỬA ==========
document.body.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-donvi')) {
    if (confirm('Xóa đơn vị này?')) await callApi('deleteDonVi', 'POST', { id: e.target.dataset.id });
    loadDonVi();
  }
  if (e.target.classList.contains('delete-lienhe')) {
    if (confirm('Xóa liên hệ này?')) await callApi('deleteLienHe', 'POST', { id: e.target.dataset.id });
    loadLienHe();
  }
  if (e.target.classList.contains('delete-donhang')) {
    if (confirm('Xóa đơn hàng này?')) await callApi('deleteDonHang', 'POST', { id: e.target.dataset.id });
    loadDonHang();
  }
  if (e.target.classList.contains('delete-sanpham')) {
    if (confirm('Xóa sản phẩm này?')) await callApi('deleteSanPham', 'POST', { id: e.target.dataset.id });
    loadSanPham();
  }
  if (e.target.classList.contains('edit-donvi')) openForm('donvi', e.target.dataset.id);
  if (e.target.classList.contains('edit-lienhe')) openForm('lienhe', e.target.dataset.id);
  if (e.target.classList.contains('edit-donhang')) openForm('donhang', e.target.dataset.id);
  if (e.target.classList.contains('edit-sanpham')) openForm('sanpham', e.target.dataset.id);
});

// Nút thêm
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.onclick = () => {
    const parent = btn.closest('.tab-content');
    if (parent.id === 'donvi') openForm('donvi');
    else if (parent.id === 'lienhe') openForm('lienhe');
    else if (parent.id === 'donhang') openForm('donhang');
    else if (parent.id === 'sanpham') openForm('sanpham');
  };
});

// Đăng nhập
document.getElementById('loginBtn').onclick = () => {
  const key = document.getElementById('apiKeyInput').value;
  if (key === CORRECT_API_KEY) {
    API_KEY = key;
    localStorage.setItem('api_key', key);
    document.getElementById('login-panel').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    loadDonVi(); loadLienHe(); loadDonHang(); loadSanPham();
  } else {
    alert('Sai mã PIN!');
  }
};

// Chuyển tab
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// Tự động đăng nhập nếu đã có key
if (API_KEY) {
  document.getElementById('login-panel').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  loadDonVi(); loadLienHe(); loadDonHang(); loadSanPham();
} else {
  document.getElementById('login-panel').style.display = 'flex';
}

// Đóng modal
document.querySelector('.close').onclick = () => document.getElementById('modal').style.display = 'none';
window.onclick = (e) => { if (e.target === document.getElementById('modal')) document.getElementById('modal').style.display = 'none'; };