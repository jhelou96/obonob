import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {ProjectsService} from "./projects.service";
import {
    Project, ProjectAboutSection, ProjectEvent, ProjectMedia, ProjectPartner, ProjectPost, ProjectPostMedia,
    ProjectPostReply, ProjectReview
} from "./project.model";
import {AuthService} from "../auth/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import 'hammerjs';
import {AppService} from "../app.service";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../auth/user.model";
import {NotificationsService} from "../notifications/notifications.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-projects-project',
    templateUrl: './project.component.html'
})
export class ProjectComponent implements OnInit {
    /**
     * User's data
     * Null if user is logged out
     */
    user: User = null;

    /**
     * Project address retrieved from URL
     */
    address: string;

    /**
     * Project data
     */
    project: Project;

    /**
     * Form used to edit the about section
     */
    editAboutForm: FormGroup;

    /**
     * Form used to add a partner page
     */
    addPartnerPageForm: FormGroup;

    /**
     * Form used to add a new event
     */
    newEventForm: FormGroup;

    /**
     * Form used to add a review
     */
    addReviewForm: FormGroup;

    /**
     * Form used to edit project info
     */
    editProjectInfoForm: FormGroup;

    /**
     * Form used to add a new image
     */
    addImageForm: FormGroup;

    /**
     * Form used to add a new video
     */
    addVideoForm: FormGroup;

    /**
     * Form used to add a new post
     */
    addPostForm: FormGroup;

    /**
     * Form used to add a reply to a post
     */
    addPostReplyForm: FormGroup;

    /**
     * Form used to add an image to a new post
     */
    addPostImageForm: FormGroup;

    /**
     * List of media uploaded from the post form
     */
    addPostFormMedia: ProjectPostMedia[] = [];

    /**
     * Boolean variable used to verify if user is the project author
     */
    isAuthor: boolean;

    /**
     * Boolean variable used to check if project is available on social medias
     */
    isOnSocialMedias: boolean;

    /**
     * Markdown editor options
     */
    markdownEditorOptions = {
        "hideIcons": ['TogglePreview', 'fullScreen']
    };

    /**
     * Days to be displayed on the project calendar
     */
    calendarDays: number[][];

    /**
     * Month displayed on calendar
     */
    calendarMonth: number = new Date().getMonth() + 1;

    /**
     * Year displayed on calendar
     */
    calendarYear: number = new Date().getFullYear();

    /**
     * Array of events on a certain day
     */
    calendarEvents: ProjectEvent[] = [];

    /**
     * Boolean used to display or hide calendar events description
     */
    calendarEventsVisible: boolean = false;

    /**
     * Project rating based on reviews
     */
    rating: number = 0;

    /**
     * Project number of subscribers formatted
     */
    nbSubscribers: string;

    /**
     * Date picker filter used to disable dates previous to today
     * @param {Date} d Date to compare with current date
     * @returns {boolean} True if d >= today's date
     */
    datepickerFilter = (d: Date): boolean => {
        var todayDate = new Date();

        //Remove time from comparison
        todayDate.setHours(0,0,0,0);
        d.setHours(0,0,0,0);

        if(d >= todayDate)
            return true;
        return false;
    };

    constructor(
        private appService: AppService,
        private titleService: Title,
        private route: ActivatedRoute,
        private projectsService: ProjectsService,
        private authService: AuthService,
        private appComponent: AppComponent,
        private translateService: TranslateService,
        private notificationsService: NotificationsService
    ) {}

    ngOnInit() {
        //Retrieve project address from URL
        this.route.params.subscribe(params => {
            this.address = params['project'];

            //Retrieve project data
            this.projectsService.getProject(this.address).subscribe(
                (project: Project) => {
                    this.project = project;

                    //Page title
                    this.translateService.get('PROJECTS.PROJECT').subscribe((res: any) => {
                        this.titleService.setTitle(this.project.name + " - " + res.projects + " - " + this.appComponent.appName);
                    });

                    //Get user's username if logged in and update his notifications regarding the project
                    if(this.isLoggedIn()) {
                        this.user = this.appComponent.user;

                        //Mark notifications concerning the project as read and update user's notifications
                        this.notificationsService.markNotificationsAsRead([1, 2, 3], project.address).subscribe(data => { this.appComponent.updateUserNotifications(); });
                    }

                    //Form for editing the about section
                    this.editAboutForm = new FormGroup({
                        about: new FormControl((typeof this.project.about == 'undefined') ? null : this.project.about.about, Validators.required),
                        twitter: new FormControl((typeof this.project.about == 'undefined') ? null : this.project.about.twitter, Validators.pattern("http(?:s)?:\\/\\/(?:www\\.)?twitter\\.com\\/([a-zA-Z0-9_]+)")),
                        facebook: new FormControl((typeof this.project.about == 'undefined') ? null : this.project.about.facebook, Validators.pattern("(?:(?:http|https):\\/\\/)?(?:www.)?facebook.com\\/(?:(?:\\w)*#!\\/)?(?:pages\\/)?(?:[?\\w\\-]*\\/)?(?:profile.php\\?id=(?=\\d.*))?([\\w\\-]*)?")),
                        youtube: new FormControl((typeof this.project.about == 'undefined') ? null : this.project.about.youtube, Validators.pattern("((http|https):\\/\\/|)(www\\.|)youtube\\.com\\/(channel\\/|user\\/)[a-zA-Z0-9\\-]{1,}")),
                        github: new FormControl((typeof this.project.about == 'undefined') ? null : this.project.about.github, Validators.pattern("http(?:s)?:\\/\\/(?:www\\.)?github\\.com\\/([a-zA-Z0-9_-]+)\\/([a-zA-Z0-9_-]+)"))
                    });

                    //Form for editing the project info
                    this.editProjectInfoForm = new FormGroup({
                        name: new FormControl(this.project.name, Validators.required),
                        description: new FormControl(this.project.description, [Validators.required, Validators.maxLength(30)]),
                        banner: new FormControl(null, Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")),
                        thumbnail: new FormControl(null, Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")),
                        website: new FormControl((typeof this.project.website == 'undefined') ? null : this.project.website, Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$"))
                    });

                    //Check if user has the rights to manage the project
                    if(this.isLoggedIn() && this.project.author.username == this.user.username)
                        this.isAuthor = true;
                    else
                        this.isAuthor = false;

                    //Check if project is available on social medias
                    if(this.project.about && (this.project.about.facebook || this.project.about.twitter || this.project.about.github || this.project.about.youtube))
                        this.isOnSocialMedias = true;
                    else
                        this.isOnSocialMedias = false;

                    //Update project calendar
                    this.updateCalendar(new Date());

                    //Compute project rating
                    this.computeRating();

                    //Format project nb of subscribers
                    this.formatNbSubscribers();
                });

            //Form for adding a new image
            this.addImageForm = new FormGroup({
                image: new FormControl(null, [Validators.required, Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")]),
                caption: new FormControl(null)
            });

            //Form for adding a new video
            this.addVideoForm = new FormGroup({
                video: new FormControl(null, [Validators.required, Validators.pattern("/^(?:https?:\\/\\/)?(?:m\\.|www\\.)?(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))((\\w|-){11})(?:\\S+)?$/")]),
                caption: new FormControl(null)
            });

            //Form for adding a new post
            this.addPostForm = new FormGroup({
                content: new FormControl(null, Validators.required)
            });

            //Form for adding an image to a new post
            this.addPostImageForm = new FormGroup({
                image: new FormControl(null, [Validators.required, Validators.pattern("^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")])
            });

            //Form for adding a reply to a post
            this.addPostReplyForm = new FormGroup({
                content: new FormControl(null, Validators.required)
            });

            //Form for adding a new event
            this.newEventForm = new FormGroup({
                description: new FormControl(null, Validators.required),
                date: new FormControl(null, Validators.required)
            });

            //Form for adding a review
            this.addReviewForm = new FormGroup({
                content: new FormControl(null, Validators.required),
                rating: new FormControl(null, Validators.required)
            });

            //Form for adding a partner page
            this.addPartnerPageForm = new FormGroup({
                address: new FormControl(null, Validators.required)
            });

            //Enable Bootstrap tooltips
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            });
        });
    }

    ngAfterViewInit() {
        //Import SVG animated icons scripts
        $.getScript( "/LivIconsEvo/js/tools/DrawSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/MorphSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/verge.min.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.defaults.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.min.js" );
    }

    /**
     * Checks if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.authService.isLoggedIn();
    }

    /**
     * Toggles modal when edit about section button is clicked
     */
    onEditAboutSection() {
        $("#editAboutSectionModal").css("z-index", "1500");
        $("#editAboutSectionModal").modal({backdrop: true});
    }

    /**
     * Hides modal when close button is clicked
     */
    onHideAboutSectionModal() {
        $("#editAboutSectionModal").modal('hide');
    }

    /**
     * Updates about section once form is submitted
     */
    updateAboutSection() {
        this.project.about = new ProjectAboutSection(
            this.editAboutForm.value.about,
            this.editAboutForm.value.twitter,
            this.editAboutForm.value.facebook,
            this.editAboutForm.value.youtube,
            this.editAboutForm.value.github
        );

        this.projectsService.updateProject(this.project).subscribe(project => {
            this.project = project;

            $("#editAboutSectionModal").modal('hide');
        });
    }

    /**
     * Toggles modal when add image button is clicked
     */
    onAddImageMedia() {
        $("#addImageModal").css("z-index", "1500");
        $("#addImageModal").modal({backdrop: true});
    }

    /**
     * Hides modal when close button is clicked
     */
    onHideAddImageModal() {
        $("#addImageModal").modal('hide');
    }

    /**
     * Adds new image in medias section once form is submitted
     */
    addImageMedia() {
        const media = new ProjectMedia('image', this.addImageForm.value.image, this.addImageForm.value.caption);

        this.projectsService.addMedia(this.project, media).subscribe(project => {
            this.project = project;

            this.addImageForm.reset();
            $("#addImageModal").modal('hide');
        });
    }

    /**
     * Removes media once delete link is clicked
     */
    onRemoveMedia(media: ProjectMedia) {
        this.projectsService.removeMedia(this.project, media).subscribe(project => {
            this.project = project;
        });
    }

    /**
     * Toggles modal when add video button is clicked
     */
    onAddVideoMedia() {
        $("#addVideoModal").css("z-index", "1500");
        $("#addVideoModal").modal({backdrop: true});
    }

    /**
     * Hides modal when close button is clicked
     */
    onHideAddVideoModal() {
        $("#addVideoModal").modal({backdrop: true});
    }

    /**
     * Adds new video to medias section once form is submitted
     */
    addVideoMedia() {
        const media = new ProjectMedia('video', this.addVideoForm.value.video, this.addVideoForm.value.caption);

        this.projectsService.addMedia(this.project, media).subscribe(project => {
            this.project = project;

            this.addVideoForm.reset();
            $("#addVideoModal").modal('hide');
        });
    }

    /**
     * Adds a new post once form is submitted
     */
    addPost() {
        const post = new ProjectPost(this.addPostForm.value.content, this.addPostFormMedia);

        //Update project
        this.projectsService.addPost(this.project, post).subscribe(
            project => {
                    this.addPostForm.reset(); //Reset form if post has been added
                    this.addPostFormMedia = []; //Clear array of media
                    this.project = project; //Update project with the updated and populated project returned
            });
    }

    /**
     * Removes post once delete link is clicked
     */
    onRemovePost(post: ProjectPost) {
        this.projectsService.removePost(this.project, post).subscribe(project => {
            this.project = project;
        });
    }

    /**
     * Toggles modal when image button is clicked in new post form
     */
    onAddPostImage() {
        $("#addPostImageModal").css("z-index", "1500");
        $("#addPostImageModal").modal({backdrop: true});
    }

    /**
     * Hides modal when close button is clicked
     */
    onHideAddPostImageModal() {
        $("#addPostImageModal").modal('hide');
    }

    /**
     * Adds image to array of post images once form is submitted
     * Images of the array will be downloaded and saved later once the add post form is submitted
     */
    addPostImage() {
        this.addPostFormMedia.push(new ProjectPostMedia("image", this.addPostImageForm.value.image));

        this.addPostImageForm.reset();
        $("#addPostImageModal").modal('hide');
    }

    /**
     * Removes an image from the list of images to be submitted with the new post form
     * @param index Index of media to be removed
     */
    onRemovePostImage(index) {
        this.addPostFormMedia.splice(this.addPostFormMedia.indexOf(index), 1);
    }

    /**
     * Computes the difference in days between the current datetime and a specific one
     * @param date Date to which threshold is applied
     * @returns {number} Number of days
     */
    dateThreshold(date) {
        const formattedDate = new Date(date);
        return ((Date.now() - formattedDate.getTime()) / (1000*3600 * 24));
    }

    /**
     * Toggles modal when reply to post button is clicked
     * @param id ID of the post modal concerned
     */
    onShowPostReplies(id) {
        $("#postReplies-" + id).css("z-index", "1500");
        $("#postReplies-" + id).modal({backdrop: true});
    }

    /**
     * Hides post replies modal when close button is clicked
     * @param id ID of of the post modal concerned
     */
    onHidePostRepliesModal(id) {
        $("#postReplies-" + id).modal('hide');
    }

    /**
     * Adds a new reply to a post once the form is submitted
     * @param {ProjectPost} post Post concerned by the reply
     */
    addPostReply(post: ProjectPost) {
        const reply = new ProjectPostReply(this.addPostReplyForm.value.content);

        //Update project
        this.projectsService.addPostReply(this.project, post, reply).subscribe(
            project => {
                this.addPostReplyForm.reset(); //Reset form if reply has been added

                //Update statically array until next refresh to prevent glitch with modal
                const postIndex = this.project.posts.indexOf(post);
                reply.author = this.user;
                reply.date = new Date();
                reply.id = project.posts[postIndex].replies[0].id; //Set reply ID = ID of last added reply
                this.project.posts[postIndex].replies.splice(0, 0, reply);
            });
    }

    /**
     * Removes a post reply
     * @param {ProjectPost} post Post to be updated
     * @param {ProjectPostReply} reply Reply to be removed
     */
    onRemovePostReply(post: ProjectPost, reply: ProjectPostReply) {
        this.projectsService.removePostReply(this.project, post, reply).subscribe(
            project => {
                //Update statically array until next refresh to prevent glitch with modal
                const postIndex = this.project.posts.indexOf(post);
                this.project.posts[postIndex].replies.splice(this.project.posts[postIndex].replies.indexOf(reply), 1);
        });
    }

    /**
     * Updates the user like status on a specific post when like button is pressed
     * If member already liked topic, like is removed
     * If member didn't like the topic before, like is added
     * @param {ProjectPost} post Post concerned by the like
     */
    onPostLike(post: ProjectPost) {
        //Update project
        this.projectsService.updatePostLikes(this.project, post).subscribe(
            project => {
                this.project = project;
            });
    }

    /**
     * Toggles modal when edit project info button is clicked
     */
    onEditProjectInfo() {
        $("#editProjectInfoModal").css("z-index", "1500");
        $("#editProjectInfoModal").modal({backdrop: true});
    }

    /**
     * Hides edit project info modal when close button is clicked
     */
    onHideEditProjectInfoModal() {
        $("#editProjectInfoModal").modal('hide');
    }

    /**
     * Updates project info once form is submitted
     */
    updateProjectInfo() {
        this.project.name = this.editProjectInfoForm.value.name;
        this.project.description = this.editProjectInfoForm.value.description;
        this.project.website = this.editProjectInfoForm.value.website;

        //If thumbnail image has been provided
        if(this.editProjectInfoForm.value.thumbnail)
            this.project.thumbnail = this.editProjectInfoForm.value.thumbnail;

        //If banner image has been provided
        if(this.editProjectInfoForm.value.banner)
            this.project.banner = this.editProjectInfoForm.value.banner;

        this.projectsService.updateProject(this.project).subscribe(project => {
            this.project = project;

            $("#editProjectInfoModal").modal('hide');

            //Update page title
            this.titleService.setTitle(this.project.name + " - " + this.appComponent.appName);
        });
    }

    /**
     * Updates project calendar based on month and year given
     * @param date Date (month and year) at which calendar should display a view
     */
    updateCalendar(date) {
        this.calendarDays = []; //Calendar containing the weeks
        var week = []; //Each week contain 7 days from monday to sunday
        var day = []; //Each day contain the date of this day, a boolean stating if day belong to current month, a boolean stating if it is today's date and the array of events occuring on that day
        var events = [];

        var todayDate = new Date();

        //Get current month and year
        var month = date.getMonth();
        var year = date.getFullYear();

        //Get first day of month --> If not monday, add days of previous month
        var firstDay = new Date(year, month, 1);

        //Number of days of previous month to add to calendar
        if(firstDay.getDay() == 0) //If sunday
            var i = 6;
        else
            var i = firstDay.getDay() - 1;
        while (i > 0) {
            //If month = january, we need to decrement year by 1
            if (month == 1) {
                var lastDayOfPrevMonth = new Date(year - 1, month, 0).getDate();
                day.push(lastDayOfPrevMonth - i + 1);
                day.push(false);
                day.push(false);

                week.push(day);
                day = [];
            } else {
                var lastDayOfPrevMonth = new Date(year, month, 0).getDate();
                day.push(lastDayOfPrevMonth - i + 1);
                day.push(false);
                day.push(false);

                week.push(day);
                day = [];
            }

            i--;
        }

        //Add all the days of the month
        var lastDay = new Date(year, month+1, 0);
        for (var i = 1; i <= lastDay.getDate(); i++) {
            //If 7 dates have been added, create a new week
            if(week.length == 7) {
                this.calendarDays.push(week);
                week = [];
            }

            day.push(i);
            day.push(true);

            //Check if day is today's date
            if(year == todayDate.getFullYear() && month == todayDate.getMonth() && i == todayDate.getDate())
                day.push(true);
            else
                day.push(false);

            //Loop through project events
            this.project.events.forEach(function(event) {
                //Check if event corresponds to date
               if(event.date.getFullYear() == year && event.date.getMonth() == month && event.date.getDate() == i) {
                   //Check if event expired
                   if(event.date.getFullYear() <= todayDate.getFullYear() && event.date.getMonth() <= todayDate.getMonth() && event.date.getDate() < todayDate.getDate())
                       event.isExpired = true;
                   else
                       event.isExpired = false;


                   events.push(event);
               }
            });

            if(events.length > 0) {
                day.push(events);
                events = [];
            }

            week.push(day);
            day = [];
        }

        //If last day of the month is not a sunday, add days of next month
        var i = 1;
        while(i < (7 - lastDay.getDay() + 1) && lastDay.getDay() != 0) {
            day.push(i);
            day.push(false);
            day.push(false);

            week.push(day);
            day = [];

            i++;
        }

        this.calendarDays.push(week);
    }

    /**
     * Updates calendar to next month once next button is clicked
     */
    onCalendarNextMonth() {
        //If current month is december, we go to january of next year
        if(this.calendarMonth == 12) {
            this.calendarMonth = 1;
            this.calendarYear += 1;

            this.updateCalendar(new Date(this.calendarYear, this.calendarMonth-1, 1));
        } else {
            this.calendarMonth += 1;
            this.updateCalendar(new Date(this.calendarYear, this.calendarMonth-1, 1));
        }
    }

    /**
     * Updates calendar to previous month once previous button is clicked
     */
    onCalendarPrevMonth() {
        //If current month is january, we go to december of previous year
        if(this.calendarMonth == 1) {
            this.calendarMonth = 12;
            this.calendarYear -= 1;

            this.updateCalendar(new Date(this.calendarYear, this.calendarMonth-1, 1));
        } else {
            this.calendarMonth -= 1;
            this.updateCalendar(new Date(this.calendarYear, this.calendarMonth-1, 1));
        }
    }

    /**
     * Adds a new event once form is submitted
     */
    onAddNewEvent() {
        var event = new ProjectEvent(this.newEventForm.value.description, this.newEventForm.value.date);
        this.projectsService.addNewEvent(this.project, event).subscribe(project => {
            this.project = project;

            //Update calendar
            this.calendarYear = this.newEventForm.value.date.getFullYear();
            this.calendarMonth = this.newEventForm.value.date.getMonth()+1;
            this.updateCalendar(this.newEventForm.value.date);

            this.newEventForm.reset();
        });
    }

    /**
     * Displays list of events when a day on the calendar is clicked
     * @param day Day clicked
     */
    onViewEvents(day) {
        this.calendarEvents = [];

        //If day contains events
        if(day[3]) {
            this.calendarEvents = day[3];

            this.calendarEventsVisible = true;
        }
    }

    /**
     * Removes an event when remove link is clicked
     * @param event Event to be removed
     */
    onRemoveEvent(event) {
        this.projectsService.removeEvent(this.project, event).subscribe(project => {
            this.project = project;

            this.updateCalendar(new Date());
            this.calendarEventsVisible = false;
        });
    }

    /**
     * Toggles reviews modal when evaluate button is clicked
     */
    onViewReviews() {
        $("#reviewsModal").css("z-index", "1500");
        $("#reviewsModal").modal({backdrop: true});
    }

    /**
     * Hides reviews modal when close button is clicked
     */
    onHideReviewsModal() {
        $("#reviewsModal").modal('hide');
    }

    /**
     * Adds a new review once form is submitted
     */
    addReview() {
        var review = new ProjectReview(this.addReviewForm.value.content, this.addReviewForm.value.rating);

        this.projectsService.addReview(this.project, review).subscribe(project => {
            this.addReviewForm.reset();

            this.project = project;

            //Update rating
            this.computeRating();
        });
    }

    /**
     * Updates the user like status on a specific review when like button is pressed
     * If member already liked review, like is removed
     * If member didn't like the review before, like is added
     * @param {ProjectReview} review Review concerned by the like
     */
    onReviewLike(review: ProjectReview) {
        //Update project
        this.projectsService.updateReviewLikes(this.project, review).subscribe(
            project => {
                this.project = project;
            });
    }

    /**
     * Removes a review
     * @param {ProjectReview} review Review to be removed
     */
    onRemoveReview(review: ProjectReview) {
        this.projectsService.removeReview(this.project, review).subscribe(project => {
            this.project = project;

            //Update rating
            this.computeRating();
        });
    }

    /**
     * Computes a project rating based on its reviews
     */
    computeRating() {
        this.rating = 0;

        for(var i = 0; i < this.project.reviews.length; i++)
            this.rating += this.project.reviews[i].rating;

        this.rating = this.rating / this.project.reviews.length;
    }

    /**
     * Toggles partner pages updating modal when edit button is clicked
     */
    onUpdatePartnerPages() {
        $("#updatePartnerPagesModal").css("z-index", "1500");
        $("#updatePartnerPagesModal").modal({backdrop: true});
    }

    /**
     * Hides partner pages updating modal when close button is clicked
     */
    onHideUpdatePartnerPagesModal() {
        $("#updatePartnerPagesModal").modal('hide');
    }

    /**
     * Adds a partner page when form is submitted
     */
    addPartnerPage() {
        var partner = new ProjectPartner(this.addPartnerPageForm.value.address);

        this.projectsService.addPartnerPage(this.project, partner).subscribe(project => {
            this.addReviewForm.reset();

            this.project = project;

            $("#updatePartnerPagesModal").modal('hide');
        });
    }

    /**
     * Removes a partner page when delete link is clicked
     * @param {ProjectPartner} page Page to be removed
     */
    onRemovePartnerPage(page: ProjectPartner) {
        this.projectsService.removePartnerPage(this.project, page).subscribe(project => {
            this.project = project;
        });
    }

    /**
     * Moves a partner page up in the list
     * @param {ProjectPartner} page Page to be moved
     */
    onMovePartnerPageUp(page: ProjectPartner) {
        this.projectsService.movePartnerPageInList(this.project, page, 'up').subscribe(project => {
            this.project = project;
        });
    }

    /**
     * Moves a partner page down in the list
     * @param {ProjectPartner} page Page to be moved
     */
    onMovePartnerPageDown(page: ProjectPartner) {
        this.projectsService.movePartnerPageInList(this.project, page, 'down').subscribe(project => {
            this.project = project;
        });
    }

    /**
     * Toggles list of page's partners when 'View all' button is clicked
     */
    onViewListPartnerPages() {
        $("#listPartnerPagesModal").css("z-index", "1500");
        $("#listPartnerPagesModal").modal({backdrop: true});
    }

    onHideListPartnerPagesModal() {
        $("#listPartnerPagesModal").modal('hide');
    }

    /**
     * Formats the project number of subscribers as a string
     */
    formatNbSubscribers() {
        if(this.project.subscribers.length >= 1000 && this.project.subscribers.length < 1000000)
            this.nbSubscribers =  Math.ceil(this.project.subscribers.length) / 1000 + 'K';
        else
            this.nbSubscribers = this.project.subscribers.length + '';
    }

    /**
     * Subscribes user to the project when subscribe button is clicked
     */
    onSubscribe() {
        this.projectsService.subscribeToProject(this.project).subscribe(project => {
            this.project = project;
            this.formatNbSubscribers(); //Reformat the nb of subscribers
        });
    }

    /**
     * Unsubscribes user to the project when unsubscribe button is clicked
     */
    onUnsubscribe() {
        this.projectsService.unsubscribeFromProject(this.project).subscribe(project => {
            this.project = project;
            this.formatNbSubscribers(); //Reformat the nb of subscribers
        });
    }

    /**
     * Checks if user is subscribed to the project
     * @returns {boolean}
     */
    isSubscribed() {
        if(this.isLoggedIn() && this.project.subscribers.indexOf(this.user.id) > -1)
            return true;

        return false;
    }

    /**
     * Toggles the share buttons modal when share button is clicked
     */
    onViewShareButtons() {
        $("#shareButtonsModal").css("z-index", "1500");
        $("#shareButtonsModal").modal({backdrop: true});
    }

    /**
     * Hides the share buttons modal when close button is clicked
     */
    onHideShareButtonsModal() {
        $("#shareButtonsModal").modal('hide');
    }
}