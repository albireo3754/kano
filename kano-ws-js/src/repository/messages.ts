import { MySql2Database } from "drizzle-orm/mysql2";
import { messagesTable, type MessageEntity } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Message } from "kano-js-share";



export default class MessageRepository {
    constructor(private db: MySql2Database) {
    }

    messageToEntity(message: Message): any {
        return {
            ...message,
            createdAt: message.createdAt.toString(),
        }
    }

    async saveMessage(message: Message): Promise<void> {
        console.log("Saving message", message);
        let messageId = await this.db.insert(messagesTable).values(this.messageToEntity(message)).$returningId();
    }

    async findAllMessage(conversationId: string): Promise<Message[]> {
        console.log("Finding all messages for conversation", conversationId);
        try {
            return (await this.db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).execute()).map((message: MessageEntity) => {
                console.log("find Message", message);
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
        } catch (error) {
            console.error(error);
            return [];
        }

    }
}
