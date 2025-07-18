import { Type } from '@sinclair/typebox';

export const BaseResponse = {
  error: Type.Object({
    statusCode: Type.Number(),
    error: Type.String(),
    message: Type.String(),
  }),
  success: Type.Object({
    success: Type.Boolean(),
  }),
};
