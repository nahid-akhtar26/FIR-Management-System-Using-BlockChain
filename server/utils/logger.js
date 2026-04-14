const logWithLevel = (level, message, meta = null) => {
  const timestamp = new Date().toISOString();
  if (meta) {
    console.log(`[${timestamp}] [${level}] ${message}`, meta);
    return;
  }
  console.log(`[${timestamp}] [${level}] ${message}`);
};

module.exports = {
  info: (message, meta) => logWithLevel('INFO', message, meta),
  warn: (message, meta) => logWithLevel('WARN', message, meta),
  error: (message, meta) => logWithLevel('ERROR', message, meta)
};
