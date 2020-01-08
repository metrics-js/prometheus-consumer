'use strict';

const is = require('../lib/is');

test('is.validName() - has chars in the specter of [a-zA-Z_][a-zA-Z0-9_]* - should return true', () => {
    expect(is.validName('abc_def_G_01')).toBeTruthy();
});

test('is.validName() - value is just a number - should return false', () => {
    expect(is.validName('10')).toBeFalsy();
});

test('is.validType() - value is "counter" - should return true', () => {
    expect(is.validType('counter')).toBeTruthy();
});

test('is.validType() - value is "histogram" - should return true', () => {
    expect(is.validType('histogram')).toBeTruthy();
});

test('is.validType() - value is "gauge" - should return true', () => {
    expect(is.validType('gauge')).toBeTruthy();
});

test('is.validType() - value is "summary" - should return true', () => {
    expect(is.validType('summary')).toBeTruthy();
});

test('is.validType() - value illegal - should return false', () => {
    expect(is.validType('sumsum')).toBeFalsy();
});
