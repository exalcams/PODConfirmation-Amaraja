import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { InvoiceDetails, InvoiceItemDetails } from 'app/models/invoice-details';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  baseAddress: string;
  NotificationEvent: Subject<any>;

  GetNotification(): Observable<any> {
    return this.NotificationEvent.asObservable();
  }

  TriggerNotification(eventName: string): void {
    this.NotificationEvent.next(eventName);
  }

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    this.baseAddress = _authService.baseAddress;
    this.NotificationEvent = new Subject();
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // Invoice Details
  // CreateInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
  //     return this._httpClient
  //         .post<any>(
  //             `${this.baseAddress}api/PODConfirmation/CreateInvoiceDetails`,
  //             invoice,
  //             {
  //                 headers: new HttpHeaders({
  //                     'Content-Type': 'application/json'
  //                 })
  //             }
  //         )
  //         .pipe(catchError(this.errorHandler));
  // }

  GetInvoiceItemDetailsByID(UserID: Guid, ID: number): Observable<InvoiceItemDetails[] | string> {
    return this._httpClient.get<InvoiceItemDetails[]>(
        `${this.baseAddress}api/PODConfirmation/GetInvoiceItemDetailsByID?UserID=${UserID}&ID=${ID}`
      )
      .pipe(catchError(this.errorHandler));
  }

  // UpdateInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
  //     return this._httpClient
  //         .post<any>(
  //             `${this.baseAddress}api/PODConfirmation/UpdateInvoiceDetails`,
  //             invoice,
  //             {
  //                 headers: new HttpHeaders({
  //                     'Content-Type': 'application/json'
  //                 })
  //             }
  //         )
  //         .pipe(catchError(this.errorHandler));
  // }

  // DeleteInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
  //     return this._httpClient
  //         .post<any>(
  //             `${this.baseAddress}api/PODConfirmation/DeleteInvoiceDetails`,
  //             invoice,
  //             {
  //                 headers: new HttpHeaders({
  //                     'Content-Type': 'application/json'
  //                 })
  //             }
  //         )
  //         .pipe(catchError(this.errorHandler));
  // }
}
