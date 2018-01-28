/**
 * Frontend model for the user
 */
export class User {
    constructor(
        public username: String,
        public password: String,
        public email?: String
    ) {}
}