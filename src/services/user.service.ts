import { Kysely } from 'kysely';
import { Database } from '../types/database.js';
import { hashPassword } from '../lib/argon.js';
import { handleDbError } from '../lib/util.js';

export class UserService {
  constructor(private db: Kysely<Database>) {}
  private USER_TYPE = 2;

  async createUser(userData: { name: string; password: string; type?: number }) {
    const hashedPassword = await hashPassword(userData.password);

    try {
      return await this.db.transaction().execute(async (trx) => {
        // Check if user already exists
        const existingUser = await trx
          .selectFrom('user')
          .select(['id'])
          .where('name', '=', userData.name)
          .executeTakeFirst();

        if (existingUser) {
          throw new Error('User with this name already exists');
        }

        // Create new user
        const result = await trx
          .insertInto('user')
          .values({
            name: userData.name,
            password: hashedPassword,
            type: this.USER_TYPE,
            createdAt: new Date().toISOString(),
          })
          .returning(['id', 'name', 'type', 'createdAt'])
          .executeTakeFirstOrThrow();

        return {
          id: result.id,
          name: result.name,
          type: result.type,
          createdAt: new Date(result.createdAt),
        };
      });
    } catch (error) {
      throw handleDbError(error, { ...userData, password: '[REDACTED]' }, 'Failed to create user');
    }
  }

  async findUserById(id: number) {
    try {
      return await this.db
        .selectFrom('user')
        .select(['id', 'name', 'type', 'createdAt', 'disabledAt'])
        .where('id', '=', id)
        .executeTakeFirst();
    } catch (error) {
      throw handleDbError(error, { id }, 'Failed to find user by ID');
    }
  }

  async findUserByName(name: string) {
    try {
      return await this.db
        .selectFrom('user')
        .select(['id', 'name', 'password', 'type', 'createdAt', 'disabledAt'])
        .where('name', '=', name)
        .executeTakeFirst();
    } catch (error) {
      throw handleDbError(error, { name }, 'Failed to find user by name');
    }
  }

  async disableUser(id: number) {
    try {
      await this.db
        .updateTable('user')
        .set({ disabledAt: new Date().toISOString() })
        .where('id', '=', id)
        .execute();
    } catch (error) {
      throw handleDbError(error, { id }, 'Failed to diable user by id');
    }
  }
}
