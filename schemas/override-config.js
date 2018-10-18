'use strict';

const Joi = require('joi');

module.exports = Joi.object()
    .keys({
        type: Joi.string()
            .label('type')
            .valid('counter', 'histogram', 'gauge', 'summary')
            .optional(),
        buckets: Joi.object()
            .label('buckets')
            .keys({
                bucketStepStart: Joi.number().default(0.001),
                bucketStepFactor: Joi.number().default(1.15),
                bucketStepCount: Joi.number().default(45),
            })
            .optional(),
    })
    .optional();
