function sendNotification(submission) {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('EMAIL_ENABLED') !== 'true') return;

  var subject = '[Formbox] ' + submission.product_name + ' / ' + submission.form_type +
    ' — from ' + submission.submitter_email;

  var html = buildEmailHtml(submission);

  var email = props.getProperty('NOTIFICATION_EMAIL');
  if (!email) return;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: html,
  });
}

function buildEmailHtml(submission) {
  var priorityColor = {
    low: '#9AA0A6',
    normal: '#0F9D58',
    high: '#F4B400',
    urgent: '#EA4335',
  };

  var color = priorityColor[submission.priority] || '#0F9D58';

  var rows = '';
  rows += emailRow('Product', submission.product_name);
  rows += emailRow('Form Type', submission.form_type);
  rows += emailRow('From', submission.submitter_email);
  rows += emailRow('Priority', '<span style="color:' + color + ';font-weight:600">' + submission.priority + '</span>');
  if (submission.source_url) {
    rows += emailRow('Source', '<a href="' + escapeHtml(submission.source_url) + '">' + escapeHtml(submission.source_url) + '</a>');
  }
  rows += emailRow('Time', submission.timestamp);
  rows += emailRow('ID', submission.submission_id);

  var payloadRows = '';
  var payloadKeys = Object.keys(submission.payload);
  if (payloadKeys.length > 0) {
    for (var i = 0; i < payloadKeys.length; i++) {
      var val = submission.payload[payloadKeys[i]];
      if (typeof val === 'object') val = JSON.stringify(val);
      payloadRows += emailRow(payloadKeys[i], escapeHtml(String(val)));
    }
  }

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4">' +
    '<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1)">' +
    '<div style="background:' + color + ';padding:16px 24px;color:#fff">' +
    '<h2 style="margin:0;font-size:18px">New Submission</h2>' +
    '<p style="margin:4px 0 0;font-size:13px;opacity:0.9">' + escapeHtml(submission.product_name) + ' / ' + escapeHtml(submission.form_type) + '</p>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
    rows +
    '</table>' +
    (payloadRows ?
      '<div style="padding:12px 24px;background:#fafafa;border-top:1px solid #eee">' +
      '<h3 style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Submitted Data</h3>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
      payloadRows +
      '</table>'
      : '') +
    '<div style="padding:12px 24px;background:#fafafa;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999">' +
    'Formbox · ' + submission.submission_id +
    '</div>' +
    '</div></body></html>';
}

function emailRow(label, value) {
  return '<tr>' +
    '<td style="padding:10px 24px;border-bottom:1px solid #f0f0f0;color:#666;width:120px;vertical-align:top;font-weight:600;font-size:13px">' + escapeHtml(label) + '</td>' +
    '<td style="padding:10px 24px;border-bottom:1px solid #f0f0f0;color:#333">' + value + '</td>' +
    '</tr>';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
