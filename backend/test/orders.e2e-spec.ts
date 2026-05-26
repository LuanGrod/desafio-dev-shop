import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { OrderStatus } from '../src/orders/domain/order-status.enum';
import { OrdersRepository } from '../src/orders/repositories/orders.repository';

describe('OrdersController (e2e)', () => {
  let app: INestApplication<App>;
  let ordersRepository: OrdersRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ordersRepository = app.get(OrdersRepository);
    ordersRepository.reset();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 404 when order does not exist', async () => {
    await request(app.getHttpServer())
      .get('/orders/999')
      .expect(404)
      .expect({ message: 'Pedido não encontrado.' });
  });

  it('returns an order with PROCESSING status', async () => {
    ordersRepository.save({
      order_id: 101,
      status: OrderStatus.PROCESSING,
      message: 'Pedido recebido e está sendo processado.',
      items: [{ product_id: 1, quantity: 2 }],
    });

    await request(app.getHttpServer()).get('/orders/101').expect(200).expect({
      order_id: 101,
      status: 'PROCESSING',
      message: 'Pedido recebido e está sendo processado.',
    });
  });

  it('returns an order with APPROVED status', async () => {
    ordersRepository.save({
      order_id: 102,
      status: OrderStatus.APPROVED,
      message: 'Compra aprovada com sucesso.',
      items: [{ product_id: 1, quantity: 1 }],
    });

    await request(app.getHttpServer()).get('/orders/102').expect(200).expect({
      order_id: 102,
      status: 'APPROVED',
      message: 'Compra aprovada com sucesso.',
    });
  });

  it('returns an order with REJECTED status', async () => {
    ordersRepository.save({
      order_id: 103,
      status: OrderStatus.REJECTED,
      message: 'Não há estoque suficiente para essa quantidade.',
      items: [{ product_id: 1, quantity: 10 }],
    });

    await request(app.getHttpServer()).get('/orders/103').expect(200).expect({
      order_id: 103,
      status: 'REJECTED',
      message: 'Não há estoque suficiente para essa quantidade.',
    });
  });

  it.each(['/orders/abc', '/orders/0', '/orders/-1'])(
    'returns 400 for invalid order id %s',
    async (path) => {
      await request(app.getHttpServer())
        .get(path)
        .expect(400)
        .expect({ message: 'Informe um pedido válido.' });
    },
  );
});
