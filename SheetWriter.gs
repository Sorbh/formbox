function writeToSheet(submission) {
  var spreadsheet = getOrCreateSpreadsheet(submission.product_name);
  var sheet = getOrCreateTab(spreadsheet, submission.form_type);
  var headers = getOrExpandHeaders(sheet, submission);
  appendRow(sheet, headers, submission);
}

function getOrCreateSpreadsheet(productName) {
  var props = PropertiesService.getScriptProperties();
  var key = 'sheet_' + productName;
  var sheetId = props.getProperty(key);

  if (sheetId) {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (err) {
      // Spreadsheet was deleted — recreate
    }
  }

  var name = CONFIG.SPREADSHEET_NAME_PREFIX + ' — ' + productName;
  var ss = SpreadsheetApp.create(name);
  props.setProperty(key, ss.getId());
  return ss;
}

function getOrCreateTab(spreadsheet, formType) {
  var sheet = spreadsheet.getSheetByName(formType);
  if (sheet) return sheet;

  sheet = spreadsheet.insertSheet(formType);

  // Remove the default "Sheet1" if it's still there and empty
  var defaultSheet = spreadsheet.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    spreadsheet.deleteSheet(defaultSheet);
  }

  // Write envelope headers
  sheet.getRange(1, 1, 1, CONFIG.ENVELOPE_COLUMNS.length)
    .setValues([CONFIG.ENVELOPE_COLUMNS]);
  sheet.getRange(1, 1, 1, CONFIG.ENVELOPE_COLUMNS.length)
    .setFontWeight('bold');
  sheet.setFrozenRows(1);

  return sheet;
}

function getOrExpandHeaders(sheet, submission) {
  var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  var existingHeaders = headerRange.getValues()[0].filter(function(h) { return h !== ''; });

  if (existingHeaders.length === 0) {
    existingHeaders = CONFIG.ENVELOPE_COLUMNS.slice();
    sheet.getRange(1, 1, 1, existingHeaders.length).setValues([existingHeaders]);
    sheet.getRange(1, 1, 1, existingHeaders.length).setFontWeight('bold');
  }

  var payloadKeys = Object.keys(submission.payload);
  var newKeys = [];

  for (var i = 0; i < payloadKeys.length; i++) {
    if (existingHeaders.indexOf(payloadKeys[i]) === -1) {
      newKeys.push(payloadKeys[i]);
    }
  }

  if (newKeys.length > 0) {
    var startCol = existingHeaders.length + 1;
    sheet.getRange(1, startCol, 1, newKeys.length).setValues([newKeys]);
    sheet.getRange(1, startCol, 1, newKeys.length).setFontWeight('bold');
    existingHeaders = existingHeaders.concat(newKeys);
  }

  return existingHeaders;
}

function appendRow(sheet, headers, submission) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    if (CONFIG.ENVELOPE_COLUMNS.indexOf(key) !== -1) {
      row.push(submission[key] || '');
    } else {
      row.push(submission.payload[key] !== undefined ? submission.payload[key] : '');
    }
  }
  sheet.appendRow(row);
}
