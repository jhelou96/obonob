import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {AppComponent} from "../app.component";

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html'
})
/**
 * Static component used to display presentation page
 */
export class AboutComponent implements OnInit {
    /**
     * Random image picked from public/images/mascot folder
     */
    pageHeaderImage;

    constructor(
        private titleService: Title,
        private translateService: TranslateService,
        private appComponent: AppComponent
    ) {}

    ngOnInit() {
        this.translateService.get('STATIC.ABOUT').subscribe((res: string) => {
            this.titleService.setTitle(res.about + ' - ' + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();
    }
}