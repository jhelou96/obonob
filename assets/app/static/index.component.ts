import {AfterViewInit, Component} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {AppComponent} from "../app.component";
import {AppService} from "../app.service";

declare var jquery:any;
declare var $ :any;

/**
 * Component used to display home page
 */
@Component({
    selector: 'app-index',
    templateUrl: './index.component.html'
})
/**
 * Static component used to display homepage
 */
export class IndexComponent implements AfterViewInit {
    /**
     * List of last 4 projects
     */
    projects;

    constructor(
        private titleService: Title,
        private translateService: TranslateService,
        private appComponent: AppComponent,
        private appService: AppService
    ) {}

    ngOnInit() {
        this.translateService.get('STATIC.HOME').subscribe((res: string) => {
            this.titleService.setTitle(res.projectSharingPlatform + ' - ' + this.appComponent.appName);
        });

        //Get the list of projects, shuffle them and display 4 of them
        this.appService.getProjects().subscribe(projects => this.projects = projects.slice(projects.length-4, projects.length));

        if (this.appComponent.isLoggedIn())
            this.appComponent.updateUserNotifications();
    }

    ngAfterViewInit() {
        //Import SEO SVG animation scripts
        $.getScript( "/js/noframework.waypoints.min.js" );
        $.getScript( "/js/banner.js" );
        $.getScript( "/js/seobanner.js" );

        //Import SVG animated icons scripts
        $.getScript( "/LivIconsEvo/js/tools/DrawSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/MorphSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/verge.min.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.defaults.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.min.js" );
    }
}