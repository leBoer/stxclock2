import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Exchange } from './exchange';

@Injectable()
export class ExchangeService {
  private exchangesUrl = '/api';

  constructor(private http: Http) {}

  getExchanges(): Promise<Exchange[]> {
    return this.http.get(this.exchangesUrl)
      .toPromise()
      .then(response => response.json().exchanges.results as Exchange[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  getExchange(id: number): Promise<Exchange> {
    return this.getExchanges()
      .then(exchanges => exchanges.find(exchange => exchange.id === id));
  }
}
