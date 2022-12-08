'use strict';

import {QueryTypes} from "sequelize";

let path = require('path');
let Sequelize = require('sequelize');
let env = process.env.NODE_ENV || 'production';
// let config = require(path.join(__dirname, '..', 'config', 'db-config.json'))[env];
let config = require(path.join(__dirname, '..', 'config', 'db-config.js'))[env];
let db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

// db.TokenList = require('./tokenList')(sequelize, Sequelize);

module.exports = db;

