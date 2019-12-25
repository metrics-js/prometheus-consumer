'use strict';

const Joi = require('@hapi/joi');

module.exports = Joi.string()
    .label('name')
    .token()
    .required();
