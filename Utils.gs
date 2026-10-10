function generateId() {
  var ts = Math.floor(Date.now() / 1000);
  var rand = Math.random().toString(36).substring(2, 6);
  return 'fb_' + ts + '_' + rand;
}

