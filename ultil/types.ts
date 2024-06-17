import { Request } from "express";

export enum ROLE_LEVEL {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface RequestWithUser<T> extends Request {
    user: T
}