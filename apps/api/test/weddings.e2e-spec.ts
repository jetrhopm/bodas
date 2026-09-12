import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Flujos críticos de bodas (E2E)', () => {
  let app: INestApplication;
  let token = '';
  let taskId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('rechaza credenciales inválidas', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin@local.test', password: 'incorrecta' }).expect(401);
  });

  it('expone salud y disponibilidad de base de datos', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
  });

  it('autentica al administrador', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'admin@local.test', password: 'password' }).expect(201);
    token = response.body.accessToken;
    expect(token).toEqual(expect.any(String));
  });

  it('rota el refresh token y revoca la sesión al cerrar sesión', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/v1/auth/login').send({ email: 'admin@local.test', password: 'password' }).expect('Set-Cookie', /bodas_refresh/).expect(201);
    const refreshed = await agent.post('/api/v1/auth/refresh').expect(201);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    await agent.post('/api/v1/auth/logout').expect(201);
    await agent.post('/api/v1/auth/refresh').expect(401);
  });

  it('crea, actualiza y audita una tarea', async () => {
    const created = await request(app.getHttpServer()).post('/api/v1/weddings/demo-wedding/tasks').set('Authorization', `Bearer ${token}`).send({ title: `E2E ${Date.now()}`, category: 'Pruebas', internalOnly: true }).expect(201);
    taskId = created.body.id;
    await request(app.getHttpServer()).patch(`/api/v1/weddings/demo-wedding/tasks/${taskId}`).set('Authorization', `Bearer ${token}`).send({ status: 'DONE' }).expect(200);
    await request(app.getHttpServer()).post(`/api/v1/weddings/demo-wedding/tasks/${taskId}/comments`).set('Authorization', `Bearer ${token}`).send({ body: 'Comentario E2E' }).expect(201);
    const audit = await request(app.getHttpServer()).get('/api/v1/weddings/demo-wedding/audit').set('Authorization', `Bearer ${token}`).expect(200);
    expect(audit.body.some((event: { entityId: string }) => event.entityId === taskId)).toBe(true);
  });

  it('guarda y descarga un adjunto mediante el proveedor local', async () => {
    const uploaded = await request(app.getHttpServer()).post('/api/v1/weddings/demo-wedding/files').set('Authorization', `Bearer ${token}`).field('taskId', taskId).attach('file', Buffer.from('comprobante de prueba'), 'comprobante.txt').expect(201);
    await request(app.getHttpServer()).get(`/api/v1/weddings/demo-wedding/files/${uploaded.body.id}/download`).set('Authorization', `Bearer ${token}`).expect('Content-Disposition', /comprobante.txt/).expect(200);
  });

  it('entrega reporte protegido y exportaciones CSV/PDF', async () => {
    const summary = await request(app.getHttpServer()).get('/api/v1/weddings/demo-wedding/reports/summary').set('Authorization', `Bearer ${token}`).expect(200);
    expect(summary.body.wedding.id).toBe('demo-wedding');
    await request(app.getHttpServer()).get('/api/v1/weddings/demo-wedding/reports/export.csv').set('Authorization', `Bearer ${token}`).expect('Content-Type', /text\/csv/).expect(200);
    const pdf = await request(app.getHttpServer()).get('/api/v1/weddings/demo-wedding/reports/export.pdf').set('Authorization', `Bearer ${token}`).expect('Content-Type', /application\/pdf/).expect(200);
    expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('permite leer la invitación publicada sin sesión', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public/invitations/demo-invitacion-segura').expect(200);
    expect(response.body.couple).toEqual(expect.any(String));
  });
});
