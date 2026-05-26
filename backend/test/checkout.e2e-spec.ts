import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { IdempotencyRepository } from '../src/checkout/repositories/idempotency.repository';
import { OrdersRepository } from '../src/orders/repositories/orders.repository';
import { ProductsRepository } from '../src/products/repositories/products.repository';

interface CheckoutResponseBody {
  order_id: number;
  status: string;
  message: string;
}

const checkoutBody = (body: unknown): CheckoutResponseBody =>
  body as CheckoutResponseBody;

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

describe('CheckoutController (e2e)', () => {
  let app: INestApplication<App>;
  let idempotencyRepository: IdempotencyRepository;
  let ordersRepository: OrdersRepository;
  let productsRepository: ProductsRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    idempotencyRepository = app.get(IdempotencyRepository);
    ordersRepository = app.get(OrdersRepository);
    productsRepository = app.get(ProductsRepository);
    idempotencyRepository.reset();
    ordersRepository.reset();
    productsRepository.reset();
  });

  afterEach(async () => {
    delete process.env.ERP_PROCESSING_DELAY_MS;
    delete process.env.ERP_SIMULATE_TIMEOUT;
    delete process.env.ERP_MAX_RETRIES;
    delete process.env.ERP_RETRY_DELAY_MS;
    await app.close();
  });

  it('creates a checkout order and allows it to be queried', async () => {
    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '11111111-1111-4111-8111-111111111111')
      .send({
        items: [{ product_id: 1, quantity: 2 }],
      })
      .expect(202);

    const responseBody = checkoutBody(checkoutResponse.body);
    expect(responseBody.order_id).toEqual(expect.any(Number));
    expect(responseBody.order_id).toBeGreaterThan(0);
    expect(responseBody.status).toBe('PROCESSING');
    expect(responseBody.message).toBe(
      'Pedido recebido e está sendo processado.',
    );

    await request(app.getHttpServer())
      .get('/orders/' + responseBody.order_id)
      .expect(200)
      .expect({
        order_id: responseBody.order_id,
        status: 'PROCESSING',
        message: 'Pedido recebido e está sendo processado.',
      });
  });

  it('returns the same order for the same idempotency key and payload', async () => {
    const payload = { items: [{ product_id: 1, quantity: 2 }] };

    const firstResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '22222222-2222-4222-8222-222222222222')
      .send(payload)
      .expect(202);

    const secondResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '22222222-2222-4222-8222-222222222222')
      .send(payload)
      .expect(202);

    expect(checkoutBody(secondResponse.body)).toEqual(
      checkoutBody(firstResponse.body),
    );
  });

  it('rejects the same idempotency key with a different payload', async () => {
    await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '33333333-3333-4333-8333-333333333333')
      .send({ items: [{ product_id: 1, quantity: 1 }] })
      .expect(202);

    await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '33333333-3333-4333-8333-333333333333')
      .send({ items: [{ product_id: 1, quantity: 2 }] })
      .expect(400)
      .expect({ message: 'Dados da compra inválidos.' });
  });

  it('rejects requests without idempotency key', async () => {
    await request(app.getHttpServer())
      .post('/checkout')
      .send({ items: [{ product_id: 1, quantity: 1 }] })
      .expect(400)
      .expect({
        message:
          'Não foi possível identificar a tentativa de compra. Tente novamente.',
      });
  });

  it.each([
    ['missing items', {}],
    ['empty items', { items: [] }],
    ['wrong payload format', { product_id: 1, quantity: 1 }],
    ['unknown product', { items: [{ product_id: 999, quantity: 1 }] }],
  ])('rejects invalid checkout payload: %s', async (_caseName, payload) => {
    await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '44444444-4444-4444-8444-444444444444')
      .send(payload)
      .expect(400)
      .expect({ message: 'Dados da compra inválidos.' });
  });

  it.each([
    ['missing quantity', { items: [{ product_id: 1 }] }],
    ['non integer quantity', { items: [{ product_id: 1, quantity: 1.5 }] }],
    ['zero quantity', { items: [{ product_id: 1, quantity: 0 }] }],
    ['negative quantity', { items: [{ product_id: 1, quantity: -1 }] }],
  ])('rejects invalid checkout quantity: %s', async (_caseName, payload) => {
    await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '55555555-5555-4555-8555-555555555555')
      .send(payload)
      .expect(400)
      .expect({ message: 'Informe uma quantidade válida.' });
  });

  it('transitions a valid checkout order to approved and decrements stock', async () => {
    process.env.ERP_PROCESSING_DELAY_MS = '0';

    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '66666666-6666-4666-8666-666666666666')
      .send({ items: [{ product_id: 1, quantity: 2 }] })
      .expect(202);

    const responseBody = checkoutBody(checkoutResponse.body);

    await wait(10);

    await request(app.getHttpServer())
      .get('/orders/' + responseBody.order_id)
      .expect(200)
      .expect({
        order_id: responseBody.order_id,
        status: 'APPROVED',
        message: 'Compra aprovada com sucesso.',
      });
    expect(productsRepository.findById(1)?.stock).toBe(3);
  });

  it('rejects a checkout order when stock becomes insufficient during processing', async () => {
    process.env.ERP_PROCESSING_DELAY_MS = '10';

    const firstResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '77777777-7777-4777-8777-777777777777')
      .send({ items: [{ product_id: 1, quantity: 3 }] })
      .expect(202);

    const secondResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '88888888-8888-4888-8888-888888888888')
      .send({ items: [{ product_id: 1, quantity: 3 }] })
      .expect(202);

    const firstBody = checkoutBody(firstResponse.body);
    const secondBody = checkoutBody(secondResponse.body);

    await wait(20);

    await request(app.getHttpServer())
      .get('/orders/' + firstBody.order_id)
      .expect(200)
      .expect({
        order_id: firstBody.order_id,
        status: 'APPROVED',
        message: 'Compra aprovada com sucesso.',
      });

    await request(app.getHttpServer())
      .get('/orders/' + secondBody.order_id)
      .expect(200)
      .expect({
        order_id: secondBody.order_id,
        status: 'REJECTED',
        message: 'Não há estoque suficiente para essa quantidade.',
      });
  });

  it('rejects a checkout order after ERP timeout retries are exhausted', async () => {
    process.env.ERP_SIMULATE_TIMEOUT = 'true';
    process.env.ERP_PROCESSING_DELAY_MS = '0';
    process.env.ERP_MAX_RETRIES = '1';
    process.env.ERP_RETRY_DELAY_MS = '1';

    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '99999999-9999-4999-8999-999999999999')
      .send({ items: [{ product_id: 1, quantity: 1 }] })
      .expect(202);

    const responseBody = checkoutBody(checkoutResponse.body);

    await wait(20);

    await request(app.getHttpServer())
      .get('/orders/' + responseBody.order_id)
      .expect(200)
      .expect({
        order_id: responseBody.order_id,
        status: 'REJECTED',
        message: 'Não foi possível processar o pedido após novas tentativas.',
      });
    expect(
      ordersRepository.findById(responseBody.order_id)?.processing_attempts,
    ).toBe(2);
  });

  it('rejects checkout when initial stock is insufficient', async () => {
    await request(app.getHttpServer())
      .post('/checkout')
      .set('Idempotency-Key', '66666666-6666-4666-8666-666666666666')
      .send({ items: [{ product_id: 1, quantity: 6 }] })
      .expect(409)
      .expect({ message: 'Não há estoque suficiente para essa quantidade.' });

    await request(app.getHttpServer())
      .get('/orders/1')
      .expect(404)
      .expect({ message: 'Pedido não encontrado.' });
  });
});
