'use strict';

const Joi = require('joi');

module.exports = Joi.string()
    .label('name')
    .token()
    .required();
