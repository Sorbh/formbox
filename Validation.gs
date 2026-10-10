function validateEnvelope(body) {
  if (!body.product_name || typeof body.product_name !== 'string' || !body.product_name.trim()) {
    return 'Missing required field: product_name';
  }

  if (!body.form_type || typeof body.form_type !== 'string' || !body.form_type.trim()) {
    return 'Missing required field: form_type';
  }

  if (body.product_name.trim().length > CONFIG.MAX_NAME_LENGTH) {
    return 'product_name must be at most ' + CONFIG.MAX_NAME_LENGTH + ' characters';
  }

  if (body.form_type.trim().length > CONFIG.MAX_NAME_LENGTH) {
    return 'form_type must be at most ' + CONFIG.MAX_NAME_LENGTH + ' characters';
  }

  if (!body.submitter_email || typeof body.submitter_email !== 'string' || !body.submitter_email.trim()) {
    return 'Missing required field: submitter_email';
  }

  if (!isValidEmail(body.submitter_email)) {
    return 'Invalid email format: submitter_email';
  }

  if (body.priority && CONFIG.PRIORITY_VALUES.indexOf(body.priority) === -1) {
    return 'Invalid priority. Must be one of: ' + CONFIG.PRIORITY_VALUES.join(', ');
  }

  if (body.payload && typeof body.payload !== 'object') {
    return 'payload must be a JSON object';
  }

  if (body.callback_url && !isValidCallbackUrl(body.callback_url)) {
    return 'callback_url must be a valid HTTPS URL';
  }

  if (body.callback_url && !isAllowedCallbackHost(body.callback_url)) {
    return 'callback_url host is not allowed';
  }

  return null;
}

function isAllowedProduct(productName) {
  var allowed = PropertiesService.getScriptProperties().getProperty('ALLOWED_PRODUCTS');
  if (!allowed) return true;
  var list = allowed.split(',').map(function(p) { return p.trim().toLowerCase(); });
  return list.indexOf(productName) !== -1;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePriority(value) {
  if (!value) return CONFIG.DEFAULT_PRIORITY;
  var lower = value.trim().toLowerCase();
  return CONFIG.PRIORITY_VALUES.indexOf(lower) !== -1 ? lower : CONFIG.DEFAULT_PRIORITY;
}
