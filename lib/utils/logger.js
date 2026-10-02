// src/utils/logger.js

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args) => {
    if (isDevelopment) console.log(...args);
  },
  info: (...args) => {
    if (isDevelopment) console.info(...args);
  },
  warn: (...args) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args) => {
    // Always log errors even in production
    console.error(...args);
  },
  debug: (...args) => {
    if (isDevelopment) console.debug(...args);
  },
  group: (...args) => {
    if (isDevelopment) console.group(...args);
  },
  groupEnd: (...args) => {
    if (isDevelopment) console.groupEnd(...args);
  },
  table: (...args) => {
    if (isDevelopment) console.table(...args);
  },
};

// Override console methods globally (optional)
if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  // Keep errors for debugging
  // console.error = () => {};
}