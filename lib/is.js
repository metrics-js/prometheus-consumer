'use strict';

// Ref; https://github.com/OpenObservability/OpenMetrics/blob/9a6db2a94dcf8dd84dd08a221e1b323e2b279f08/proto/openmetrics_data_model.proto#L42
const REGEX_NAME = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;

const validFunction = fn => {
    const type = {}.toString.call(fn);
    return type === '[object Function]' || type === '[object AsyncFunction]';
};
module.exports.validFunction = validFunction;

const validName = value => {
    return REGEX_NAME.test(value);
};
module.exports.validName = validName;

const validPromClient = obj => {
    return (
        validFunction(obj.Gauge) &&
        validFunction(obj.Counter) &&
        validFunction(obj.Histogram) &&
        validFunction(obj.Summary) &&
        validFunction(obj.exponentialBuckets)
    );
};
module.exports.validPromClient = validPromClient;

const validBucketStepFactor = value => {
    return Number.isFinite(value) || value === null || value === undefined;
};
module.exports.validBucketStepFactor = validBucketStepFactor;

const validBucketStepCount = value => {
    return Number.isFinite(value) || value === null || value === undefined;
};
module.exports.validBucketStepCount = validBucketStepCount;

const validBucketStepStart = value => {
    return Number.isFinite(value) || value === null || value === undefined;
};
module.exports.validBucketStepStart = validBucketStepStart;

const validType = value => {
    return (
        value === 'counter' ||
        value === 'histogram' ||
        value === 'gauge' ||
        value === 'summary'
    );
};
module.exports.validType = validType;
