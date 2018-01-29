import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {MyProjectsComponent} from "./myProjects.component";
import {projectsRouting} from "./projects.routing";

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
    providers: []
})
export class ProjectsModule {

}