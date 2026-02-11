const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 1. ตั้งค่าการเชื่อมต่อ Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'up_market_v2' 
});

db.connect(err => {
    if (err) {
        console.error('❌ เชื่อมต่อ Database ไม่สำเร็จ:', err);
    } else {
        console.log('✅ เชื่อมต่อ Database สำเร็จ (up_market_v2)');
    }
});

// --- API: ดึงสินค้าทั้งหมด (สำหรับหน้า Home) ---
app.get('/api/products', (req, res) => {
    const sql = `
        SELECT p.*, u.name AS seller_name, u.contact AS contact_info 
        FROM products p 
        LEFT JOIN users u ON p.seller_id = u.user_id 
        ORDER BY p.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- API: ลงขายสินค้า (POST) ---
app.post('/api/products', (req, res) => {
    const { title, price, category, location, description, seller_id, contact, image_url } = req.body;
    const sql = "INSERT INTO products (title, price, category, location, description, seller_id, contact, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, price, category, location, description, seller_id, contact, image_url], (err, result) => {
        if (err) {
            console.error("❌ บันทึกสินค้าไม่สำเร็จ:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// --- API: ดึงรายละเอียดสินค้า 1 ชิ้น ---
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT p.*, u.name AS seller_name, u.role AS seller_role, u.contact AS seller_contact 
        FROM products p 
        LEFT JOIN users u ON p.seller_id = u.user_id 
        WHERE p.id = ?
    `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'ไม่พบสินค้า' });
        res.json(results[0]);
    });
});

// --- API: เข้าสู่ระบบ (Login) ---
app.post('/api/login', (req, res) => {
    const { id, pass } = req.body;
    const sql = "SELECT * FROM users WHERE user_id = ? AND password = ?";
    db.query(sql, [id, pass], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    });
});

// --- API: สมัครสมาชิก ---
app.post('/api/register', (req, res) => {
    const { id, pass, name, role, contact, fac, branch } = req.body;
    const sql = "INSERT INTO users (user_id, password, name, role, contact, faculty, branch) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [id, pass, name, role, contact, fac, branch], (err, result) => {
        if (err) {
            console.error("Register Error:", err);
            return res.status(500).json({ error: 'สมัครไม่สำเร็จ' });
        }
        res.json({ success: true });
    });
});

// --- API: ลบสินค้า ---
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});