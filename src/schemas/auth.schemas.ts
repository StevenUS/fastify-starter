import { Type } from '@sinclair/typebox';
import { BaseResponse } from './shared.schemas.js';

// ========== Request/Response Bodies ==========
const Login = {
  body: Type.Object({
    username: Type.String({ minLength: 3, maxLength: 50 }),
    password: Type.String({ minLength: 8 }),
  }),
  response: Type.Object({
    userId: Type.Number(),
    expiresAt: Type.String({ format: 'date-time' }),
  }),
};

const Session = {
  response: Type.Object({
    sessionId: Type.Number(),
    userId: Type.Number(),
    userAgent: Type.Union([Type.String(), Type.Null()]),
    ipAddress: Type.Union([Type.String(), Type.Null()]),
    createdAt: Type.String({ format: 'date-time' }),
    expiresAt: Type.String({ format: 'date-time' }),
    isActive: Type.Boolean(),
  }),
};

const SessionList = Type.Array(
  Type.Intersect([
    Type.Omit(Session.response, ['isActive']),
    Type.Object({
      isCurrent: Type.Boolean(),
    }),
  ]),
);

const RevokeSession = {
  body: Type.Object({
    sessionId: Type.Number(),
  }),
};

// ========== Route Schemas ==========
export const loginSchema = {
  body: Login.body,
  response: {
    200: Login.response,
    401: BaseResponse.error,
  },
};

export const sessionSchema = {
  response: {
    200: Session.response,
    401: BaseResponse.error,
    404: BaseResponse.error,
  },
};

export const sessionsSchema = {
  response: {
    200: SessionList,
    401: BaseResponse.error,
  },
};

export const revokeSessionSchema = {
  body: RevokeSession.body,
  response: {
    200: BaseResponse.success,
    401: BaseResponse.error,
    404: BaseResponse.error,
  },
};

export const logoutSchema = {
  response: {
    200: BaseResponse.success,
    401: BaseResponse.error,
    500: BaseResponse.error,
  },
};
