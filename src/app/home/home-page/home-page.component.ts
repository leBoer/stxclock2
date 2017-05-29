import { Component, OnInit } from '@angular/core';


import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

import { Exchange } from '../../exchange';
import { Name } from '../../name';
import { ClockService } from "../../clock.service";

export class Name {
  ticker: string;
  name: string;
}
const NAMES: Name[] = [
  { ticker: 'NV', name: 'Euronext'},
  { ticker: 'FWB', name: 'Frankfurt Stock Exchange'},
  { ticker: 'HKEX', name: 'Hong Kong Stock Exchange'},
  { ticker: 'KRX', name: 'Korea Exchange'},
  { ticker: 'LSE', name: 'London Stock Exchange'},
  { ticker: 'NASDAQ', name: 'NASDAQ'},
  { ticker: 'NYSE', name: 'New York Stock Exchange'},
  { ticker: 'OSE', name: 'Oslo Stock Exchange'},
  { ticker: 'SIX', name: 'SIX Swiss Exchange'},
  { ticker: 'SSE', name: 'Shanghai Stock Exchange'},
  { ticker: 'SZSE', name: 'Shenzhen Stock Exchange'},
  { ticker: 'TSE', name: 'Tokyo Stock Exchange'},
];

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  exchanges: Exchange[];
  names: Name[];
  meCheck: boolean = false;
  names = NAMES;


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
      }, 100);
    }
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  };

  buttonTest(): any {
    console.log(this.exchanges);
    this.clockService.testingfunction();
  }
  launchCalender() {
    let timer = setInterval(() => {
      if (typeof this.exchanges !== 'undefined' && this.exchanges.length > 5) {
        this.clockService.holidayBuilder();
        clearInterval(timer);
      }
    }, 1000);
  }
}