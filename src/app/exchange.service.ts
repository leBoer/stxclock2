import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Exchange } from './exchange';

@Injectable()
export class ExchangeService {
  private exchangesUrl = 'https://stxclockapi.com/stxclock/api/exchanges.json';

  constructor(private http: Http) {}

  getExchanges(): Promise<Exchange[]> {
    return this.http.get(this.exchangesUrl)
      .toPromise()
      .then(response => response.json().results as Exchange[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getExchange(id: number): Promise<Exchange> {
    return this.getExchanges()
      .then(exchanges => exchanges.find(exchange => exchange.id === id));
  }

}
