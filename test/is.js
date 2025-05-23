"use strict";

const { test } = require("tap");
const is = require("../lib/is");

/**
 * .validFunction()
 */

test(".validFunction()", (t) => {
	t.notOk(is.validFunction(), "should return false when no arguments is given");
	t.notOk(is.validFunction({}), "should return false when the arguments is an object");
	t.notOk(is.validFunction("function"), "should return false when the arguments is an string");
	t.notOk(is.validFunction([]), "should return false when the arguments is an array");
	t.notOk(is.validFunction(true), "should return false when the arguments is an boolean");
	t.notOk(is.validFunction(42), "should return false when the arguments is an number");
	t.ok(
		is.validFunction(() => {}),
		"should return true when the arguments is an function",
	);
	t.ok(
		is.validFunction(() => {}),
		"should return true when the arguments is an arrow function",
	);
	t.ok(
		is.validFunction(async () => {}),
		"should return true when the arguments is an async function",
	);
	t.end();
});

/**
 * .validName()
 */

test(".validName()", (t) => {
	t.ok(
		is.validName("abc_def_G_01"),
		"should return true when the argument has chars in the specter of [a-zA-Z_][a-zA-Z0-9_]*",
	);
	t.notOk(
		is.validName("abc def G_01"),
		"should return false when the argument has chars not in the specter of [a-zA-Z_][a-zA-Z0-9_]*",
	);
	t.notOk(is.validName("10"), "should return false when the argument is just a number");
	t.end();
});

/**
 * .validType()
 */

test(".validType()", (t) => {
	t.ok(is.validType("histogram"), 'should return true when argument is "histogram"');
	t.ok(is.validType("summary"), 'should return true when argument is "summary"');
	t.ok(is.validType("counter"), 'should return true when argument is "counter"');
	t.ok(is.validType("gauge"), 'should return true when argument is "gauge"');
	t.notOk(is.validType("sumsum"), "should return false when argument is illegal");
	t.end();
});

/**
 * .validPromClient()
 */

test("is.validPromClient()", (t) => {
	const fn = () => {};
	t.ok(
		is.validPromClient({
			exponentialBuckets: fn,
			Histogram: fn,
			Summary: fn,
			Counter: fn,
			Gauge: fn,
		}),
		"should return true when object is matches",
	);
	t.notOk(
		is.validPromClient({
			exponentialBuckets: fn,
			Counter: fn,
			Gauge: fn,
		}),
		"should return false when object is not matching",
	);
	t.end();
});

/**
 * .validBucketStepFactor()
 */

test(".validBucketStepFactor()", (t) => {
	t.ok(is.validBucketStepFactor(4), "should return true when argument is a number");
	t.ok(is.validBucketStepFactor(null), 'should return true when argument is "null"');
	t.ok(is.validBucketStepFactor(undefined), 'should return true when argument is "undefined"');
	t.notOk(is.validBucketStepFactor("4"), "should return false when argument is not a number");
	t.end();
});

/**
 * .validBucketStepCount()
 */

test(".validBucketStepCount()", (t) => {
	t.ok(is.validBucketStepCount(4), "should return true when argument is a number");
	t.ok(is.validBucketStepCount(null), 'should return true when argument is "null"');
	t.ok(is.validBucketStepCount(undefined), 'should return true when argument is "undefined"');
	t.notOk(is.validBucketStepCount("4"), "should return false when argument is not a number");
	t.end();
});

/**
 * .validBucketStepStart()
 */

test(".validBucketStepStart()", (t) => {
	t.ok(is.validBucketStepStart(4), "should return true when argument is a number");
	t.ok(is.validBucketStepStart(null), 'should return true when argument is "null"');
	t.ok(is.validBucketStepStart(undefined), 'should return true when argument is "undefined"');
	t.notOk(is.validBucketStepStart("4"), "should return false when argument is not a number");
	t.end();
});
