'use strict';

const { test } = require('tap');
const is = require('../lib/is');

test('is.validName() - has chars in the specter of [a-zA-Z_][a-zA-Z0-9_]* - should return true', t => {
    t.true(is.validName('abc_def_G_01'));
    t.end();
});

test('is.validName() - value is just a number - should return false', t => {
    t.false(is.validName('10'));
    t.end();
});

test('is.validType() - value is "counter" - should return true', t => {
    t.true(is.validType('counter'));
    t.end();
});

test('is.validType() - value is "histogram" - should return true', t => {
    t.true(is.validType('histogram'));
    t.end();
});

test('is.validType() - value is "gauge" - should return true', t => {
    t.true(is.validType('gauge'));
    t.end();
});

test('is.validType() - value is "summary" - should return true', t => {
    t.true(is.validType('summary'));
    t.end();
});

test('is.validType() - value illegal - should return false', t => {
    t.false(is.validType('sumsum'));
    t.end();
});
