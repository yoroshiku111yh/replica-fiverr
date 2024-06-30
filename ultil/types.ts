import { Request } from "express";

export enum ROLE_LEVEL {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface RequestWithUser<T> extends Request {
    user: T
}

export enum STATUS_BOOKING {
    CANCELED = "canceled",
    COMPLETED = "completed",
    DOING = "doing",
    FAILED = "failed",
    CREATED = "created",
    PENDING = "pending"
}