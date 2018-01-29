import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from "./app.component";
import { IndexComponent } from "./static/index.component";
import { routing } from "./app.routing";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {AuthService} from "./auth/auth.service";
import {AuthComponent} from "./auth/auth.component";
import {AlertModule} from "./alerts/alert.module";
import {ClickOutsideModule} from "ng-click-outside";
import {AlertComponent} from "./alerts/alert.component";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ProjectsComponent} from "./projects/projects.component";

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
        ProjectsComponent
    ],
    imports: [
        BrowserModule,
        routing,
        HttpClientModule,
        AlertModule,
        ClickOutsideModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [AppComponent],
    providers: [AuthService]
})
export class AppModule {
    param = {value: 'world'};

    constructor(translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');
    }
}