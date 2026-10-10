function hasHoneypotTriggered(payload) {
  var keys = Object.keys(payload);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(CONFIG.HONEYPOT_PREFIX) === 0 && payload[keys[i]]) {
      return true;
    }
  }
  return false;
}

function stripHoneypotFields(payload) {
  var clean = {};
  var keys = Object.keys(payload);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(CONFIG.HONEYPOT_PREFIX) !== 0) {
      clean[keys[i]] = payload[keys[i]];
    }
  }
  return clean;
}
