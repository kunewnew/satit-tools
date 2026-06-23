// ============================================================
//  Google Apps Script — ระบบบันทึกบัญชีเงินห้องเรียน ม.6/1 โปร่งใส
//
//  วิธีติดตั้ง:
//  1. เปิด Google Sheets ใหม่ → Extensions > Apps Script
//  2. ในหน้า Apps Script ลบโค้ดใน Code.gs เดิมทิ้ง แล้ว copy โค้ดด้านล่างนี้วางทั้งหมด
//  3. กดปุ่ม Save (ปุ่มแผ่นดิสก์)
//  4. กด Deploy > New deployment
//     - Type: Web app
//     - Description: ClassFund API ม.6/1
//     - Execute as: Me (บัญชี Google ของคุณครู)
//     - Who has access: Anyone (เพื่อให้นักเรียนทุกคนดูยอดเงินและเหรัญญิกบันทึกผ่านเว็บได้)
//  5. กด Deploy → ให้สิทธิ์การเข้าถึงบัญชี (Authorize Access)
//  6. Copy "Web app URL" ที่ได้ (เช่น https://script.google.com/macros/s/.../exec)
//  7. นำ URL นั้นไปวางในช่อง "Google Apps Script Web App URL" ในหน้าตั้งค่าเว็บเก็บเงินห้อง
// ============================================================

// Helper: return JSON response with CORS support
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: get or create a sheet in the Spreadsheet
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Main entry point for GET requests (Handles all API actions to avoid CORS preflight errors)
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e.parameter && e.parameter.action) || 'get_data';
    
    // --- 1. GET ALL DATA ---
    if (action === 'get_data') {
      const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
      const transSheet = getOrCreateSheet(ss, "Transactions", [
        "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
      ]);
      const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);

      // Read Configuration
      const configRows = configSheet.getDataRange().getValues();
      const config = {
        goalPerPerson: 200,
        teacherName: "ครูนิวตรอน",
        currentCollectorId: "",
        promptpayId: "091-234-5678",
        promptpayName: "",
        collectorPassword: "1234",
        teacherPassword: "2301",
        appsScriptUrl: ""
      };
      
      for (let i = 1; i < configRows.length; i++) {
        const param = String(configRows[i][0]).trim();
        const value = String(configRows[i][1]).trim();
        if (param === "goalPerPerson") config.goalPerPerson = Number(value);
        if (param === "teacherName") config.teacherName = value;
        if (param === "currentCollectorId") config.currentCollectorId = value;
        if (param === "promptpayId") config.promptpayId = value;
        if (param === "promptpayName") config.promptpayName = value;
        if (param === "collectorPassword") config.collectorPassword = value;
        if (param === "teacherPassword") config.teacherPassword = value;
      }

      // Read Transactions
      const transRows = transSheet.getDataRange().getValues();
      const transactions = [];
      for (let i = 1; i < transRows.length; i++) {
        transactions.push({
          id: String(transRows[i][0]),
          timestamp: String(transRows[i][1]),
          type: String(transRows[i][2]),
          studentId: String(transRows[i][3]),
          studentNo: transRows[i][4] ? Number(transRows[i][4]) : "",
          studentName: String(transRows[i][5]),
          amount: Number(transRows[i][6]),
          description: String(transRows[i][7]),
          collector: String(transRows[i][8]),
          method: String(transRows[i][9] || 'cash'),
          slipUrl: String(transRows[i][10] || '')
        });
      }

      // Read History Log
      const histRows = historySheet.getDataRange().getValues();
      const collectorHistory = [];
      for (let i = 1; i < histRows.length; i++) {
        collectorHistory.push({
          timestamp: String(histRows[i][0]),
          title: String(histRows[i][1]),
          desc: String(histRows[i][2]),
          author: String(histRows[i][3])
        });
      }

      return jsonResponse({
        success: true,
        config: config,
        transactions: transactions,
        collectorHistory: collectorHistory
      });
    }

    // --- 2. SAVE TRANSACTION ---
    if (action === 'save_transaction') {
      const transSheet = getOrCreateSheet(ss, "Transactions", [
        "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
      ]);

      const txid = e.parameter.id || ("TX-" + Math.floor(100000 + Math.random() * 900000));
      const timestamp = e.parameter.timestamp || new Date().toLocaleString("th-TH");
      const type = e.parameter.type || "income";
      const studentId = e.parameter.studentId || "";
      const studentNo = e.parameter.studentNo ? Number(e.parameter.studentNo) : "";
      const studentName = e.parameter.studentName || "";
      const amount = Number(e.parameter.amount || 0);
      const description = e.parameter.description || "";
      const collector = e.parameter.collector || "";
      const method = e.parameter.method || "cash";
      
      // Handle potentially long slip URLs (base64 image strings)
      // Note: GAS allows passing large GET parameters up to a limit, but for big slips it is safe
      const slipUrl = e.parameter.slipUrl || "";

      transSheet.appendRow([txid, timestamp, type, studentId, studentNo, studentName, amount, description, collector, method, slipUrl]);

      return jsonResponse({ success: true, message: "บันทึกธุรกรรมลง Google Sheet เรียบร้อยแล้ว", id: txid });
    }

    // --- 3. SAVE CONFIG SETTINGS ---
    if (action === 'save_settings') {
      const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
      configSheet.clear();
      configSheet.appendRow(["Parameter", "Value"]); // restore header

      const settings = [
        ["goalPerPerson", e.parameter.goalPerPerson || "200"],
        ["teacherName", e.parameter.teacherName || "ครูนิวตรอน"],
        ["currentCollectorId", e.parameter.currentCollectorId || ""],
        ["promptpayId", e.parameter.promptpayId || ""],
        ["promptpayName", e.parameter.promptpayName || ""],
        ["collectorPassword", e.parameter.collectorPassword || "1234"],
        ["teacherPassword", e.parameter.teacherPassword || "2301"]
      ];

      settings.forEach(row => configSheet.appendRow(row));

      return jsonResponse({ success: true, message: "บันทึกการตั้งค่าลง Google Sheet เรียบร้อยแล้ว" });
    }

    // --- 4. RECORD AUDIT HISTORY ---
    if (action === 'save_history') {
      const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);
      const timestamp = e.parameter.timestamp || new Date().toLocaleString("th-TH");
      const title = e.parameter.title || "";
      const desc = e.parameter.desc || "";
      const author = e.parameter.author || "";

      historySheet.appendRow([timestamp, title, desc, author]);
      return jsonResponse({ success: true, message: "บันทึกประวัติสำเร็จ" });
    }

    // --- 5. DELETE TRANSACTION ---
    if (action === 'delete_transaction') {
      const transSheet = getOrCreateSheet(ss, "Transactions", [
        "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
      ]);
      const txid = e.parameter.id;
      if (!txid) {
        return jsonResponse({ success: false, error: "ขาดข้อมูล ID ธุรกรรม" });
      }

      const rows = transSheet.getDataRange().getValues();
      let deleteRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === String(txid).trim()) {
          deleteRowIndex = i + 1; // 1-indexed row number
          break;
        }
      }

      if (deleteRowIndex > 0) {
        transSheet.deleteRow(deleteRowIndex);
        return jsonResponse({ success: true, message: "ลบรายการธุรกรรมเรียบร้อยแล้ว" });
      } else {
        return jsonResponse({ success: false, error: "ไม่พบรหัสธุรกรรมในชีต" });
      }
    }

    // --- 6. RESET ALL DATABASE ---
    if (action === 'reset_database') {
      const configSheet = getOrCreateSheet(ss, "Config", ["Parameter", "Value"]);
      const transSheet = getOrCreateSheet(ss, "Transactions", [
        "ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"
      ]);
      const historySheet = getOrCreateSheet(ss, "HistoryLog", ["Timestamp", "Title", "Description", "Author"]);

      // Reset Transactions
      transSheet.clear();
      transSheet.appendRow(["ID", "Timestamp", "Type", "StudentID", "StudentNo", "StudentName", "Amount", "Description", "Collector", "Method", "SlipURL"]);

      // Reset History
      historySheet.clear();
      historySheet.appendRow(["Timestamp", "Title", "Description", "Author"]);

      // Reset Config to defaults
      configSheet.clear();
      configSheet.appendRow(["Parameter", "Value"]);
      const settings = [
        ["goalPerPerson", "200"],
        ["teacherName", "ครูนิวตรอน"],
        ["currentCollectorId", ""],
        ["promptpayId", "091-234-5678"],
        ["promptpayName", "เหรัญญิก ม.6/1"],
        ["collectorPassword", "1234"],
        ["teacherPassword", "2301"]
      ];
      settings.forEach(row => configSheet.appendRow(row));

      return jsonResponse({ success: true, message: "รีเซ็ตระบบฐานข้อมูลใน Google Sheets เรียบร้อยแล้ว" });
    }

    return jsonResponse({ success: false, error: "ไม่พบการกระทำ Action ที่กำหนด" });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}
