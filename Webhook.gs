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
