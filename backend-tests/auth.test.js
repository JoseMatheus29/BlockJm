const request = require('supertest');
const { Wallet } = require('ethers');
const app = require('../api/app');

describe('Auth routes (nonce/login)', () => {
  test('GET /auth/nonce then POST /auth/login with valid signature', async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;

    // request nonce
    const nonceRes = await request(app).get('/auth/nonce').query({ address });
    expect(nonceRes.statusCode).toBe(200);
    expect(nonceRes.body).toHaveProperty('nonce');
    const nonce = nonceRes.body.nonce;

    const signature = await wallet.signMessage(String(nonce));

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ address, signature, nonce })
      .set('Content-Type', 'application/json');

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('message', 'Login bem-sucedido');
    expect(loginRes.body).toHaveProperty('address', address);
  });

  test('POST /auth/login fails with wrong signature', async () => {
    const walletA = Wallet.createRandom();
    const walletB = Wallet.createRandom();
    const address = walletA.address;

    const nonceRes = await request(app).get('/auth/nonce').query({ address });
    const nonce = nonceRes.body.nonce;

    // sign with different wallet (invalid)
    const badSig = await walletB.signMessage(String(nonce));

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ address, signature: badSig, nonce })
      .set('Content-Type', 'application/json');

    expect(loginRes.statusCode).toBe(400);
  });
});
