import {User} from "../auth/user.model";

/**
 * Frontend model for the projects
 */
export class Project {
    constructor(
        public name: string,
        public address: string,
        public description: string,
        public category: string,
        public author?: User,
        public banner?: string,
        public thumbnail?: string,
        public website?: string,
        public about?: ProjectAboutSection,
        public media?: ProjectMedia[],
        public posts?: ProjectPost[],
        public events?: ProjectEvent[],
        public reviews?: ProjectReview[],
        public partners?: ProjectPartner[],
        public subscribers?: string[]
    ) {}
}

/**
 * Frontend model for the about section of a project
 */
export class ProjectAboutSection {
    constructor(
        public about: string,
        public twitter: string,
        public facebook: string,
        public youtube: string,
        public github: string
    ) {}
}

/**
 * Frontend model for the projects media
 */
export class ProjectMedia {
    constructor(
        public type: string,
        public src: string,
        public caption: string,
        public id?: string
    ) {}
}

/**
 * Frontend model for the projects posts
 */
export class ProjectPost {
    constructor(
        public content: string,
        public media: ProjectPostMedia[],
        public author?: User,
        public id?: string,
        public date?: Date,
        public likes?: ProjectPostLike[],
        public replies?: ProjectPostReply[]
    ) {}
}

/**
 * Frontend model for the projects posts reactions
 */

export class ProjectPostLike {
    constructor(
        public author: User
    ) {}
}

/**
 * Frontend model for the projects replies
 */
export class ProjectPostReply {
    constructor(
        public content: string,
        public author?: User,
        public date?: Date,
        public id?: string
    ) {}
}

/**
 * Frontend model for the projects posts media
 */
export class ProjectPostMedia {
    constructor(
        public type: string,
        public src: string
    ) {}
}

/**
 * Frontend model for the projects events
 */
export class ProjectEvent {
    constructor(
        public description: string,
        public date: Date,
        public id?: string
    ) {}
}

/**
 * Frontend model for the projects reviews
 */
export class ProjectReview {
    constructor(
        public content: string,
        public rating: number,
        public id?: string,
        public author?: User,
        public date?: Date,
        public likes?: ProjectReviewLike[]
    ) {}
}

/**
 * Frontend model for the projects reviews likes
 */
export class ProjectReviewLike {
    constructor(
        public author?: User
    ) {}
}

/**
 * Frontend model for the projects partner pages
 */
export class ProjectPartner {
    constructor(
        public address: string,
        public id?: string,
        public name?: string,
        public description?:string,
        public thumbnail?:string,
        public index?: number
    ) {}
}