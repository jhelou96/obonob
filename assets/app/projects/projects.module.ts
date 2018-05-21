import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {MyProjectsComponent} from "./myProjects.component";
import {projectsRouting} from "./projects.routing";
import {ProjectsService} from "./projects.service";
import {ProjectComponent} from "./project.component";
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import {MomentModule} from "angular2-moment";
import {
    MatButtonModule,
    MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatNativeDateModule, MatOptionModule, MatSelectModule
} from "@angular/material";
import {BarRatingModule} from "ngx-bar-rating";
import {ActivityComponent} from "./activity.component";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {NgxPaginationModule} from "ngx-pagination";
import {SubscriptionsComponent} from "./subscriptions.component";
import {UserProjectsComponent} from "./userProjects.component";
import {AllProjectsComponent} from "./allProjects.component";
import {MarkdownModule} from "ngx-markdown";

@NgModule({
    declarations: [
        MyProjectsComponent,
        ProjectComponent,
        ActivityComponent,
        SubscriptionsComponent,
        UserProjectsComponent,
        AllProjectsComponent
    ],
    imports: [
        MatOptionModule,
        MatSelectModule,
        MatIconModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatButtonModule,
        CommonModule,
        ReactiveFormsModule,
        projectsRouting,
        TranslateModule.forChild(),
        LMarkdownEditorModule,
        MomentModule,
        BarRatingModule,
        ShareButtonsModule.forRoot(),
        NgxPaginationModule,
        MarkdownModule.forChild()
    ],
    providers: [
        ProjectsService
    ]
})
/**
 * Projects module package
 */
export class ProjectsModule {

}