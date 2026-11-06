import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('FoodHub API Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Restaurants (Catalog)', () => {
    it('GET /v1/restaurants returns paginated restaurant list', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/restaurants?limit=2&offset=0')
        .expect(200);

      expect(res.body).toEqual({
        data: [
          { id: 1, name: 'Num Banh Chok Corner', area: 'Daun Penh' },
          { id: 2, name: 'Lok Lak House', area: 'BKK1' },
        ],
        limit: 2,
        offset: 0,
        total: 3,
      });
    });
  });

  describe('Orders (Ordering)', () => {
    let createdOrderId: string;

    it('POST /v1/orders creates a new order', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/orders')
        .send({ restaurantId: 1, items: ['Soup', 'Tea'] })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.restaurantId).toBe(1);
      expect(res.body.items).toEqual(['Soup', 'Tea']);
      expect(res.body.status).toBe('PLACED');
      createdOrderId = res.body.id;
    });

    it('POST /v1/orders returns 404 for non-existent restaurant', async () => {
      await request(app.getHttpServer())
        .post('/v1/orders')
        .send({ restaurantId: 999, items: ['Food'] })
        .expect(404);
    });

    it('POST /v1/orders respects Idempotency-Key (returns 200 on retry)', async () => {
      const key = 'idem-key-12345';
      const first = await request(app.getHttpServer())
        .post('/v1/orders')
        .set('Idempotency-Key', key)
        .send({ restaurantId: 1, items: ['Coffee'] })
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/v1/orders')
        .set('Idempotency-Key', key)
        .send({ restaurantId: 1, items: ['Coffee'] })
        .expect(200);

      expect(second.body.id).toBe(first.body.id);
    });

    it('GET /v1/orders/:id retrieves order by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/orders/${createdOrderId}`)
        .expect(200);

      expect(res.body.id).toBe(createdOrderId);
      expect(res.body.status).toBe('PLACED');
    });

    it('GET /v1/orders/:id returns 404 for unknown id', async () => {
      await request(app.getHttpServer())
        .get('/v1/orders/non-existent-id')
        .expect(404);
    });

    it('PATCH /v1/orders/:id updates status on allowed transition', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/orders/${createdOrderId}`)
        .send({ status: 'COOKING' })
        .expect(200);

      expect(res.body.status).toBe('COOKING');
    });

    it('PATCH /v1/orders/:id rejects disallowed transition with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .patch(`/v1/orders/${createdOrderId}`)
        .send({ status: 'DELIVERED' }) // From COOKING directly to DELIVERED is not allowed
        .expect(409);
    });
  });

  describe('Auth', () => {
    let cookie: string;

    it('POST /v1/login logs in user and sets cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/login?username=sokha')
        .expect(201);

      expect(res.body).toEqual({ ok: true });
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      cookie = setCookie[0];
    });

    it('GET /v1/me returns username with cookie', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body).toEqual({ username: 'sokha' });
    });

    it('GET /v1/me returns 401 without cookie', async () => {
      await request(app.getHttpServer())
        .get('/v1/me')
        .expect(401);
    });
  });
});
