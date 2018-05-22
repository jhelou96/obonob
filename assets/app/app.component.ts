import {Component, OnInit} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import * as moment from 'moment';
import {AppService} from "./app.service";
import {NotificationsService} from "./notifications/notifications.service";
import {User} from "./auth/user.model";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
/**
 * Main App component
 */
export class AppComponent implements OnInit {
    /**
     * App name for child components
     */
    appName = "oBonoB";

    /**
     * User data if logged in
     */
    user: User;

    notifications: Notification[] = [];

    constructor(
        private appService: AppService,
        private authService: AuthService,
        private notificationsService: NotificationsService
    ) {}


    ngOnInit() {
        //Set language for date and time
        moment.locale('fr-fr');

        //After first connection is established, server will send its socket ID --> Used later in the login to map user ID to server socket
        this.appService.getSocketId().subscribe(
            (data: any) => {
                //If user is logged in --> Map user to socket
                if(this.isLoggedIn())
                    this.appService.mapUserToSocket().subscribe();
            }
        );

        //If user is logged in, get his data, update his notifications and listen to eventual new notifications for live time update
        if(this.isLoggedIn()) {
            this.authService.getUser(localStorage.getItem('userId'), 'id').subscribe(user => this.user = user);
            this.updateUserNotifications();
            this.listenToNotification();
        } else
            this.user = null;
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
     * Method executed when user clicks on the logout button
     */
    onLogout() {
        this.authService.logout();
        this.user = null;
    }

    /**
     * Hides the navbar when user clicks on a nav link in mobile view
     */
    hideNavbar() {
        if($(".navbar-toggler").is(":visible"))
            $('.navbar-collapse').collapse('toggle');
    }

    /**
     * JQuery method toggling user sidebar menu when navbar avatar is clicked
     */
    showSidebar() {
        $("#sidebar").animate({width:'toggle'}, 350);
    }

    /**
     * JQuery method hiding user sidebar menu when user clicks outside of sidebar
     */
    hideSidebar() {
        if($("#sidebar").is(':visible'))
            $("#sidebar").animate({width:'toggle'}, 350);
    }

    /**
     * JQuery method toggling notifications dropdown menu when notifications icon is clicked
     */
    onToggleNotifications() {
        if($(".notifications-dropdown").is(":visible"))
            $(".notifications-dropdown").fadeOut();
        else
            $(".notifications-dropdown").fadeIn();
    }

    /**
     * JQuery method hiding notifications dropdown menu when user clicks outside of dropdown menu
     */
    hideNotifications() {
        $(".notifications-dropdown").fadeOut();
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
     * Listens to eventual new notifications sent from the backend
     */
    listenToNotification() {
        this.appService.getNotification().subscribe(
            (notification: Notification) => {
                this.notifications.unshift(notification);

                //Play notification sound
                var audio = new Audio();
                audio.src = "notification.mp3";
                audio.load();
                audio.play();

                //Animate notifications bell
                $(".notifications-bell").addLiviconEvo({ name: "bell.svg", size: "40px", strokeColor: "#7a8992", colorsOnHover: "lighter", eventType: "none", autoPlay: true, repeat: "loop" });
            }
        );
    }

    /**
     * Updates user notifications with a list of the last 5 notifications
     */
    updateUserNotifications() {
        //Retrieve the list of user's unread notifications
        this.notificationsService.getNotifications('unread').subscribe(
            (notifications: Notification[]) => {
                this.notifications = notifications.slice(0, 4);

                //Notification bell in the navbar
                if(notifications.length == 0) //If no new notifications --> Display basic bell
                    $(".notifications-bell").addLiviconEvo({ name: "bell.svg", style: "lines", colorsOnHover: "lighter", size: "40px", strokeColor: "#7a8992", animated: false });
                else //If new notifications --> Highlight bell
                    $(".notifications-bell").addLiviconEvo({ name: "bell.svg", size: "40px", strokeColor: "#7a8992", colorsOnHover: "lighter", animated: false });
            }
        );
    }

    /**
     * Chooses randomly a header image for the pages header
     * @returns {string} Random image
     */
    randomPageHeaderImage() {
        var images = [
            'monkey-angry.png',
            'monkey-beer.png',
            'monkey-calling.png',
            'monkey-coffee.png',
            'monkey-confused.png',
            'monkey-dancing.png',
            'monkey-hanging.png',
            'monkey-kiss.png',
            'monkey-laughing.png',
            'monkey-no.png',
            'monkey-sad.png',
            'monkey-sleeping.png',
            'monkey-thumbsUp.png'
        ];

        var i = Math.floor(Math.random() * images.length); //Random number in the array range

        return images[i];
    }

    /**
     * Shuffles (randomize) an array
     * @param array Array to be shuffled
     * @returns Shuffled array
     */
    shuffle(array) {
        for(var j, x, i = array.length; i; j = Math.random() * i, x = array[--i], array[i] = array[j], array[j] = x);
        return array;
    };
}