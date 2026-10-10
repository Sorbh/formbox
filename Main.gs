function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
  } catch (err) {
    return sendJson(400, { status: 'error', message: 'Invalid JSON body' });
  }

  var validation = validateEnvelope(body);
  if (validation) {
    return sendJson(400, { status: 'error', message: validation });
  }

  var productName = body.product_name.trim().toLowerCase();
  if (!isAllowedProduct(productName)) {
    return sendJson(403, { status: 'error', message: 'Unknown product_name' });
  }

  if (isRateLimited(productName)) {
    return sendJson(429, { status: 'error', message: 'Rate limit exceeded. Try again later.' });
  }

  var payload = body.payload || {};
  if (hasHoneypotTriggered(payload)) {
    return sendJson(200, { status: 'ok', submission_id: generateId() });
  }

  var cleanPayload = stripHoneypotFields(payload);

  var submission = {
    submission_id: generateId(),
    timestamp: new Date().toISOString(),
    product_name: productName,
    form_type: body.form_type.trim().toLowerCase(),
    submitter_email: body.submitter_email.trim().toLowerCase(),
    source_url: body.source_url || '',
    priority: normalizePriority(body.priority),
    payload: cleanPayload,
  };

  writeToSheet(submission);
  sendNotification(submission);
  sendTelegramNotification(submission);
  fireWebhook(submission, body.callback_url);

  return sendJson(200, {
    status: 'ok',
    submission_id: submission.submission_id,
  });
}

function doGet(e) {
  return sendJson(200, {
    service: 'Formbox',
    status: 'running',
    usage: 'POST JSON to this URL. See docs for schema.',
  });
}

function sendJson(code, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
