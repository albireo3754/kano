export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;

    private constructor() { }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect(url: string): void {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        this.ws.onmessage = (event) => {
            console.log('WebSocket message received:', event.data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error', error);
        };
    }

    public sendMessage(message: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.error('WebSocket is not open. Ready state:', this.ws?.readyState);
        }
    }

    public close(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
