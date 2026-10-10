function sendTelegramNotification(submission) {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('TELEGRAM_ENABLED') !== 'true') return;

  var botToken = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!botToken || !chatId) return;

  var emoji = { low: '⚪', normal: '🟢', high: '🟡', urgent: '🔴' };
  var icon = emoji[submission.priority] || '🟢';

  var lines = [
    '📬 <b>' + escTg(submission.product_name) + ' - ' + escTg(submission.form_type) + '</b>',
    '',
    '<b>From:</b> ' + escTg(submission.submitter_email),
    '<b>Priority:</b> ' + icon + ' ' + escTg(submission.priority),
  ];

  if (submission.source_url) {
    lines.push('<b>Source:</b> <a href="' + escTg(submission.source_url) + '">' + escTg(submission.source_url) + '</a>');
  }

  lines.push('<b>Time:</b> ' + escTg(submission.timestamp));
  lines.push('<b>ID:</b> <code>' + escTg(submission.submission_id) + '</code>');

  var payloadKeys = Object.keys(submission.payload);
  if (payloadKeys.length > 0) {
    lines.push('');
    lines.push('<b>Submitted Data:</b>');
    for (var i = 0; i < payloadKeys.length; i++) {
      var val = submission.payload[payloadKeys[i]];
      if (typeof val === 'object') val = JSON.stringify(val);
      lines.push('• <b>' + escTg(payloadKeys[i]) + ':</b> ' + escTg(String(val)));
    }
  }

  var text = lines.join('\n');

  var url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';

  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    Logger.log('Telegram notification failed: ' + err.message);
  }
}

function escTg(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
