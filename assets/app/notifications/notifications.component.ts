import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../auth/auth.service";
import {Title} from "@angular/platform-browser";
import {AppComponent} from "../app.component";
import {NotificationsService} from "./notifications.service";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html'
})
/**
 * Notification component displaying the list of user's notifications
 */
export class NotificationsComponent implements OnInit {
    /**
     * User's notifications
     */
    notifications;

    /**
     * Current page
     * @type {number}
     */
    page = 1;

    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private titleService: Title,
        private appComponent: AppComponent,
        private authService: AuthService,
        private translateService: TranslateService,
        private router: Router,
        private notificationsService: NotificationsService
    ) {}

    ngOnInit() {
        //Page title
        this.translateService.get('NOTIFICATIONS').subscribe((res: string) => {
            this.titleService.setTitle(res.myNotifications + " - " + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();

        //If user is logged in, update his notifications
        if(this.authService.isLoggedIn())
            this.appComponent.updateUserNotifications();
        else
            this.router.navigateByUrl('/auth/login'); //If user is not logged in, page can't be accessed

        //Retrieve user's notifications
        this.notificationsService.getNotifications('all').subscribe(notifications => this.notifications = notifications);
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
}