import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {AlertService} from "../alerts/alert.service";
import {Category} from "./category.model";
import {User} from "../auth/user.model";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/map';
import {
    Project, ProjectEvent, ProjectMedia, ProjectPartner, ProjectPost, ProjectPostLike,
    ProjectPostMedia,
    ProjectPostReply, ProjectReview, ProjectReviewLike
} from "./project.model";
import {Router} from "@angular/router";
import {AppService} from "../app.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
/**
 * Service for the project module
 */
export class ProjectsService {
    /**
     * Translator for success and error messages received from backend server
     */
    translate;

    constructor(
        private httpClient: HttpClient,
        private alertService: AlertService,
        private router: Router,
        private appService: AppService,
        private translateService: TranslateService
    ) {
        this.translateService.get('PROJECTS').subscribe((res: string) => {
            this.translate = res;
        });
    }

    /**
     * Sends request to backend server to retrieve the list of projects
     * @returns List of projects
     */
    getProjects() {
        return this.httpClient.get(this.appService.appAddress + '/api/projects')
            .map((response: HttpResponse<Project>) => {
                let projects: Project[] = [];
                for(let project of response.obj) {
                    project = this.populateProject(project);
                    projects.push(project);
                }

                return projects;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to retrieve the list of projects of a user
     * @returns List of projects
     */
    getUserProjects(userId: string) {
        return this.httpClient.get(this.appService.appAddress + '/api/projects/users/' + userId)
            .map((response: HttpResponse<Project>) => {
                let projects: Project[] = [];
                for(let project of response.obj) {
                    project = this.populateProject(project);
                    projects.push(project);
                }

                return projects;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to get the user's activity related to all projects (posts, reviews, replies)
     * @param {string} userId ID of the user
     * @returns Array listing user's activity
     */
    getUserActivity(userId: string) {
        return this.httpClient.get(this.appService.appAddress + '/api/projects/users/' + userId + '/activity/')
            .map((response: HttpResponse<Category>) => {
                const activity = response.obj;

                return activity;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to create a new project
     * @param {Project} project Project to be created
     * @returns Project created
     */
    addProject(project: Project) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(project);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});

        return this.httpClient.post(this.appService.appAddress + '/api/projects' + params, body, {headers: headers})
            .map(data => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.projectCreated); //Throw success notification

                //Return created project
                const project = new Project(data.obj.name, data.obj.address, data.obj.description, data.obj.category);
                return project;
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to retrieve specific project
     * @param {string} address Address of project to be retrieved
     * @returns Project retrieved
     */
    getProject(address: string) {
        return this.httpClient.get(this.appService.appAddress + '/api/projects/' + address)
            .map((response: HttpResponse<Project>) => {
                return this.populateProject(response.obj);
            }).catch((error: HttpErrorResponse) => {
                if(error.status == 404)
                    this.router.navigateByUrl('/');
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to backend server to remove a specific project
     * @param {Project} project Project to be removed
     * @returns Success message if project removed
     */
    removeProject(project: Project) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + params)
            .map((response: HttpResponse<any>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.projectRemoved); //Throw success notification
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to update the project
     * @param project Project to be updated
     * @returns {Observable<any>}
     */
    updateProject(project) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(project);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/projects/' + project.address + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.projectUpdated); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a post
     * @param {Project} Project to be updated
     * @param {ProjectPost} Post to be added
     * @returns Updated project
     */
    addPost(project: Project, post: ProjectPost) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(post);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/posts' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.postAdded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a post
     * @param {Project} project Project to be updated
     * @param {ProjectPost} post Post to be removed
     * @returns Updated project
     */
    removePost(project: Project, post: ProjectPost) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/posts/' + post.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.postRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a post
     * @param {Project} project Project to be updated
     * @param {ProjectPost} post Post to which the reply is added
     * @param {ProjectPostReply} reply Reply to be added
     * @returns Updated project
     */
    addPostReply(project: Project, post: ProjectPost, reply: ProjectPostReply) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(reply);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/posts/' + post.id + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.postReplyAdded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a reply to a post
     * @param {Project} project Project to be updated
     * @param {ProjectPost} post Post to be updated
     * @param {ProjectPostReply} reply Reply to be removed
     * @returns Updated project
     */
    removePostReply(project: Project, post: ProjectPost, reply: ProjectPostReply) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/posts/' + post.id  + "/replies/" + reply.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.postReplyRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends request to the backend to update user post like status
     * @param {Project} project Project to be updated
     * @param {ProjectPost} post Post to which the like is updated
     * @returns Updated project
     */
    updatePostLikes(project: Project, post: ProjectPost) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/projects/' + project.address + '/posts/' + post.id + '/likes' + params, null, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a media
     * @param {Project} Project to be updated
     * @param {ProjectMedia} Media to be added
     * @returns Updated project
     */
    addMedia(project: Project, media: ProjectMedia) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(media);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/media' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.mediaUploaded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a media
     * @param {Project} Project to be updated
     * @param {ProjectMedia} Media to be removed
     * @returns Updated project
     */
    removeMedia(project: Project, media: ProjectMedia) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/media/' + media.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.mediaRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a new event
     * @param {Project} project Project to be updated
     * @param {ProjectEvent} event Event to be added
     * @returns Updated project
     */
    addNewEvent(project: Project, event: ProjectEvent) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(event);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/events' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.eventAdded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove an event
     * @param {Project} project Project to be updated
     * @param {ProjectEvent} event Event to be removed
     * @returns Updated project
     */
    removeEvent(project: Project, event: ProjectEvent) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/events/' + event.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.eventRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a review
     * @param {Project} project Project to be updated
     * @param {ProjectReview} review Review to be added
     * @returns Updated project
     */
    addReview(project: Project, review: ProjectReview) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(review);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/reviews' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.reviewAdded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to update review like status
     * @param {Project} project Project to be updated
     * @param {ProjectReview} review Review to which the like is updated
     * @returns Updated project
     */
    updateReviewLikes(project: Project, review: ProjectReview) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/projects/' + project.address + '/reviews/' + review.id + '/likes' + params, null, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a review
     * @param {Project} project Project to be updated
     * @param {ProjectReview} review Review to be removed
     * @returns Updated project
     */
    removeReview(project: Project, review: ProjectReview) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/reviews/' + review.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.reviewRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add a partner page
     * @param {Project} project Project to be updated
     * @param {ProjectPartners} page Page to be added as partner
     * @returns Updated project
     */
    addPartnerPage(project: Project, page: ProjectPartner) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(page);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/partners' + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.partnerPageAdded); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove a partner page
     * @param {Project} project Project to be updated
     * @param {ProjectPartner} page Partner page to be moved in the list
     * @returns Updated project
     */
    removePartnerPage(project: Project, page: ProjectPartner) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/partners/' + page.id + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.partnerPageRemoved); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }


    /**
     * Sends a request to the backend to move partner page in the list
     * @param {Project} project Project to be updated
     * @param {ProjectPartner} page Page to be moved
     * @param {string} move Position (up or down)
     * @returns Updated project
     */
    movePartnerPageInList(project: Project, page: ProjectPartner, move: string) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const body = JSON.stringify(page);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.patch(this.appService.appAddress + '/api/projects/' + project.address + '/partners/' + page.id + '/' + move + params, body, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("error", this.translate.ALERT.SUCCESS.partnerPageMoved);

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to add project to user subscriptions list
     * @param {Project} project Project to be added
     * @returns Updated project
     */
    subscribeToProject(project: Project) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.httpClient.post(this.appService.appAddress + '/api/projects/' + project.address + '/subscribers' + params, null, {headers: headers})
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.subscribed); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to remove the project from user subscriptions list
     * @param {Project} project Project to be removed
     * @returns Updated project
     */
    unsubscribeFromProject(project: Project) {
        //Send some params to the server
        const params = (localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '');

        return this.httpClient.delete(this.appService.appAddress + '/api/projects/' + project.address + '/subscribers' + params)
            .map((response: HttpResponse<Project>) => {
                this.alertService.handleAlert("success", this.translate.ALERT.SUCCESS.unsubscribed); //Throw success notification

                return this.populateProject(response.obj);
            })
            .catch((error: HttpErrorResponse) => {
                this.alertService.handleAlert("error", this.translate.ALERT.ERROR[error.error.key]);
                return Observable.throw(error);
            });
    }

    /**
     * Sends a request to the backend to retrieve user's subscriptions list
     * @param {string} user User concerned
     * @returns Projects to which the user subscribed
     */
    getUserSubscriptions(user: string) {
        return this.httpClient.get(this.appService.appAddress + '/api/projects/users/' + user + '/subscriptions/')
            .map((response: HttpResponse<Category>) => {
                const project = response.obj;

                return project;
            }).catch((error: HttpErrorResponse) => {
                return Observable.throw(error);
            });
    }

    /**
     * Populate project according to frontend model
     * @param response Backend response
     * @returns {Project} Project based on frontend model
     */
    populateProject(response) {
        //Populate posts
        let posts : ProjectPost[] = [];
        let postLikes: ProjectPostLike[] = [];
        let postReplies: ProjectPostReply[] = [];
        let postMedia: ProjectPostMedia[] = [];
        for(let post of response.posts) {
            //Populate post likes
            for (let like of post.likes)
                postLikes.push(new ProjectPostLike(new User(like.author.username, like.author.password, like.author.email, like.author._id, like.author.avatar)));
            //Populate post replies
            for (let reply of post.replies)
                postReplies.push(new ProjectPostReply(reply.content, new User(reply.author.username, reply.author.password, reply.author.email, reply.author._id, reply.author.avatar), reply.date, reply._id));
            //Populate post media
            for(let media of post.media)
                postMedia.push(new ProjectPostMedia(media.type, media.src));

            posts.push(new ProjectPost(post.content, postMedia, new User(post.author.username, post.author.password, post.author.email, post.author._id, post.author.avatar), post._id, post.date, postLikes, postReplies));

            //Clear arrays before next iteration
            postLikes = [];
            postReplies = [];
            postMedia = [];
        }

        //Populate media
        let media : ProjectMedia[] = [];
        for(let projectMedia of response.media)
            media.push(new ProjectMedia(projectMedia.type, projectMedia.src, projectMedia.caption, projectMedia._id));

        //Populate events
        let events: ProjectEvent[] = [];
        for(let event of response.events)
            events.push(new ProjectEvent(event.description, new Date(event.date), event._id));

        //Populate reviews
        let reviews: ProjectReview[] = [];
        let reviewLikes: ProjectReviewLike[] = [];
        for(let review of response.reviews) {
            for(let like of review.likes)
                reviewLikes.push(new ProjectReviewLike(like.author));

            reviews.push(new ProjectReview(review.content, review.rating, review._id, new User(review.author.username, review.author.password, review.author.email, review.author._id, review.author.avatar), new Date(review.date), reviewLikes));
        }

        //Populate partners
        let partners: ProjectPartner[] = [];
        for(let partner of response.partners)
            partners.push(new ProjectPartner(partner.project.address, partner._id, partner.project.name, partner.project.description, partner.project.thumbnail, partner.index));

        //Populate subscribers
        let subscribers: string[] = [];
        for(let subscriber of response.subscribers)
            subscribers.push(subscriber);

        const project = new Project(
            response.name,
            response.address,
            response.description,
            response.category,
            response.author,
            response.banner,
            response.thumbnail,
            response.website,
            response.about,
            media,
            posts,
            events,
            reviews,
            partners,
            subscribers
        );

        return project;
    }
}