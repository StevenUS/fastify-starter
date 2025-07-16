// test/auth.service.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import envPlugin from '../src/plugins/env.plugin.js';
import dbPlugin from '../src/plugins/db.plugin.js';
import userServicePlugin from '../src/plugins/user.plugin.js';
import authPlugin from '../src/plugins/auth.plugin.js';
import cookiePlugin from '../src/plugins/cookie.plugin.js';
import { Kysely } from 'kysely';
import { Database } from '../src/types/database.js';
import { migrate } from '../scripts/migrate.js';
import { hashPassword, verifyPassword } from '../src/lib/argon.js';

type TestContext = {
  app: Awaited<ReturnType<typeof buildTestApp>>;
  db: Kysely<Database>;
};

async function buildTestApp() {
  const app = Fastify();

  try {
    // Register plugins needed for auth service tests
    await app.register(envPlugin);
    await app.register(dbPlugin);
    await app.register(cookiePlugin);
    await app.register(authPlugin);
    await app.register(userServicePlugin);

    // Run migrations on the in-memory db instance
    await migrate(app.db);

    return app;
  } catch (error) {
    console.error('Failed to build test app:', error);
    throw error;
  }
}

test.describe('AuthService', () => {
  let context: TestContext;

  test.before(async () => {
    const app = await buildTestApp();
    context = {
      app,
      db: app.db,
    };
  });

  test.after(async () => {
    await context.app.db.destroy();
    await context.app.close();
  });

  test.afterEach(async () => {
    // Clean up tables after each test
    await context.db.deleteFrom('userSession').execute();
    await context.db.deleteFrom('user').execute();
  });

  test('argon test', async () => {
    const userPw = 'testpass123';
    const hashedPassword = await hashPassword(userPw);
    const isVerified = await verifyPassword(hashedPassword, userPw);
    assert.ok(isVerified);
  });

  test('should login a user and create a session', async () => {
    // Create a test user first
    const userName = 'testuser';
    const userPw = 'testpass123';
    const user = await context.app.userService.createUser({
      name: userName,
      password: userPw,
    });

    // Test login
    const result = await context.app.authService.login({
      username: userName,
      password: userPw,
      userAgent: 'test',
      ipAddress: '127.0.0.1',
    });

    assert.ok(result.token);
    assert.equal(result.userId, user.id);
    assert.ok(new Date(result.expiresAt) > new Date());
  });

  test('should not login with invalid credentials', async () => {
    // Create a test user
    await context.app.userService.createUser({
      name: 'testuser',
      password: 'testpass123',
    });

    // Test invalid login
    await assert.rejects(
      async () => {
        await context.app.authService.login({
          username: 'testuser',
          password: 'wrongpassword',
          userAgent: 'test',
          ipAddress: '127.0.0.1',
        });
      },
      {
        name: 'Error',
        message: 'Invalid credentials',
      },
    );
  });

  test('should get user sessions', async () => {
    // Create a test user
    const user = await context.app.userService.createUser({
      name: 'testuser',
      password: 'testpass123',
    });

    // Create a session
    const { session } = await context.app.authService.createSession({
      userId: user.id,
      userAgent: 'test',
      ipAddress: '127.0.0.1',
    });

    // Get sessions
    const sessions = await context.app.authService.getUserSessions(user.id, session.id);

    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].sessionId, session.id);
    assert.strictEqual(sessions[0].isCurrent, true);
    assert.strictEqual(sessions[0].isActive, true);
  });

  test('should revoke a session', async () => {
    // Create a test user
    const user = await context.app.userService.createUser({
      name: 'testuser',
      password: 'testpass123',
    });

    // Create a session
    const { session, token } = await context.app.authService.createSession({
      userId: user.id,
      userAgent: 'test',
      ipAddress: '127.0.0.1',
    });

    // Revoke the session
    await context.app.authService.revokeSession(token);

    // Verify session is revoked
    const sessions = await context.app.authService.getUserSessions(user.id, session.id);
    const currentSession = sessions.find((s) => s.sessionId === session.id);
    assert.strictEqual(currentSession?.isActive, false);
  });

  test('should revoke all sessions for a user', async () => {
    // Create a test user
    const user = await context.app.userService.createUser({
      name: 'testuser',
      password: 'testpass123',
    });

    // Create multiple sessions
    const sessions = await Promise.all([
      context.app.authService.login({
        username: 'testuser',
        password: 'testpass123',
        userAgent: 'test-agent-1',
        ipAddress: '127.0.0.1',
      }),
      context.app.authService.login({
        username: 'testuser',
        password: 'testpass123',
        userAgent: 'test-agent-2',
        ipAddress: '127.0.0.1',
      }),
    ]);

    // Verify sessions were created
    const userSessions = await context.db
      .selectFrom('userSession')
      .selectAll()
      .where('userId', '=', user.id)
      .execute();

    assert.equal(userSessions.length, 2);
    assert.ok(!userSessions[0].revokedAt);
    assert.ok(!userSessions[1].revokedAt);

    // Revoke all sessions
    await context.app.authService.revokeAllSessions(user.id);

    // Verify all sessions are revoked
    const revokedSessions = await context.db
      .selectFrom('userSession')
      .selectAll()
      .where('userId', '=', user.id)
      .execute();

    assert.equal(revokedSessions.length, 2);
    assert.ok(revokedSessions[0].revokedAt);
    assert.ok(revokedSessions[1].revokedAt);

    // Create another session and test excluding it
    const newSession = await context.app.authService.login({
      username: 'testuser',
      password: 'testpass123',
      userAgent: 'test-agent-3',
      ipAddress: '127.0.0.1',
    });

    // Revoke all sessions except the new one
    await context.app.authService.revokeAllSessions(user.id, newSession.token);

    // Verify only the new session is not revoked
    const finalSessions = await context.db
      .selectFrom('userSession')
      .selectAll()
      .where('userId', '=', user.id)
      .execute();

    assert.equal(finalSessions.length, 3);
    assert.ok(finalSessions[2].revokedAt === null);
  });
});
