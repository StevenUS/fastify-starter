import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import envPlugin from '../src/plugins/env.plugin.js';
import dbPlugin from '../src/plugins/db.plugin.js';
import userServicePlugin from '../src/plugins/user.plugin.js';
import { Kysely } from 'kysely';
import { Database } from '../src/types/database.js';
import { migrate } from '../scripts/migrate.js';

type TestContext = {
  app: Awaited<ReturnType<typeof buildTestApp>>;
  db: Kysely<Database>;
};

async function buildTestApp() {
  const app = Fastify();

  try {
    // Register only the plugins needed for user service tests
    await app.register(envPlugin);
    await app.register(dbPlugin);

    // run migrations on the in memory db insatnce created by the plugin
    await migrate(app.db);

    await app.register(userServicePlugin);

    return app;
  } catch (error) {
    console.error('Failed to build test app:', error);
    throw error;
  }
}

test.describe('UserService', () => {
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
    // Clean up users table before each test
    await context.db.deleteFrom('user').execute();
  });

  test('should create a user', async () => {
    const userData = {
      name: 'testuser',
      password: 'testpass123',
      type: 2, // regular user
    };

    const user = await context.app.userService.createUser(userData);

    assert.ok(user.id, 'Should return a user with an ID');
    assert.equal(user.name, userData.name);
    assert.equal(user.type, userData.type);
    assert.ok(user.createdAt, 'Should have a creation timestamp');
  });

  test('should find user by name', async () => {
    // First create a user
    const userData = {
      name: 'findme',
      password: 'testpass123',
      type: 2,
    };
    await context.app.userService.createUser(userData);

    // Then try to find them
    const foundUser = await context.app.userService.findUserByName('findme');

    assert.ok(foundUser, 'Should find the user');
    assert.equal(foundUser?.name, userData.name);
  });

  test('should disable a user', async () => {
    // Create a user first
    const user = await context.app.userService.createUser({
      name: 'disableme',
      password: 'testpass123',
      type: 2,
    });

    // Disable the user
    await context.app.userService.disableUser(user.id);

    // Verify they're disabled
    const disabledUser = await context.app.userService.findUserById(user.id);
    assert.ok(disabledUser?.disabledAt, 'Should have disabled timestamp');
  });

  test('should not create duplicate usernames', async () => {
    const userData = {
      name: 'duplicate',
      password: 'testpass123',
      type: 2,
    };

    // First creation should work
    await context.app.userService.createUser(userData);

    // Second should fail
    try {
      await context.app.userService.createUser(userData);
      assert.fail('Should have thrown an error');
    } catch (error) {
      if (error instanceof Error) {
        assert.match(error.message, /already exists/);
      } else {
        assert.fail('Caught unknown error type');
      }
    }
  });
});
