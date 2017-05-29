import { Component, OnInit } from '@angular/core';


import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { Exchange } from '../../exchange';
import { Name } from '../../name';
import { ClockService } from "../../clock.service";


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  exchanges: Exchange[];
  names: Name[];
  meCheck: boolean = false;


  constructor( @Inject(PLATFORM_ID) private platformId: string,
    private clockService: ClockService
  ) {
    let checkIfBrowser = isPlatformBrowser(platformId);
    console.log('Check If Browser', checkIfBrowser)
  }

  getNames(): void {
    this.clockService.getNames()
      .then(names => this.names = names);
  }

  ngOnInit() {
    this.getNames();

    if (isPlatformBrowser(this.platformId)) {
      console.log('This is a Browser')


      this.clockService.fetchExchanges()
        .then(exchanges => this.exchanges = exchanges);
      
      // this.clockService.utcTime(this.exchanges)
      //   .then(exchanges => this.exchanges = exchanges);

      setInterval(() => {
        this.exchanges = this.clockService.utcTime(this.exchanges);
      }, 500);
    }
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  };

  buttonTest(): any {
    this.clockService.testingfunction();
  }
  // launchCalender() {
  //   let timer = setInterval(() => {
  //     if (typeof this.exchanges !== 'undefined' && this.exchanges.length > 5) {
  //       this.clockService.holidayBuilder();
  //       clearInterval(timer);
  //     }
  //   }, 1000);
  // }
}