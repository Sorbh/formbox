function fireWebhook(submission, callbackUrl) {
  if (!callbackUrl) return;

  var webhookPayload = {
    event: 'form_submission',
    submission_id: submission.submission_id,
    timestamp: submission.timestamp,
    product_name: submission.product_name,
    form_type: submission.form_type,
    submitter_email: submission.submitter_email,
    source_url: submission.source_url,
    priority: submission.priority,
    payload: submission.payload,
  };

  try {
    UrlFetchApp.fetch(callbackUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(webhookPayload),
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
    });
  } catch (err) {
    Logger.log('Webhook failed for ' + callbackUrl + ': ' + err.message);
  }
}

function isValidCallbackUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^https:\/\/.+/.test(url.trim());
}

function isAllowedCallbackHost(url) {
  var allowed = PropertiesService.getScriptProperties().getProperty('ALLOWED_CALLBACK_HOSTS');
  if (!allowed) return true;

  var match = /^https:\/\/([^\/?#]+)/i.exec(url.trim());
  if (!match || match[1].indexOf('@') !== -1) return false;
  var host = match[1].replace(/:\d+$/, '').toLowerCase();

  var list = allowed.split(',').map(function(h) { return h.trim().toLowerCase(); });
  return list.indexOf(host) !== -1;
}
