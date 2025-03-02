// export * from './util';

export interface SimpleUser {
    id: string;
    // name: string;
    // email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface CreateMessageDTO {
    requestId: string;
    text: string;
    conversationId: string;
}

export interface Message {
    id: string;
    conversationId: string;
    requestId?: string;
    text: string;
    createdAt: BigInt;
    userId: number;

    image?: string;
    video?: string;
    audio?: string;
    system?: boolean;
    sent?: boolean;
    received?: boolean;
    pending?: boolean;
    // quickReplies?: QuickReplies;
}

