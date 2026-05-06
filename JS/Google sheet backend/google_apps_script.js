// ===== GOOGLE APPS SCRIPT - Deploy as Web App =====
// 1. Go to script.google.com
// 2. Paste this code
// 3. Create spreadsheet named "Appointment leads"
// 4. Deploy > New Deployment > Web App > Execute As: Your Account > Who Can Access: Anyone
// 5. Copy the Deployment URL and paste in admin panel

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; 
const SHEET_NAME = "Appointment leads";

// Helper function to stop formulas from running in Google Sheets
function sanitize(input) {
  if (!input) return '';
  let str = String(input).trim();
  // If the string starts with a formula character (=, +, -, @), add an apostrophe so Sheets treats it as text
  if (str.match(/^[=\+\-@]/)) {
    str = "'" + str;
  }
  // Limit length to 1000 characters to prevent spam
  return str.substring(0, 1000);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // BASIC VALIDATION: Make sure they at least sent a name and phone
    if (!data.fullName || !data.phone) {
      return ContentService.createTextOutput(JSON.stringify({success: false, error: "Missing required fields"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      initializeHeaders(sheet);
    }
    
    // Clean all the data before saving!
    const cleanName = sanitize(data.fullName);
    const cleanPhone = sanitize(data.phone);
    const cleanEmail = sanitize(data.email);
    const cleanDate = sanitize(data.date);
    const cleanNotes = sanitize(data.notes);
    
    sheet.appendRow([
      new Date().toLocaleString('en-IN'),
      cleanName,
      cleanPhone,
      cleanEmail,
      cleanDate,
      cleanNotes,
      'Pending'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function initializeHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Full Name',
    'Phone Number',
    'Email ID',
    'Preferred Date',
    'Preferred Time',
    'Additional Notes',
    'Status'
  ];
  
  sheet.appendRow(headers);
  
  // FORMAT HEADERS
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#ff5540');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // AUTO-FIT COLUMNS
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

function doGet(e) {
  // FOR TESTING
  return HtmlService.createHtmlOutput('✓ Google Apps Script deployed successfully');
}
