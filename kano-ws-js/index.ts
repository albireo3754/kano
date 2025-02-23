import type { Message } from "kano-js-share";

const server = Bun.serve({
    fetch(req, server) {
        // console.log(req.url); // the request URL
        server.upgrade(req);
    }, // upgrade logic
    websocket: {
        async message(ws, message) {
            if (typeof message === "string") {
                let msg: Message = JSON.parse(message);
                console.log("Message received", msg);

                // ws.send(JSON.stringify(msg));
                server.publish("the-group-chat", JSON.stringify(msg));

                msg.text = await generateText();
                msg._id = Math.random().toString(36).substring(7);
                msg.user._id = "server";
                server.publish("the-group-chat", JSON.stringify(msg));
            } // a message is received
        },
        open(ws) {
            ws.subscribe("the-group-chat");
        }, // a socket is opened
        close(ws, code, message) { }, // a socket is closed
        drain(ws) { }, // the socket is ready to receive more data
    },
    port: 8080, // the port to listen on
});

async function generateText(): Promise<string> {
    return "Hello World!";
}