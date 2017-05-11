import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactPageComponent } from './contact-page/contact-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: ContactPageComponent, pathMatch: 'full' }
    ])
  ],
  declarations: [ContactPageComponent]
})
export class ContactModule { }
