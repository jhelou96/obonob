/**
 * Frontend model for the project category entity
 */
export class Category {
    constructor(
        public id: string,
        public name: string,
        public description?: string
    ) {}
}