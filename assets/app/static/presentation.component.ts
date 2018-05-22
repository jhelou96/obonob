import {Component, OnInit} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";
import {AppComponent} from "../app.component";

declare var jquery:any;
declare var $ :any;

@Component({
    selector: 'app-presentation',
    templateUrl: './presentation.component.html'
})
/**
 * Static component used to display presentation page
 */
export class PresentationComponent implements OnInit {
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
        this.translateService.get('STATIC.PRESENTATION').subscribe((res: any) => {
            this.titleService.setTitle(res.presentation + ' - ' + this.appComponent.appName);
        });

        //Randomly chosen page image
        this.pageHeaderImage = this.appComponent.randomPageHeaderImage();
    }

    ngAfterViewInit() {
        //Import SVG animated icons scripts
        $.getScript( "/LivIconsEvo/js/tools/DrawSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/MorphSVGPlugin.min.js" );
        $.getScript( "/LivIconsEvo/js/tools/verge.min.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.defaults.js" );
        $.getScript( "/LivIconsEvo/js/LivIconsEvo.min.js" );
    }
}