export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface Message {
    _id: string;
    text: string;
    createdAt: number;
    user: User;
    image?: string;
    video?: string;
    audio?: string;
    system?: boolean;
    sent?: boolean;
    received?: boolean;
    pending?: boolean;
    // quickReplies?: QuickReplies;
}