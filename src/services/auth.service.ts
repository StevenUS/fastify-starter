import { Kysely } from 'kysely';
import { Database, UserSession } from '../types/database.js';
import { randomBytes } from 'crypto';
import { verifyPassword } from '../lib/argon.js';
import { handleDbError } from '../lib/util.js';
import { CreateSessionParams, LoginParams } from '../types/auth.js';

export class AuthService {
  private SESSION_TOKEN_BYTES = 32;
  private SESSION_EXPIRATION_DAYS = 30;

  constructor(private db: Kysely<Database>) {}

  private generateToken(bytes: number = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  private getExpirationDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  async createSession(
    params: CreateSessionParams,
  ): Promise<{ session: UserSession; token: string }> {
    const { userId, userAgent, ipAddress } = params;
    const sessionToken = this.generateToken(this.SESSION_TOKEN_BYTES);
    const expiresAt = this.getExpirationDate(this.SESSION_EXPIRATION_DAYS).toISOString();

    try {
      const session = await this.db
        .insertInto('userSession')
        .values({
          userId: userId,
          token: sessionToken,
          userAgent: userAgent,
          ipAddress: ipAddress,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { session, token: sessionToken };
    } catch (error) {
      throw handleDbError(error, { userId }, 'Failed to create session');
    }
  }

  async validateSession(token: string): Promise<{ isValid: boolean; session?: UserSession }> {
    try {
      const now = new Date().toISOString();
      const session = await this.db
        .selectFrom('userSession')
        .selectAll()
        .where('token', '=', token)
        .where('expiresAt', '>', now)
        .where('revokedAt', 'is', null)
        .executeTakeFirst();

      if (!session) {
        return { isValid: false };
      }

      return { isValid: true, session };
    } catch (error) {
      throw handleDbError(error, { token }, 'Failed to validate session');
    }
  }

  async revokeSession(token: string): Promise<void> {
    try {
      await this.db
        .updateTable('userSession')
        .set({ revokedAt: new Date().toISOString() })
        .where('token', '=', token)
        .execute();
    } catch (error) {
      throw handleDbError(error, { token }, 'Failed to revoke session');
    }
  }

  async revokeAllSessions(userId: number, excludeToken?: string): Promise<void> {
    try {
      let query = this.db
        .updateTable('userSession')
        .set({ revokedAt: new Date().toISOString() })
        .where('userId', '=', userId);

      if (excludeToken) {
        query = query.where('token', '!=', excludeToken);
      }

      await query.execute();
    } catch (error) {
      throw handleDbError(error, { userId }, 'Failed to revoke all sessions');
    }
  }

  async login(params: LoginParams) {
    try {
      const { username, password, userAgent, ipAddress } = params;

      // Find user by username
      const user = await this.db
        .selectFrom('user')
        .select(['id', 'password', 'disabledAt'])
        .where('name', '=', username)
        .executeTakeFirst();

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.disabledAt) {
        throw new Error('Account is disabled');
      }

      // Verify password
      const isValidPassword = await verifyPassword(user.password, password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Create new session
      const { session, token } = await this.createSession({
        userId: user.id,
        userAgent,
        ipAddress,
      });

      return {
        userId: user.id,
        sessionId: session.id,
        token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      throw handleDbError(error, { username: params.username }, 'Login failed');
    }
  }

  async logout(token: string): Promise<void> {
    await this.revokeSession(token);
  }

  async getUserSessions(userId: number, currentSessionId: number) {
    const sessions = await this.db
      .selectFrom('userSession')
      .select(['id', 'userAgent', 'ipAddress', 'createdAt', 'expiresAt', 'revokedAt'])
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .execute();

    return sessions.map((session) => ({
      sessionId: session.id,
      userId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: new Date(session.createdAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
      isCurrent: session.id === currentSessionId,
      isActive: !session.revokedAt && new Date(session.expiresAt) > new Date(),
    }));
  }
}
