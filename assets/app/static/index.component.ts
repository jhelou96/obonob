import { Component } from "@angular/core";
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html'
})
export class IndexComponent {
    constructor(private titleService: Title) {}
    ngOnInit() {
        this.titleService.setTitle('My awesome app');
    }
}