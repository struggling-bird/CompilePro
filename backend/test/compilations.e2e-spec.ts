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
      .send({ username: `user_comp_${Date.now()}`, password: 'secret123', email });
    const resLogin = await request(server)
      .post('/auth/login')
      .send({ email, password: 'secret123' });
    token = (resLogin.body as any).data.token;

    // 2. Create Customer
    const resCust = await request(server)
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
    customerId = (resCust.body as any).data.id;

    // 3. Create Environment
    const resEnv = await request(server)
      .post(`/customers/${customerId}/environments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Env',
        url: 'http://localhost',
        supportRemote: false,
      });
    environmentId = (resEnv.body as any).data.id;

    // 4. Create Template with Initial Version
    const resTempl = await request(server)
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
    templateId = (resTempl.body as any).data.id;
    // We need version ID. Usually returned in template detail or we fetch versions.
    const resVers = await request(server)
      .get(`/templates/${templateId}/versions`)
      .set('Authorization', `Bearer ${token}`);
    templateVersionId = (resVers.body as any).data[0].id;
  });

  afterAll(async () => {
    // Cleanup if necessary (optional for e2e with volatile db)
    if (compilationId) await request(server).delete(`/compilations/${compilationId}`).set('Authorization', `Bearer ${token}`);
    if (templateId) await request(server).delete(`/templates/${templateId}`).set('Authorization', `Bearer ${token}`); // Cascades?
    if (environmentId) await request(server).delete(`/customers/${customerId}/environments/${environmentId}`).set('Authorization', `Bearer ${token}`);
    if (customerId) await request(server).delete(`/customers/${customerId}`).set('Authorization', `Bearer ${token}`);
    await app.close();
  });

  it('should create a compilation', async () => {
    const res = await request(server)
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
    const body = res.body as any;
    expect(body.code).toBe(200); // Interceptor sets 200
    expect(body.data.id).toBeDefined();
    compilationId = body.data.id;
    
    // Check if configs were initialized (empty lists or inherited)
    expect(Array.isArray(body.data.globalConfigs)).toBe(true);
    expect(Array.isArray(body.data.moduleConfigs)).toBe(true);
  });

  it('should list compilations', async () => {
    const res = await request(server)
      .get('/compilations')
      .query({ page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.data.items.length).toBeGreaterThan(0);
    const found = body.data.items.find((c: any) => c.id === compilationId);
    expect(found).toBeDefined();
    expect(found.name).toBe('E2E Compilation');
  });

  it('should get compilation details', async () => {
    const res = await request(server)
      .get(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.data.id).toBe(compilationId);
    expect(body.data.templateId).toBe(templateId);
  });

  it('should update compilation basic info and configs', async () => {
    const newName = 'Updated E2E Compilation';
    const newGlobalConfigs = [
      { configId: 'conf1', value: 'val1' },
      { configId: 'conf2', value: 'val2' },
    ];
    const newModuleConfigs = [
      { moduleId: 'mod1', configId: 'confA', value: 'valA' },
    ];

    const res = await request(server)
      .patch(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: newName,
        globalConfigs: newGlobalConfigs,
        moduleConfigs: newModuleConfigs,
      });

    expect(res.status).toBe(200);
    const body = res.body as any;
    expect(body.data.name).toBe(newName);
    // Check returned configs
    // Note: The service update method returns the saved entity.
    // Ensure configs are updated.
    // Wait, the Service update method:
    // async update(id, dto) { ... Object.assign ... save ... }
    // Since we updated DTO, Object.assign will copy the arrays.
    // The DB should reflect this.
    
    // We need to fetch again to be sure, or trust the return if it's the saved entity.
    expect(body.data.globalConfigs).toHaveLength(2);
    expect(body.data.moduleConfigs).toHaveLength(1);
    expect(body.data.globalConfigs[0].value).toBe('val1');
  });

  it('should delete compilation', async () => {
    const res = await request(server)
      .delete(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    
    // Verify it's gone
    const resGet = await request(server)
      .get(`/compilations/${compilationId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(resGet.status).toBe(404);
    
    compilationId = ''; // Prevent cleanup from trying to delete again
  });
});
