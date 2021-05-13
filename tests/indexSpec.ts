import app from '../src/index';
import supertest from "supertest";

const request = supertest(app);

describe('Test image endpoint', () => {
  it ('the endpoint is exposed', async() => {
    const response = await request.get('/api/images');
    expect(response.status).not.toBe(404);
  });
  it ('the endpoint should process a valid image', async() => {
    const response = await request.get('/api/images?filename=fjord.jpg&width=200&height=200');
    expect(response.status).toBe(200);
  });
});

