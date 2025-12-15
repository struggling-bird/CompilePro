import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiResponseInterceptor } from '../src/shared/api-response.interceptor';

describe('Auth E2E', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let token = '';
  let userId = '';
  const uname = `e2euser_${Date.now()}`;
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
    // supertest 对入参类型有明确签名，避免直接传入 any 触发 no-unsafe-argument
    server = app.getHttpServer() as unknown as Parameters<typeof request>[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('register', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({ username: uname, password: 'secret123', email });
    expect([200, 201]).toContain(res.status);
    const body = res.body as {
      code: number;
      data?: { id: string };
      timestamp: number;
    };
    expect(body.code).toBe(200);
    expect(body.data?.id).toBeTruthy();
    userId = body.data?.id ?? '';
  });

  it('login success', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    expect([200, 201]).toContain(res.status);
    const body = res.body as {
      code: number;
      data?: { token: string };
      timestamp: number;
    };
    expect(body.code).toBe(200);
    expect(body.data?.token).toBeTruthy();
    token = body.data?.token ?? '';
  });

  it('me success', async () => {
    const res = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = res.body as {
      code: number;
      data?: { username: string };
      timestamp: number;
    };
    expect(body.code).toBe(200);
    expect(body.data?.username).toBe(uname);
  });

  it('login failure wrong password', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email, password: 'wrong' });
    expect([400, 401, 403, 404, 500]).toContain(res.status);
    const body = res.body as { code: number; timestamp: number };
    expect(body.code).toBe(res.status);
  });

  it('deactivate user then login should fail', async () => {
    const res1 = await request(server)
      .put(`/users/${userId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'inactive' });
    expect([200]).toContain(res1.status);
    const body1 = res1.body as { code: number; timestamp: number };
    expect(body1.code).toBe(200);
    const res2 = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    expect([403]).toContain(res2.status);
    const body2 = res2.body as { code: number; timestamp: number };
    expect(body2.code).toBe(res2.status);
  });
});
