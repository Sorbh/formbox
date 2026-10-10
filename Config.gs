const CONFIG = {
  RATE_LIMIT: {
    PER_MINUTE: 5,
    PER_HOUR: 50,
  },

  PRIORITY_VALUES: ['low', 'normal', 'high', 'urgent'],
  DEFAULT_PRIORITY: 'normal',

  ENVELOPE_COLUMNS: [
    'submission_id',
    'timestamp',
    'product_name',
    'form_type',
    'submitter_email',
    'source_url',
    'priority',
  ],

  HONEYPOT_PREFIX: '_',

  SPREADSHEET_NAME_PREFIX: 'Formbox',
};
