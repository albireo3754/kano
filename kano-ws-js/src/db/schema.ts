import { index, int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const usersTable = mysqlTable('users', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    age: int().notNull(),
    email: varchar({ length: 255 }).notNull(),
});

export const messagesTable = mysqlTable('messages', {
    id: varchar({ length: 255 }).primaryKey(),
    conversationId: varchar({ length: 255 }).notNull(),
    text: varchar({ length: 255 }).notNull(),
    createdAt: int().notNull(),
    userId: int().notNull(),
}, (table) => [
    index('conversation_id_idx').on(table.conversationId)
]);

export type UserEntity = typeof usersTable.$inferInsert;
export type MessageEntity = typeof messagesTable.$inferInsert;