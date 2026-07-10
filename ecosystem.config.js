// PM2 — gerencia backend (API) e frontend (Next) em produção na VPS.
// Uso: pm2 start ecosystem.config.js  |  pm2 save  |  pm2 startup
const path = require('node:path');

const logs = (name) => path.join(__dirname, 'logs', name);

module.exports = {
  apps: [
    {
      name: 'guetto-api',
      cwd: path.join(__dirname, 'backend'),
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '400M',
      out_file: logs('api-out.log'),
      error_file: logs('api-error.log'),
      time: true,
    },
    {
      name: 'guetto-web',
      cwd: path.join(__dirname, 'frontend'),
      // Next standalone gera .next/standalone/server.js (ver DEPLOY.md).
      // Alternativa simples e estável: 'npm' com args 'start' (next start).
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      max_memory_restart: '400M',
      out_file: logs('web-out.log'),
      error_file: logs('web-error.log'),
      time: true,
    },
  ],
};
