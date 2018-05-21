/**
 * Notification model
 */
import {User} from "../auth/user.model";

export class Notification {
    constructor(
        public user: User,
        public sender: User,
        public type: number,
        public data: string[],
        public date: Date,
        public isRead: boolean
    ) {}
}