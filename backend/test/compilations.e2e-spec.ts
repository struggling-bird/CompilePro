import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiResponseInterceptor } from '../src/shared/api-response.interceptor';

describe('Compilations E2E', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  let token = '';

  // IDs
  let customerId = '';
  let environmentId = '';
  let templateId = '';
  let templateVersionId = '';
  let compilationId = '';

  const email = `e2e_comp_${Date.now()}@example.com`;

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

    // 1. Register & Login
    await request(server)
      .post('/auth/register')
      .send({
        username: `user_comp_${Date.now()}`,
        password: 'secret123',
        email,
      });
    const resLogin: request.Response = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    const loginBody = resLogin.body as unknown as { data: { token: string } };
    token = loginBody.data.token;

    // 2. Create Customer
    const resCust: request.Response = await request(server)
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Comp Test Customer',
        status: 'active',
        contactPerson: 'Tester',
        contactPhone: '1234567890',
        contactEmail: 'test@customer.com',
        contactDate: '2025-01-01',
        contactAddress: 'Test Addr',
      });
    const custBody = resCust.body as unknown as { data: { id: string } };
    customerId = custBody.data.id;

    // 3. Create Environment
    const resEnv: request.Response = await request(server)
      .post(`/customers/${customerId}/environments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Env',
        url: 'http://localhost',
        supportRemote: false,
      });
    const envBody = resEnv.body as unknown as { data: { id: string } };
    environmentId = envBody.data.id;

    // 4. Create Template with Initial Version
    const resTempl: request.Response = await request(server)
      .post('/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Comp Test Template',
        description: 'For compilation test',
        initialVersion: {
          version: '1.0.0',
          description: 'Init',
          versionType: 'Major',
        },
      });
    const templBody = resTempl.body as unknown as { data: { id: string } };
    templateId = templBody.data.id;
    // We need version ID. Usually returned in template detail or we fetch versions.
    const resVers: request.Response = await request(server)
      .get(`/templates/${templateId}/versions`)
      .set('Authorization', `Bearer ${token}`);
    const versBody = resVers.body as unknown as { data: Array<{ id: string }> };
    templateVersionId = versBody.data[0].id;
  });

  afterAll(async () => {
    // Cleanup if necessary (optional for e2e with volatile db)
    if (compilationId)
      await request(server)
        .delete(`/compilations/${compilationId}`)
        .set('Authorization', `Bearer ${token}`);
    if (templateId)
      await request(server)
        .delete(`/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`); // Cascades?
    if (environmentId)
      await request(server)
        .delete(`/customers/${customerId}/environments/${environmentId}`)
        .set('Authorization', `Bearer ${token}`);
    if (customerId)
      await request(server)
        .delete(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${token}`);
    await app.close();
  });

  it('should create a compilation', async () => {
    const res: request.Response = await request(server)
      .post('/compilations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Compilation',
        templateId,
        templateVersionId,
        customerId,
        environmentId,
        description: 'Test Description',
      });

    expect(res.status).toBe(201);
    const body = res.body as unknown as {
      code: number;
      data: { id: string; name: string };
    };
    expect(body.code).toBe(200); // Interceptor sets 200
    expect(body.data.id).toBeDefined();
    compilationId = body.data.id;
  });

  it('should list compilations', async () => {
    const res: request.Response = await request(server)
      .get('/compilations')
      .query({ page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const body = res.body as unknown as {
      code: number;
      data: { items: Array<{ id: string; name: string }>; meta: unknown };
    };
    expect(body.data.items.length).toBeGreaterThan(0);
    const found = body.data.items.find((c) => c.id === compilationId) || null;
    expect(found).not.toBeNull();
    expect(found?.name).toBe('E2E Compilation');
  });

  it('should fetch and update global configs', async () => {
    const resList: request.Response = await request(server)
      .get(`/compilations/${compilationId}/global-configs`)
      .set('Authorization', `Bearer ${token}`);
    expect(resList.status).toBe(200);
    const listBody = resList.body as unknown as {
      code: number;
      data: Array<{ configId: string; name: string; value: string }>;
    };
    expect(Array.isArray(listBody.data)).toBe(true);
    if (listBody.data.length > 0) {
      const first = listBody.data[0];
      const newVal = `${first.value || ''}_updated`;
      const resUpdate: request.Response = await request(server)
        .put(`/compilations/${compilationId}/global-configs/${first.configId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ value: newVal });
      expect(resUpdate.status).toBe(200);
      const updatedList = resUpdate.body as unknown as {
        code: number;
        data: Array<{ configId: string; value: string }>;
      };
      const after = updatedList.data.find((c) => c.configId === first.configId);
      expect(after?.value).toBe(newVal);
    }
  });

  it('should update compilation basic info', async () => {
    const newName = 'Updated E2E Compilation';

    const res: request.Response = await request(server)
      .patch(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: newName,
      });

    expect(res.status).toBe(200);
    const body = res.body as unknown as {
      code: number;
      data: { name: string };
    };
    expect(body.data.name).toBe(newName);
  });

  it('should delete compilation', async () => {
    const res: request.Response = await request(server)
      .delete(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    compilationId = ''; // Prevent cleanup from trying to delete again
  });
});
