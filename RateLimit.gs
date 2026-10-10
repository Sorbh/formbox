function extractIp(e) {
  // Apps Script doesn't expose client IP directly in web apps.
  // We use a hash of available request identifiers as a rough proxy.
  var identifier = (e.parameter && e.parameter._client_id) || 'unknown';
  return identifier;
}

function isRateLimited(ip) {
  var cache = CacheService.getScriptCache();

  var minuteKey = 'rl_min_' + ip;
  var hourKey = 'rl_hr_' + ip;

  var minuteCount = parseInt(cache.get(minuteKey) || '0', 10);
  var hourCount = parseInt(cache.get(hourKey) || '0', 10);

  if (minuteCount >= CONFIG.RATE_LIMIT.PER_MINUTE) return true;
  if (hourCount >= CONFIG.RATE_LIMIT.PER_HOUR) return true;

  cache.put(minuteKey, String(minuteCount + 1), 60);
  cache.put(hourKey, String(hourCount + 1), 3600);

  return false;
}
