import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {MyProjectsComponent} from "./myProjects.component";
import {projectsRouting} from "./projects.routing";
import {ClickOutsideModule} from "ng-click-outside";
import {ProjectsService} from "./projects.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    declarations: [
        MyProjectsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        projectsRouting,
        TranslateModule.forChild()
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