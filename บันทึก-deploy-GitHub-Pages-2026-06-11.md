# บันทึก: เอาเว็บเช็คชื่อขึ้น GitHub Pages (11 มิ.ย. 2569)

## ผลลัพธ์
เว็บเช็คชื่อใช้งานได้แล้วบน GitHub Pages — เปิดเต็มจอ ฟิตเอง เลื่อนปกติ (ไม่ติดกรอบ iframe เหมือนถ้าฝังใน Google Sites)

- **ลิงก์เว็บ:** https://kunewnew.github.io/checkin/
- **GitHub repo:** https://github.com/kunewnew/checkin (Public)
- **บัญชี GitHub:** kunewnew

## ทำไมใช้ได้กับ GitHub Pages
เว็บเรียก Apps Script ด้วย GET ทั้งหมด (ไม่มี POST) → ดึงข้อมูลข้ามโดเมนได้โดยไม่ติด CORS
GitHub Pages โฮสต์เฉพาะไฟล์นิ่ง (HTML) ส่วนข้อมูลยังบันทึกผ่าน Apps Script + Google Sheet เหมือนเดิมทุกอย่าง

## ไฟล์ที่ใช้
- `github-pages/index.html` — เวอร์ชัน GitHub: แก้จาก `index-appscript.html` โดยเปลี่ยน `const scriptUrl = '<?= scriptUrl ?>'` (template tag) เป็น URL Apps Script ตรงๆ (บรรทัด 632)
- scriptUrl ที่ฝังไว้: `https://script.google.com/macros/s/AKfycbx1yUYxuSgF2xsOZF872ohwjIvD56NQwbZ4BXizSG-dm00Rypu6nVO_YwE-BZJ2F6X4/exec`

## ปัญหาที่เจอระหว่าง setup (และวิธีแก้)
1. **404 File not found** — ตอนอัปไฟล์ ชื่อไฟล์เป็น `index` (ขาด `.html`) → แก้โดยเข้าไฟล์ → ✏️ → เปลี่ยนชื่อเป็น `index.html` → Commit
2. **กลัวเสียเงิน** — ปุ่ม "Start free for 30 days" ในหน้า Pages เป็นของ GitHub Enterprise (Pages แบบ private) ไม่เกี่ยว; Pages แบบ Public ฟรี 100%

## เวลาแก้เว็บในอนาคต
1. แก้ไฟล์ `index.html`
2. ไป repo → Add file → Upload files → ลากไฟล์ใหม่ทับ → Commit
3. รอ 1–2 นาที (ดูที่ Deployments) ลิงก์เดิมไม่เปลี่ยน
4. ถ้า deploy Apps Script ใหม่จน URL เปลี่ยน → ต้องแก้บรรทัด 632 ในไฟล์ index.html แล้วอัปใหม่
5. Apps Script ต้องคง "Who has access: Anyone" เสมอ ไม่งั้นข้อมูลไม่โหลด
