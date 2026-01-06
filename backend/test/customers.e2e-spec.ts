import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiResponseInterceptor } from '../src/shared/api-response.interceptor';

describe('Customers E2E', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let token = '';
  let customerId = '';
  const email = `e2e_${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    await app.init();
    server = app.getHttpServer() as unknown as Parameters<typeof request>[0];

    await request(server)
      .post('/auth/register')
      .send({ username: `user_${Date.now()}`, password: 'secret123', email });
    const res = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    const bodyLogin = res.body as unknown as {
      code: number;
      data?: { token: string };
    };
    token = bodyLogin.data?.token ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  it('create customer', async () => {
    const res = await request(server)
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Acme Inc',
        status: 'active',
        contactPerson: 'Alice',
        contactPhone: '13800138000',
        contactEmail: 'alice@acme.com',
        contactDate: '2025-01-01',
        contactAddress: 'Beijing',
      });
    expect([200]).toContain(res.status);
    const bodyCreate = res.body as unknown as {
      code: number;
      data?: { id: string };
    };
    expect(bodyCreate.code).toBe(200);
    customerId = bodyCreate.data?.id ?? '';
    expect(customerId.length).toBeGreaterThan(0);
  });

  it('get customer exists in list', async () => {
    const res = await request(server)
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const bodyList = res.body as unknown as {
      code: number;
      data?: { list: Array<{ id: string; name: string }> };
    };
    expect(bodyList.code).toBe(200);
    const found = (bodyList.data?.list ?? []).find((i) => i.id === customerId);
    expect(!!found).toBe(true);
    expect(found?.name).toBe('Acme Inc');
  });

  it('update customer', async () => {
    const res = await request(server)
      .put(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'inactive', contactPerson: 'Bob' });
    expect([200]).toContain(res.status);
    const bodyUpdate = res.body as unknown as { code: number };
    expect(bodyUpdate.code).toBe(200);
    const res2 = await request(server)
      .get(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res2.status).toBe(200);
    const bodyGet2 = res2.body as unknown as {
      code: number;
      data?: { status: string; contactPerson: string };
    };
    expect(bodyGet2.data?.status).toBe('inactive');
    expect(bodyGet2.data?.contactPerson).toBe('Bob');
  });

  it('list customers', async () => {
    const res = await request(server)
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const bodyList = res.body as unknown as {
      code: number;
      data?: { list: any[] };
    };
    expect(bodyList.code).toBe(200);
    expect(Array.isArray(bodyList.data?.list)).toBe(true);
  });

  it('delete customer', async () => {
    const res = await request(server)
      .delete(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const bodyDel = res.body as unknown as { code: number };
    expect(bodyDel.code).toBe(200);
  });
});
