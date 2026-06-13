# ⚙️ ระบบเช็คชื่อ ม.6/1 เตรียมวิศวะ

โรงเรียนสาธิตพหลโยธินรามินทรภักดี (เทศบาลเมืองราชบุรี)  
ภาคเรียนที่ 1 ปีการศึกษา 2569 · นักเรียน 36 คน (ชาย 21 หญิง 15)

---

## ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|------|---------|
| `index-appscript.html` | หน้าเว็บหลัก — copy ไปวางใน Apps Script ไฟล์ `index` |
| `google-apps-script.gs` | โค้ด backend — copy ไปวางใน Apps Script ไฟล์ `Code.gs` |
| `เช็คชื่อ-เตรียมวิศวะ.html` | เวอร์ชันเปิดบน Mac เท่านั้น (ไม่ sync) |

---

## การติดตั้ง (ตั้งต้นใหม่)

### 1. สร้าง Google Sheets

ไปที่ [sheets.google.com](https://sheets.google.com) → สร้าง Spreadsheet ใหม่

### 2. เปิด Apps Script

**Extensions → Apps Script**

### 3. ตั้งค่าไฟล์ Code.gs

- ลบโค้ดเดิมทิ้ง
- copy เนื้อหาจาก `google-apps-script.gs` → paste → **Cmd+S**

### 4. สร้างไฟล์ index.html

- กด **+** (New File) → **HTML** → ตั้งชื่อ **`index`** (ไม่ต้องมี .html)
- ลบโค้ดเดิมทิ้ง
- copy เนื้อหาจาก `index-appscript.html` → paste → **Cmd+S**

### 5. Deploy

1. กด **Deploy → New deployment**
2. ตั้งค่า:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← สำคัญมาก (ไม่ใช่ "Anyone with Google account")
3. กด **Deploy** → copy URL

### 6. เปิดใช้งาน

เปิด URL ที่ได้จาก Deploy ในบราวเซอร์ปกติ (ไม่ใช่ incognito)

---

## การอัปเดตโค้ด (ครั้งต่อไป)

ทุกครั้งที่แก้ `index-appscript.html` หรือ `google-apps-script.gs`:

1. copy โค้ดใหม่ → วางใน Apps Script → **Cmd+S**
2. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**

> ⚠️ ถ้าไม่ Deploy new version เว็บจะยังเป็น version เก่าอยู่

---

## ฟีเจอร์

- **เช็คชื่อ** — เลือกวันที่ → กดสถานะรายคน (มาเรียน / มาสาย / ลา / ขาด) → บันทึก
- **หน้าค้าง** — เปิดวันที่เดิมซ้ำ ข้อมูลที่บันทึกไว้โหลดมาให้อัตโนมัติ ไม่ต้องเริ่มใหม่
- **รหัสผ่าน** — popup ยืนยันก่อนบันทึกทุกครั้ง (รหัส: `newtron05`)
- **ประวัติ** — ดูย้อนหลังรายวัน กดเพื่อดูรายละเอียด
- **สถิติ** — ตารางสรุปรายบุคคล พร้อม % เข้าเรียน
- **รูปนักเรียน** — กด + หน้าชื่อเพื่ออัปโหลด บีบอัดอัตโนมัติ 80×80px
- **Export รายงาน** — สร้าง HTML รายวันส่งผู้ปกครองผ่าน LINE

---

## Architecture

```
Browser (Safari / Chrome)
  ├── localStorage (cache, prefix: att6_1_)
  │     ├── att6_1_YYYY-MM-DD  → ข้อมูลเช็คชื่อรายวัน
  │     └── att6_1_ts_YYYY-MM-DD → timestamp บันทึกล่าสุด
  │
  └── Google Apps Script Web App
        ├── Sheets "Attendance"  → ข้อมูลหลัก (date, json, timestamp)
        └── Sheets "Photos"      → รูปนักเรียน (base64)
```

**Sync flow:**
- เปิดหน้า → โหลด localStorage ก่อน (เร็ว) → sync จาก Sheets (ช้ากว่า แต่แม่นยำ)
- บันทึก → เขียน localStorage + ส่ง Sheets พร้อมกัน
- ถ้า Sheets ตอบ "💾 บันทึกสำเร็จ!" → ข้อมูลปลอดภัย เปิดจากเครื่องอื่นได้
- ถ้า Sheets ไม่ตอบ "⚠️ บันทึกในเครื่องแล้ว" → ข้อมูลอยู่แค่เครื่องนั้น

---

## Troubleshooting

### ❌ กดบันทึกแล้ว Sheets ว่าง / มือถือเห็นไม่ได้

**สาเหตุ:** `pushToSheets` ส่งไม่สำเร็จ

ตรวจสอบ:
1. ดู toast หลังบันทึก — ต้องขึ้น **"💾 บันทึกสำเร็จ!"** ไม่ใช่ "⚠️"
2. ตรวจ Deploy settings: Who has access ต้องเป็น **Anyone**
3. Deploy **New version** ทุกครั้งที่แก้โค้ด (แค่ Save ไม่พอ)

---

### ❌ เปิดใหม่แล้วข้อมูลหาย

**สาเหตุ:** ใช้ incognito mode (localStorage ล้างทุกครั้งที่ปิด window)

แก้: ใช้ **บราวเซอร์ปกติ** เสมอ (ไม่ใช่ incognito)

ถ้าข้อมูลถึง Sheets แล้ว → เปิดบราวเซอร์ใหม่ → กด 🔄 ซิงค์ → ข้อมูลกลับมา

---

### ❌ Safari iPhone เปิดไม่ได้ "ไม่สามารถเปิดไฟล์ได้"

**สาเหตุ:** URL มี `/u/1/` → Safari ใช้ Google account ที่สอง

แก้: ล้าง cookies Safari → login ด้วย `damwat.new@gmail.com` ใหม่

---

### ❌ เปิดจาก LINE แล้วหน้าขาว

**สาเหตุ:** LINE browser มีข้อจำกัด

แก้: กด **···** → **Open in Safari**

---

### ❌ ประวัติไม่แสดงข้อมูล (หน้าประวัติว่าง)

**สาเหตุ:** sync ยังไม่เสร็จตอนเปิดแท็บประวัติ

แก้: กด 🔄 ซิงค์ก่อน แล้วสลับกลับมาแท็บประวัติ

---

## Bug ที่แก้แล้ว (10 มิ.ย. 2569)

| Bug | สาเหตุ | การแก้ |
|-----|--------|--------|
| กดบันทึกแล้วไม่บันทึก | `confirmPw()` ล้าง `_pwCallback` ก่อนเรียก callback | เก็บ reference ไว้ก่อน `hidePwModal()` |
| เปิดหน้าใหม่ form ว่าง | `init()` ไม่ได้โหลด localStorage ก่อน sync | เพิ่ม `loadCheckDate()` ก่อน `syncNow()` |
| sync ทับข้อมูลที่กำลังกรอก | `syncNow()` เรียก `loadCheckDate()` ทุกครั้ง | ตรวจ `hasCurrentChanges` ก่อน reload |
| ประวัติไม่ refresh หลัง sync | `renderHistory()` ไม่ถูกเรียกหลัง sync | เพิ่ม `renderHistory()` ใน `syncNow()` |
| timestamp key ปนกับ date key | ไม่มี filter ใน `getAllDatesLocal()` | เพิ่ม regex `/^\d{4}-\d{2}-\d{2}$/` |

---

## รหัสผ่าน

`newtron05` — แก้ได้ที่บรรทัด `const SAVE_PASSWORD = 'newtron05';` ในไฟล์ `index-appscript.html`
