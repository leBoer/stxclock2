//src/app/home/homeMain.component.ts

import { Component,
         OnInit } from '@angular/core';

@Component({
    selector: 'home-main',
    template: `<router-outlet></router-outlet>`
})
export class HomeMainComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}