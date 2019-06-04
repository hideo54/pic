const fs = require('fs');
const request = require('supertest');
const sharp = require('sharp');

const app = require('./app');
const dir = __dirname + '/data';

describe('Image size check', () => {
    test('Simple download', async () => {
        const testImageMetadata = await sharp(`${dir}/test.png`).metadata();
        const response = await request(app.callback()).get(`/test.png`);
        const responseImageMetadata = await sharp(response.body).metadata();
        expect(responseImageMetadata.width).toBe(testImageMetadata.width);
        expect(responseImageMetadata.height).toBe(testImageMetadata.height);
    });
    test('Width specified', async () => {
        const width = 123;
        const testImageMetadata = await sharp(`${dir}/test.png`).metadata();
        const response = await request(app.callback()).get(`/test-${width}w.png`);
        const responseImageMetadata = await sharp(response.body).metadata();
        expect(response.status).toBe(200);
        expect(responseImageMetadata.width).toBe(width);
        const scale = responseImageMetadata.width / testImageMetadata.width
        expect(responseImageMetadata.height).toBe(Math.floor(testImageMetadata.height*scale));
    });
});

describe('Cache-Control check', () => {
    test('Cache age not specified', async () => {
        const defaultAge = 3600 * 24 * 7; // 7d
        const response = await request(app.callback()).get(`/test.png`);
        expect(response.status).toBe(200);
        expect(response.header['cache-control']).toBe(`max-age=${defaultAge}`);
    });
    test('Cache age specified in hours', async () => {
        const expected = 3600 * 1; // 1h
        const response = await request(app.callback()).get(`/test.png?cache=1h`);
        expect(response.status).toBe(200);
        expect(response.header['cache-control']).toBe(`max-age=${expected}`);
    });
    test('Cache age specified in days', async () => {
        const expected = 3600 * 24 * 2; // 2d
        const response = await request(app.callback()).get(`/test.png?cache=2d`);
        expect(response.status).toBe(200);
        expect(response.header['cache-control']).toBe(`max-age=${expected}`);
    });
    test('Cache age specified in months', async () => {
        const expected = 3600 * 24 * 30 * 3; // 3m
        const response = await request(app.callback()).get(`/test.png?cache=3m`);
        expect(response.status).toBe(200);
        expect(response.header['cache-control']).toBe(`max-age=${expected}`);
    });
    test('Cache age specified in years', async () => {
        const expected = 3600 * 24 * 365 * 4; // 4y
        const response = await request(app.callback()).get(`/test.png?cache=4y`);
        expect(response.status).toBe(200);
        expect(response.header['cache-control']).toBe(`max-age=${expected}`);
    });
});

describe('Bad requests (to test error handling)', () => {
    test('Request for a file that does not exist', async () => {
        const response = await request(app.callback()).get(`/nothing.png`);
        expect(response.status).toBe(400);
        expect(response.text).toBe('No such file.');
    });
    test('Both modes specified', async () => {
        const response = await request(app.callback()).get(`/test-contain-cover.png`);
        expect(response.status).toBe(400);
        expect(response.text).toBe('You have to decide either contain mode or cover mode.');
    });
});
