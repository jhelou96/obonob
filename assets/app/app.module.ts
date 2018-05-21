import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from "./app.component";
import { IndexComponent } from "./static/index.component";
import { routing } from "./app.routing";
import {HttpClient, HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";
import {AuthService} from "./auth/auth.service";
import {AuthComponent} from "./auth/auth.component";
import {AlertModule} from "./alerts/alert.module";
import {ClickOutsideModule} from "ng-click-outside";
import {AlertComponent} from "./alerts/alert.component";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ProjectsComponent} from "./projects/projects.component";
import {AppService} from "./app.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessagingComponent} from "./messaging/messaging.component";
import {NotificationsModule} from "./notifications/notifications.module";
import {MomentModule} from "angular2-moment";
import {MarkdownModule} from "ngx-markdown";
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import {PresentationComponent} from "./static/presentation.component";
import {AboutComponent} from "./static/about.component";

//Apply style to markdown parser
export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    //Style for the code markdown
    renderer.code = (code: string, language: string) => {
        return '<pre class="line-numbers"><code class="language-' + language + '">' + code + '</code></pre>' ;
    };

    //Style for the heading markdown
    renderer.heading = (text: string) => {
        return '<h3 class="title" style="margin-top: 10px;">' + text + '</h3>';
    };

    return {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
    };
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './lang/', '.json');
}


@NgModule({
    declarations: [
        AppComponent,
        IndexComponent,
        AuthComponent,
        AlertComponent,
        ProjectsComponent,
        MessagingComponent,
        PresentationComponent,
        AboutComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        routing,
        HttpClientModule,
        HttpClientJsonpModule,
        AlertModule,
        ClickOutsideModule,
        NotificationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        MomentModule,
        MarkdownModule.forRoot({
            provide: MarkedOptions,
            useFactory: markedOptionsFactory
        })
    ],
    bootstrap: [AppComponent],
    providers: [AuthService, AppService]
})
/**
 * App module package
 */
export class AppModule {

    constructor(translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('fr');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('fr');
    }
}