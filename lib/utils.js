'use strict';

function isHistogram(metric) {
    if (metric.type) {
        return metric.type === 5;
    }
    // backwards compatibility
    return typeof metric.time === 'number';
}

function isSummary(metric) {
    return metric.type === 7;
}

function isGauge(metric) {
    if (metric.type) {
        return metric.type === 1;
    }
    // backwards compatibility
    return !!metric.value;
}

function createCounter(Counter, metric, options) {
    const { name, description } = metric;
    return new Counter({
        name,
        help: description,
        labelNames: options.labels,
        registers: [options.registry],
    });
}

function createGauge(Gauge, metric, options) {
    const { name, description } = metric;
    return new Gauge({
        name,
        help: description,
        labelNames: options.labels,
        registers: [options.registry],
    });
}

function createBuckets({
    bucketFunction,
    bucketStepStart,
    bucketStepFactor,
    bucketStepCount,
}) {
    return bucketFunction(bucketStepStart, bucketStepFactor, bucketStepCount)
        .map(f => Math.round(f * 10000) / 10000)
        .concat(Infinity);
}

function createHistogram(Histogram, bucketFunction, metric, options) {
    const buckets = createBuckets({
        bucketFunction,
        ...options,
    });
    const { name, description, meta = {} } = metric;

    const overrides =
        meta &&
        Array.isArray(meta.buckets) &&
        meta.buckets.length &&
        meta.buckets;

    return new Histogram({
        name,
        help: description,
        labelNames: options.labels,
        buckets: overrides || buckets,
        registers: [options.registry],
    });
}

function createSummary(Summary, metric, options) {
    const { name, description } = metric;
    return new Summary({
        name,
        help: description,
        labelNames: options.labels,
        registers: [options.registry],
    });
}

module.exports = {
    isHistogram,
    isSummary,
    isGauge,
    createCounter,
    createGauge,
    createBuckets,
    createHistogram,
    createSummary,
};
