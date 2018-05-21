import {User} from "../auth/user.model";

/**
 * Thread frontend model
 */
export class Thread {
    constructor(
        public subject: string,
        public participants: User[],
        public messages: ThreadMessage[],
        public author?: User,
        public id?: string,
        public isRead?: boolean
    ) {}
}

/**
 * Message frontend model
 */
export class ThreadMessage {
    constructor(
        public content: string,
        public author?: User,
        public date?: Date
    ) {}
}