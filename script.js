/* ============================================================
   UP MARKET - CORE SYSTEM (V2 Database Connection)
============================================================ */

let currentUser = null;
let products = [];
let reports = [];

// ข้อมูลคณะและสาขา
const upData = {
    "วิทยาศาสตร์สุขภาพ": {
        "คณะแพทยศาสตร์": ["สาขาวิชาแพทยศาสตร์", "สาขาวิชาปฏิบัติการฉุกเฉินการแพทย์ (Paramedic)"],
        "คณะทันตแพทยศาสตร์": ["สาขาวิชาทันตแพทยศาสตร์"],
        "คณะเภสัชศาสตร์": ["สาขาวิชาบริบาลเภสัชกรรม"],
        "คณะพยาบาลศาสตร์": ["สาขาวิชาพยาบาลศาสตร์"],
        "คณะสหเวชศาสตร์": ["สาขาวิชาเทคนิคการแพทย์", "สาขาวิชากายภาพบำบัด"],
        "คณะสาธารณสุขศาสตร์": ["สาขาวิชาอนามัยชุมชน", "สาขาวิชาการส่งเสริมสุขภาพ", "สาขาวิชาอนามัยสิ่งแวดล้อม", "สาขาวิชาอาชีวอนามัยและความปลอดภัย", "สาขาวิชาการแพทย์แผนจีน", "สาขาวิชาการแพทย์แผนไทยประยุกต์"],
        "คณะวิทยาศาสตร์การแพทย์": ["สาขาวิชาจุลชีววิทยา", "สาขาวิชาชีวเคมี", "สาขาวิชาโภชนาการและการกำหนดอาหาร"]
    },
    "วิทยาศาสตร์และเทคโนโลยี": {
        "คณะวิศวกรรมศาสตร์": ["วิศวกรรมโยธา", "วิศวกรรมไฟฟ้า", "วิศวกรรมเครื่องกล", "วิศวกรรมอุตสาหการ"],
        "คณะเทคโนโลยีสารสนเทศและการสื่อสาร": ["วิศวกรรมคอมพิวเตอร์", "วิศวกรรมซอฟต์แวร์", "วิทยาการคอมพิวเตอร์", "เทคโนโลยีสารสนเทศ", "วิทยาการข้อมูลและการประยุกต์", "ภูมิสารสนเทศศาสตร์", "เทคโนโลยีคอมพิวเตอร์กราฟิกและมัลติมีเดีย", "ธุรกิจดิจิทัล"],
        "คณะวิทยาศาสตร์": ["คณิตศาสตร์", "สถิติ", "เคมี", "ชีววิทยา", "ฟิสิกส์", "วิทยาศาสตร์การออกกำลังกายและการกีฬา", "อุตสาหกรรมเคมีและเทคโนโลยีวัสดุ"],
        "คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ": ["เกษตรศาสตร์", "สัตวศาสตร์", "วิทยาศาสตร์และเทคโนโลยีการอาหาร", "ความปลอดภัยทางอาหาร", "การประมง"],
        "คณะพลังงานและสิ่งแวดล้อม": ["การจัดการพลังงานและสิ่งแวดล้อม"],
        "คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์": ["สถาปัตยกรรม", "สถาปัตยกรรมภายใน", "ศิลปะและการออกแบบ", "ดนตรีและนาฏศิลป์"]
    },
    "มนุษยศาสตร์และสังคมศาสตร์": {
        "คณะบริหารธุรกิจและนิเทศศาสตร์": ["การจัดการธุรกิจ", "การบัญชี", "เศรษฐศาสตร์", "การเงินและการลงทุน", "การท่องเที่ยวและการโรงแรม", "การสื่อสารสื่อใหม่", "การจัดการการสื่อสาร", "การตลาดดิจิทัล"],
        "คณะศิลปศาสตร์": ["ภาษาอังกฤษ", "ภาษาไทย", "ภาษาจีน", "ภาษาญี่ปุ่น", "ภาษาฝรั่งเศส"],
        "คณะนิติศาสตร์": ["นิติศาสตร์"],
        "คณะรัฐศาสตร์และสังคมศาสตร์": ["รัฐศาสตร์", "พัฒนาสังคม", "การจัดการนวัตกรรมสาธารณะ"],
        "วิทยาลัยการศึกษา": ["การศึกษา"]
    }
};

// --- INIT SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    // โหลดข้อมูลผู้ใช้จาก Session
    const savedUser = localStorage.getItem('up_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateBadge();
    }

    const pageId = document.body.id;
    if (pageId === 'page-home') fetchProducts(); // ดึงสินค้าจาก MySQL
    if (pageId === 'page-register') { populateFaculty(); toggleRoleField(); }
    if (pageId === 'page-sell') { checkAuth(); loadContactInfo(); }
    if (pageId === 'page-account') { checkAuth(); renderProfile(); }
    if (pageId === 'page-my-products') fetchMyProducts(); 
    if (pageId === 'page-detail') loadProductDetail();
});

// --- AUTH API (ต่อกับ MySQL) ---

// --- API Login ---
// --- แก้ไขฟังก์ชัน handleLogin ใน script.js ---
async function handleLogin() {
    const id = document.getElementById('login-id').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    try {
        // แก้ไข URL เป็น /api/login ให้ตรงกับ Backend
        const response = await fetch('http://localhost:3000/api/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, pass }) // ส่ง id และ password ไปตรวจสอบ
        });
        
        const data = await response.json();
        
        if (data.success) {
            // เก็บข้อมูล User ลงใน LocalStorage
            localStorage.setItem('up_current_user', JSON.stringify(data.user));
            alert('เข้าสู่ระบบสำเร็จ!');
            window.location.href = 'view-home.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('เชื่อมต่อ Server ไม่สำเร็จ (ลองเช็ค node server.js)');
    }
}

// --- API Register ---
async function handleRegister() {
    const role = document.getElementById('reg-role').value;
    const name = document.getElementById('reg-name').value;
    const contact = document.getElementById('reg-contact').value;
    const pass = document.getElementById('reg-pass').value;
    const fac = document.getElementById('reg-fac').value;
    const branch = document.getElementById('reg-branch').value;
    const id = role === 'student' ? document.getElementById('reg-studentid').value : contact;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, pass, name, role, contact, fac, branch })
        });

        const data = await response.json();
        if (data.success) {
            alert('สมัครสมาชิกในระบบ V2 สำเร็จ!');
            window.location.href = 'login-screen.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    }
}

// --- PRODUCTS API ---

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        products = await response.json();
        console.log("ข้อมูลที่ได้รับจาก Server:", products); // เพิ่มบรรทัดนี้เพื่อ Check ข้อมูล
        renderProducts();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function renderProducts() {
    const grid = document.getElementById('home-product-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="window.location.href='view-product-detail.html?id=${p.id}'">
            <img src="${p.image_url || 'https://placehold.co/400'}" class="product-img">
            <div class="product-info">
                <div class="prod-title">${p.title}</div>
                <div class="prod-price">${parseFloat(p.price).toLocaleString()} บาท</div>
                <div class="prod-meta">โดย: ${p.seller_name}</div>
            </div>
        </div>
    `).join('');
}

// --- UI UTILS ---
function handleLogout() {
    localStorage.removeItem('up_current_user');
    window.location.href = 'login-screen.html';
}

function checkAuth() {
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        window.location.href = 'login-screen.html';
    }
}

function populateFaculty() {
    const sel = document.getElementById('reg-fac');
    if(!sel) return;
    sel.innerHTML = '<option value="">-- เลือกคณะ --</option>';
    for(const k in upData) {
        let optgroup = document.createElement('optgroup');
        optgroup.label = k;
        for(const fac in upData[k]) {
            let op = new Option(fac, fac);
            optgroup.appendChild(op);
        }
        sel.appendChild(optgroup);
    }
}

function updateBranches() {
    const fac = document.getElementById('reg-fac').value;
    const branchSel = document.getElementById('reg-branch');
    if(!branchSel) return;
    branchSel.innerHTML = '<option value="">-- เลือกสาขา --</option>';
    for(const group in upData) {
        if(upData[group][fac]) {
            upData[group][fac].forEach(b => {
                let op = new Option(b, b);
                branchSel.appendChild(op);
            });
            break;
        }
    }
}

function selectRole(role, el) {
    document.querySelectorAll('.role-option').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('reg-role').value = role;
    toggleRoleField();
}

function toggleRoleField() {
    const role = document.getElementById('reg-role').value;
    document.getElementById('field-student').style.display = role === 'student' ? 'block' : 'none';
    document.getElementById('field-staff').style.display = role === 'staff' ? 'block' : 'none';
    document.getElementById('field-general').style.display = role === 'general' ? 'block' : 'none';
}

function renderProfile() {
    if(!currentUser) return;
    document.getElementById('acc-name').innerText = currentUser.name;
    document.getElementById('acc-detail').innerText = `${currentUser.role} | ID: ${currentUser.user_id}`;
    document.getElementById('acc-contact').innerText = `ติดต่อ: ${currentUser.contact}`;
}

function updateBadge() {
    const badge = document.getElementById('notif-badge');
    if(badge) badge.style.display = 'none'; // ปิดไว้ก่อนเพราะยังไม่ได้ทำระบบแจ้งเตือนใน MySQL
}
// ฟังก์ชันแสดงตัวอย่างรูปภาพ
function previewSell(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('sell-preview').src = e.target.result;
            document.getElementById('sell-preview').style.display = 'block';
            document.getElementById('sell-placeholder').style.display = 'none';
        }
        reader.readAsDataURL(input.files[0]);
    }
}
// ฟังก์ชันส่งข้อมูลสินค้าไปยัง Backend
async function submitProduct() {
    if (!currentUser) return alert("กรุณาเข้าสู่ระบบก่อนลงขาย");

    const productData = {
        title: document.getElementById('sell-title').value,
        price: document.getElementById('sell-price').value,
        category: document.getElementById('sell-cat').value,
        location: document.getElementById('sell-meeting').value,
        description: document.getElementById('sell-desc').value,
        contact: document.getElementById('sell-contact').value,
        seller_id: currentUser.user_id,
        image_url: document.getElementById('sell-preview').src
    };

    try {
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const data = await response.json();
        if (data.success) {
            alert('ลงขายสำเร็จ!');
            window.location.href = 'view-home.html';
        }
    } catch (error) {
        alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    }
}

// --- เพิ่มเข้าไปใน script.js ---
function loadContactInfo() {
    if (currentUser) {
        const contactField = document.getElementById('sell-contact');
        if (contactField) contactField.value = currentUser.contact;
    }
}

async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const p = await response.json();
        
        if (p.error) return alert(p.error);

        // --- แก้ไข ID ตรงนี้ให้ตรงกับ view-product-detail.html ---
        document.getElementById('d-title').innerText = p.title; // เปลี่ยนจาก det-title
        document.getElementById('d-price').innerText = `${parseFloat(p.price).toLocaleString()} บาท`; // เปลี่ยนจาก det-price
        document.getElementById('d-desc').innerText = p.description; // เปลี่ยนจาก det-desc
        document.getElementById('d-img').src = p.image_url || 'https://placehold.co/400'; // เปลี่ยนจาก det-img
        document.getElementById('d-cat').innerText = p.category; // เพิ่มการแสดงหมวดหมู่
        document.getElementById('d-meeting').innerText = p.location; // เพิ่มจุดนัดรับ
        
        // ส่วนข้อมูลผู้ขาย
        document.getElementById('d-seller-name').innerText = `${p.seller_name} (${p.seller_role})`;
        document.getElementById('d-contact').innerText = p.seller_contact;
        
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถโหลดข้อมูลสินค้าได้');
    }
}

async function fetchMyProducts() {
    if (!currentUser) return;
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const allProducts = await response.json();
        
        // กรองเฉพาะสินค้าที่เป็นของเรา
        const myProducts = allProducts.filter(p => p.seller_id === currentUser.user_id);
        renderMyProducts(myProducts);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function renderMyProducts(list) {
    const container = document.getElementById('my-products-list');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">คุณยังไม่มีสินค้าที่ลงขาย</p>';
        return;
    }

    container.innerHTML = list.map(p => `
        <div class="product-item-horizontal">
            <img src="${p.image_url || 'https://placehold.co/100'}">
            <div class="info">
                <h4>${p.title}</h4>
                <p>${parseFloat(p.price).toLocaleString()} บาท</p>
            </div>
            <button class="btn-delete" onclick="deleteProduct(${p.id})">ลบ</button>
        </div>
    `).join('');
}

async function deleteProduct(id) {
    if (!confirm('ยืนยันที่จะลบสินค้านี้ใช่หรือไม่?')) return;
    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            alert('ลบสินค้าเรียบร้อย');
            fetchMyProducts(); // โหลดรายการใหม่
        }
    } catch (error) {
        alert('ลบไม่สำเร็จ');
    }
}