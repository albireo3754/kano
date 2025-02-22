const server = Bun.serve({
    fetch(req, server) {
        // console.log(req.url); // the request URL
        server.upgrade(req);
    }, // upgrade logic
    websocket: {
        message(ws, message) {

            server.publish("the-group-chat", `entered: ${message}`);
        }, // a message is received
        open(ws) {
            const msg = `enterd chat`;
            // ws.subscribe("the-group-chat");
            server.publish("the-group-chat", msg);
        }, // a socket is opened
        close(ws, code, message) { }, // a socket is closed
        drain(ws) { }, // the socket is ready to receive more data
    },
    port: 8080, // the port to listen on
});