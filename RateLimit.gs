// Apps Script web apps don't expose the client IP, and any identifier the
// caller sends can be rotated freely. So limits are keyed on things the
// caller can't multiply: a global bucket (protects Mail/Drive/UrlFetch
// quotas) and a per-product bucket (one noisy product can't starve the rest).
function isRateLimited(productName) {
  var limits = CONFIG.RATE_LIMIT;
  var buckets = [
    { key: 'rl_global_min', limit: limits.GLOBAL_PER_MINUTE, ttl: 60 },
    { key: 'rl_global_hr', limit: limits.GLOBAL_PER_HOUR, ttl: 3600 },
    { key: 'rl_product_min_' + productName, limit: limits.PER_PRODUCT_PER_MINUTE, ttl: 60 },
    { key: 'rl_product_hr_' + productName, limit: limits.PER_PRODUCT_PER_HOUR, ttl: 3600 },
  ];

  var cache = CacheService.getScriptCache();
  var counts = cache.getAll(buckets.map(function(b) { return b.key; }));

  for (var i = 0; i < buckets.length; i++) {
    var count = parseInt(counts[buckets[i].key] || '0', 10);
    if (count >= buckets[i].limit) return true;
  }

  for (var j = 0; j < buckets.length; j++) {
    var current = parseInt(counts[buckets[j].key] || '0', 10);
    cache.put(buckets[j].key, String(current + 1), buckets[j].ttl);
  }

  return false;
}
