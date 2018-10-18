'use strict';

const Joi = require('joi');

module.exports = Joi.object()
    .keys({
        bucketStepStart: Joi.number().default(0.001),
        bucketStepFactor: Joi.number().default(1.15),
        bucketStepCount: Joi.number().default(45),
    })
    .optional();
