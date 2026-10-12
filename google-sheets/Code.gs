/**
 * Spotless NT → Google Sheets sync.
 *
 * Paste this whole file into Extensions → Apps Script in your Google Sheet,
 * set SECRET below to the same value as GOOGLE_SHEETS_SECRET in Vercel,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the web app URL in Vercel as GOOGLE_SHEETS_WEBHOOK_URL.
 *
 * The website sends { secret, tab, upsert: [rows], delete: [ids] }.
 * Rows are matched on the "ID" column: existing rows are updated, new ones appended.
 */
const SECRET = 'PASTE-THE-SECRET-HERE';
const TABS = ['Customers', 'Jobs', 'Leads', 'Bookings'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.secret !== SECRET) return reply({ ok: false, error: 'Wrong secret' });
    if (TABS.indexOf(body.tab) === -1) return reply({ ok: false, error: 'Unknown tab' });
    const sheet = getSheet(body.tab);
    const upserted = upsertRows(sheet, body.upsert || []);
    const deleted = deleteRows(sheet, body.delete || []);
    return reply({ ok: true, upserted: upserted, deleted: deleted });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

/** Visit the web app URL in a browser to check it is running. */
function doGet() {
  return reply({ ok: true, message: 'Spotless NT sheet sync is running.' });
}

function getSheet(name) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1, 1).setValue('ID');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function headersOf(sheet, rows) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(String);
  rows.forEach(function (row) {
    Object.keys(row).forEach(function (key) {
      if (headers.indexOf(key) === -1) headers.push(key);
    });
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#0B2F5E').setFontColor('#FFFFFF');
  return headers;
}

function idIndex(sheet, headers) {
  const column = headers.indexOf('ID') + 1;
  const index = {};
  const last = sheet.getLastRow();
  if (last < 2) return index;
  sheet.getRange(2, column, last - 1, 1).getValues().forEach(function (value, i) {
    if (value[0]) index[String(value[0])] = i + 2;
  });
  return index;
}

function upsertRows(sheet, rows) {
  if (!rows.length) return 0;
  const headers = headersOf(sheet, rows);
  const index = idIndex(sheet, headers);
  const appended = [];
  rows.forEach(function (row) {
    const values = headers.map(function (key) { return row[key] === undefined ? '' : row[key]; });
    const existing = index[String(row.ID)];
    if (existing) sheet.getRange(existing, 1, 1, headers.length).setValues([values]);
    else appended.push(values);
  });
  if (appended.length) sheet.getRange(sheet.getLastRow() + 1, 1, appended.length, headers.length).setValues(appended);
  return rows.length;
}

function deleteRows(sheet, ids) {
  if (!ids.length || sheet.getLastRow() < 2) return 0;
  const headers = headersOf(sheet, []);
  const index = idIndex(sheet, headers);
  const rowsToDelete = ids.map(function (id) { return index[String(id)]; }).filter(Boolean).sort(function (a, b) { return b - a; });
  rowsToDelete.forEach(function (row) { sheet.deleteRow(row); });
  return rowsToDelete.length;
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
