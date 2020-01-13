'use strict';

const { test } = require('tap');
const is = require('../lib/is');

/**
 * .validFunction()
 */

test('.validFunction()', t => {
    t.false(
        is.validFunction(),
        'should return false when no arguments is given',
    );
    t.false(
        is.validFunction({}),
        'should return false when the arguments is an object',
    );
    t.false(
        is.validFunction('function'),
        'should return false when the arguments is an string',
    );
    t.false(
        is.validFunction([]),
        'should return false when the arguments is an array',
    );
    t.false(
        is.validFunction(true),
        'should return false when the arguments is an boolean',
    );
    t.false(
        is.validFunction(42),
        'should return false when the arguments is an number',
    );
    t.true(
        is.validFunction(function foo() {}),
        'should return true when the arguments is an function',
    );
    t.true(
        is.validFunction(() => {}),
        'should return true when the arguments is an arrow function',
    );
    t.true(
        is.validFunction(async () => {}),
        'should return true when the arguments is an async function',
    );
    t.end();
});

/**
 * .validName()
 */

test('.validName()', t => {
    t.true(
        is.validName('abc_def_G_01'),
        'should return true when the argument has chars in the specter of [a-zA-Z_][a-zA-Z0-9_]*',
    );
    t.false(
        is.validName('abc def G_01'),
        'should return false when the argument has chars not in the specter of [a-zA-Z_][a-zA-Z0-9_]*',
    );
    t.false(
        is.validName('10'),
        'should return false when the argument is just a number',
    );
    t.end();
});

/**
 * .validType()
 */

test('.validType()', t => {
    t.true(
        is.validType('histogram'),
        'should return true when argument is "histogram"',
    );
    t.true(
        is.validType('summary'),
        'should return true when argument is "summary"',
    );
    t.true(
        is.validType('counter'),
        'should return true when argument is "counter"',
    );
    t.true(
        is.validType('gauge'),
        'should return true when argument is "gauge"',
    );
    t.false(
        is.validType('sumsum'),
        'should return false when argument is illegal',
    );
    t.end();
});

/**
 * .validPromClient()
 */

test('is.validPromClient()', t => {
    const fn = () => {};
    t.true(
        is.validPromClient({
            exponentialBuckets: fn,
            Histogram: fn,
            Summary: fn,
            Counter: fn,
            Gauge: fn,
        }),
        'should return true when object is matches',
    );
    t.false(
        is.validPromClient({
            exponentialBuckets: fn,
            Counter: fn,
            Gauge: fn,
        }),
        'should return false when object is not matching',
    );
    t.end();
});

/**
 * .validBucketStepFactor()
 */

test('.validBucketStepFactor()', t => {
    t.true(
        is.validBucketStepFactor(4),
        'should return true when argument is a number',
    );
    t.true(
        is.validBucketStepFactor(null),
        'should return true when argument is "null"',
    );
    t.true(
        is.validBucketStepFactor(undefined),
        'should return true when argument is "undefined"',
    );
    t.false(
        is.validBucketStepFactor('4'),
        'should return false when argument is not a number',
    );
    t.end();
});

/**
 * .validBucketStepCount()
 */

test('.validBucketStepCount()', t => {
    t.true(
        is.validBucketStepCount(4),
        'should return true when argument is a number',
    );
    t.true(
        is.validBucketStepCount(null),
        'should return true when argument is "null"',
    );
    t.true(
        is.validBucketStepCount(undefined),
        'should return true when argument is "undefined"',
    );
    t.false(
        is.validBucketStepCount('4'),
        'should return false when argument is not a number',
    );
    t.end();
});

/**
 * .validBucketStepStart()
 */

test('.validBucketStepStart()', t => {
    t.true(
        is.validBucketStepStart(4),
        'should return true when argument is a number',
    );
    t.true(
        is.validBucketStepStart(null),
        'should return true when argument is "null"',
    );
    t.true(
        is.validBucketStepStart(undefined),
        'should return true when argument is "undefined"',
    );
    t.false(
        is.validBucketStepStart('4'),
        'should return false when argument is not a number',
    );
    t.end();
});
