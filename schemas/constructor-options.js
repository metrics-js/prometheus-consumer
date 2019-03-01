'use strict';

const Joi = require('joi');

module.exports = Joi.object()
    .keys({
        logger: Joi.object(),
        client: Joi.object()
            .keys({
                Gauge: Joi.func(),
                Counter: Joi.func(),
                Histogram: Joi.func(),
                Summary: Joi.func(),
                exponentialBuckets: Joi.func(),
            })
            .unknown()
            .required(),
        bucketStepStart: Joi.number().default(0.001),
        bucketStepFactor: Joi.number().default(1.15),
        bucketStepCount: Joi.number().default(45),
    })
    .optional();
