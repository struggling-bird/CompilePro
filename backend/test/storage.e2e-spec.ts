import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiResponseInterceptor } from '../src/shared/api-response.interceptor';
import * as fs from 'fs';
import * as path from 'path';

describe('Storage E2E', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let token = '';
  let fileId = '';

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

    const email = `stor_${Date.now()}@example.com`;
    const regRes = await request(server)
      .post('/auth/register')
      .send({ username: `user_${Date.now()}`, password: 'secret123', email });

    if (regRes.status !== 200 && regRes.status !== 201) {
      console.error('Register failed:', regRes.status, regRes.body);
    }

    const res = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    const bodyLogin = res.body as unknown as {
      code: number;
      data?: { token: string };
    };
    token = bodyLogin.data?.token ?? '';
    if (!token) {
      console.error('Login failed:', res.status, res.body);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('upload file', async () => {
    const dummyPath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyPath, 'hello');
    const res = await request(server)
      .post('/storage/upload')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Request-Id', `${Date.now()}-1`)
      .attach('files', dummyPath);

    if (res.status !== 200 && res.status !== 201) {
      console.error('Upload failed:', res.status, res.body);
    }

    expect([200, 201]).toContain(res.status);
    type UploadResp = { code: number; data?: Array<{ id: string }> };
    const body = res.body as unknown as UploadResp;
    expect(body.code).toBe(200);
    fileId = body.data?.[0]?.id ?? '';
    expect(fileId.length).toBeGreaterThan(0);
    fs.unlinkSync(dummyPath);
  });

  it('download file', async () => {
    const res = await request(server)
      .get(`/storage/download/${fileId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Request-Id', `${Date.now()}-2`);

    if (res.status !== 200 && res.status !== 206) {
      console.error('Download failed:', res.status, res.body);
    }

    expect([200, 206]).toContain(res.status);
    expect(res.headers['content-disposition']).toContain('attachment');
  });
});
