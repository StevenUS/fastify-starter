import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  user: UserTable;
}

export interface UserTable {
  id: Generated<string>;
  name: string;
  password: string;
  type: ColumnType<number, number | undefined, number | undefined>;
  createdAt: ColumnType<Date, string | undefined, never>;
  disabledAt: ColumnType<Date | null, Date | string | undefined, Date | string | null | undefined>;
}

// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
//
// Most of the time you should trust the type inference and not use explicit
// types at all. These types can be useful when typing function arguments.
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
