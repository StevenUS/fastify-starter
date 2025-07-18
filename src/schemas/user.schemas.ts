import { Type } from '@sinclair/typebox';

// Define your schemas
export const GetUserParams = Type.Object({
  name: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_]+$',
  }),
});

export const UserResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  type: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  disabledAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

export const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});
