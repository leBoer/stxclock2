import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HomeMainComponent } from './homeMain.component';
import { HomePageComponent } from './home-page/home-page.component';
import { homeRoutes } from './home-router.module';


import { ClockService } from '../clock.service';
import { SortPipe } from '../sort.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(homeRoutes),
  ],
  declarations: [
    HomeMainComponent,
    HomePageComponent,
    SortPipe
  ],
  providers: [ClockService]
})
export class HomeModule { }
