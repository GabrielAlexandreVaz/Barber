'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const { httpLogger } = require('./config/logger');
const { globalLimiter } = require('./middlewares/rateLimit');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/error');
const routes = require('./routes');

const app = express();

// Confia no proxy (Nginx) para IP correto no rate limit e logs em produção
app.set('trust proxy', 1);

// Segurança e infraestrutura
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(httpLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Arquivos enviados (fotos de barbeiros/serviços/logo)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// API
app.use('/api', routes);

// 404 + tratamento central de erros (sempre por último)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
