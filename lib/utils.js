'use strict';

const {
    Gauge,
    Counter,
    Histogram,
    Summary,
    exponentialBuckets,
} = require('prom-client');

function isHistogram(metric) {
    return typeof metric.time === 'number';
}

function isGauge(metric) {
    return !!metric.value;
}

function createCounter(metric, options) {
    const { name, description } = metric;
    return new Counter({
        name,
        help: description,
        labelNames: options.labels,
    });
}

function createGauge(metric, options) {
    const { name, description } = metric;
    return new Gauge({
        name,
        help: description,
        labelNames: options.labels,
    });
}

function createBuckets({ bucketStepStart, bucketStepFactor, bucketStepCount }) {
    return exponentialBuckets(
        bucketStepStart,
        bucketStepFactor,
        bucketStepCount,
    )
        .map(f => Math.round(f * 10000) / 10000)
        .concat(Infinity);
}

function createHistogram(metric, options) {
    const buckets = createBuckets(options);
    const { name, description } = metric;
    return new Histogram({
        name,
        help: description,
        labelNames: options.labels,
        buckets,
    });
}

function createSummary(metric, options) {
    const { name, description } = metric;
    return new Summary({
        name,
        help: description,
        labelNames: options.labels,
    });
}

module.exports = {
    isHistogram,
    isGauge,
    createCounter,
    createGauge,
    createBuckets,
    createHistogram,
    createSummary,
};
