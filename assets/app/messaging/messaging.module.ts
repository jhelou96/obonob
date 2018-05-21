import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {InboxComponent} from "./inbox.component";
import {messagingRouting} from "./messaging.routing";
import {ThreadComponent} from "./thread.component";
import {
    MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatOptionModule
} from "@angular/material";
import {LMarkdownEditorModule} from "ngx-markdown-editor";
import {MessagingService} from "./messaging.service";
import {MomentModule} from "angular2-moment";
import {NgxPaginationModule} from "ngx-pagination";
import {MarkdownModule} from "ngx-markdown";

@NgModule({
    declarations: [
        InboxComponent,
        ThreadComponent
    ],
    imports: [
        MatAutocompleteModule,
        MatOptionModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        messagingRouting,
        LMarkdownEditorModule,
        MomentModule,
        NgxPaginationModule,
        MarkdownModule.forChild()
    ],
    providers: [
        MessagingService
    ]
})
/**
 * Messaging module package
 */
export class MessagingModule {

}