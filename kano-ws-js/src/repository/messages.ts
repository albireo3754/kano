import { MySql2Database } from "drizzle-orm/mysql2";
import { messagesTable, type MessageEntity } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Message } from "kano-js-share";

export default class MessageRepository {
    constructor(private db: MySql2Database) {
    }

    async saveMessage(message: Message): Promise<void> {
        let messageId = this.db.insert(messagesTable).values(message).$returningId();

    }

    async findAllMessage(conversationId: string): Promise<Message[]> {
        return (await this.db.select().from(messagesTable).where(eq(messagesTable.id, conversationId)).execute()).map((message: MessageEntity) => {
            return {
                id: message.id,
                conversationId: message.conversationId,
                requestId: undefined,
                text: message.text,
                createdAt: message.createdAt,
                userId: message.userId,
                image: undefined,
                video: undefined,
                audio: undefined,
                system: undefined,
                sent: undefined,
                received: undefined,
                pending: undefined,
            };
        });
    }
}
