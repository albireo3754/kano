import type { CreateMessageDTO, Message } from "kano-js-share";
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import MessageRepository from "./repository/messages";
import { serialize } from "./utils/json";

// You can specify any property from the mysql2 connection options
const db = drizzle({ connection: { uri: process.env.DATABASE_URL, supportBigNumbers: true, bigNumberStrings: true, } });
const messageRepository = new MessageRepository(db);


const server = Bun.serve({
    fetch(req, server) {
        // console.log(req.url); // the request URL
        server.upgrade(req);
    }, // upgrade logic
    websocket: {

        async message(ws, messagePayload) {
            if (typeof messagePayload === "string") {
                let userId = 1;

                // const users = await db.select().from(usersTable).where(eq(usersTable.id, 1)).execute();

                let msg: CreateMessageDTO = JSON.parse(messagePayload);
                console.log("Message received", msg);

                // ws.send(JSON.stringify(msg));
                let message = await createMessage(msg, userId);
                let messageId = await messageRepository.saveMessage(message);
                server.publish("the-group-chat", serialize(message));

                message.text = await generateText();

                msg.text = message.text;
                let serverMessage = await createMessage(msg, 2);
                await messageRepository.saveMessage(serverMessage);

                server.publish("the-group-chat", serialize(serverMessage));
            } // a message is received
        },
        open(ws) {
            console.log("Socket opened");
            ws.subscribe("the-group-chat");

            messageRepository.findAllMessage("1").then((messages) => {
                messages.forEach((message) => {
                    ws.send(serialize(message));
                });
            });

            // server.publish("the-group-chat", "Hello World!");
        }, // a socket is opened
        close(ws, code, message) { }, // a socket is closed
        drain(ws) { }, // the socket is ready to receive more data
    },
    port: 8080,
});

async function generateText(): Promise<string> {
    return "Hello World!";
}

async function createMessage(messageDTO: CreateMessageDTO, userId: number): Promise<Message> {
    console.log("Message created", messageDTO);

    let message: Message = {
        id: Math.random().toString(36).substring(7),
        requestId: messageDTO.requestId,
        text: messageDTO.text,
        createdAt: BigInt(Date.now()),
        conversationId: messageDTO.conversationId,
        userId,
    };

    console.log("Message created ", message, messageDTO.text);

    return message;

}

