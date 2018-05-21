/**
 * Frontend model for the user
 */
export class User {
    constructor(
        public username: string,
        public password: string,
        public email?: string,
        public id?: string,
        public avatar?: string,
        public level?: number,
        public biography?: string,
        public keys?: string[],
        public registrationDate?: Date,
        public lastActionDate?: Date
    ) {}
}