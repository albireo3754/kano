import type { CreateMessageDTO, Message } from "kano-js-share";
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import MessageRepository from "./repository/messages";

// You can specify any property from the mysql2 connection options
const db = drizzle({ connection: { uri: process.env.DATABASE_URL } });
const messageRepository = new MessageRepository(db);


const server = Bun.serve({
    fetch(req, server) {
        // console.log(req.url); // the request URL
        server.upgrade(req);
    }, // upgrade logic
    websocket: {
        async message(ws, messagePayload) {
            if (typeof messagePayload === "string") {

                // const users = await db.select().from(usersTable).where(eq(usersTable.id, 1)).execute();
                let msg: CreateMessageDTO = JSON.parse(messagePayload);
                console.log("Message received", msg);

                // ws.send(JSON.stringify(msg));
                let message = await createMessage(msg);
                server.publish("the-group-chat", JSON.stringify(message));

                msg.text = await generateText();
                msg.user.id = "1";
                msg.createdAt = Date.now();
                let serverMessage = await createMessage(msg);

                server.publish("the-group-chat", JSON.stringify(serverMessage));
            } // a message is received
        },
        open(ws) {
            ws.subscribe("the-group-chat");

            messageRepository.findAllMessage("1").then((messages) => {


                messages.forEach((message) => {
                    ws.send(JSON.stringify(message));
                });
            });

            server.publish("the-group-chat", "Hello World!");
        }, // a socket is opened
        close(ws, code, message) { }, // a socket is closed
        drain(ws) { }, // the socket is ready to receive more data
    },
    port: 8080, // the port to listen on
});

async function generateText(): Promise<string> {
    return "Hello World!";
}

async function createMessage(messageDTO: CreateMessageDTO): Promise<Message> {
    console.log("Message created", messageDTO);

    let message: Message = {
        id: Math.random().toString(36).substring(7),
        requestId: messageDTO.requestId,
        text: messageDTO.text,
        createdAt: messageDTO.createdAt,
        user: messageDTO.user,
    };

    return message;

}

