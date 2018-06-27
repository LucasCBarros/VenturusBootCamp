const express = require('express');
const consign = require('consign');

const app = express();

// boot nao pode ser antes do middleware pois ele precisa da porta configurada
consign()
    .include('libs/config.js')
    .then('db.js')
    .then('auth.js')
    .include('libs/middlewares.js')
    .then('routes')
    .then('libs/boot.js')
    .into(app);