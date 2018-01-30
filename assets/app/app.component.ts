import {Component, ElementRef, HostListener} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
/**
 * Main App component
 */
export class AppComponent {
    constructor(private authService: AuthService, private _eref: ElementRef) {}

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
}