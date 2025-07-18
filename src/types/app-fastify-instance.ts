import {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

// To use a global type provider (TypeBoxTypeProvider), we define a type that extends FastifyInstance.
// This type ensures the app instance and routes are properly typed when using the type provider.
// Example in app.ts:
// const app: AppFastifyInstance = Fastify().withTypeProvider<TypeBoxTypeProvider>();
// See: https://fastify.dev/docs/latest/Reference/Type-Providers/#type-definition-of-fastifyinstance--typeprovider
export type AppFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;
