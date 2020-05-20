import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { InvoiceDetails, InvoiceItemDetails, InvoiceUpdation, InvoiceUpdation1 } from 'app/models/invoice-details';

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

  UpdateInvoiceItems(invoiceUpdation: InvoiceUpdation): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}api/PODConfirmation/UpdateInvoiceItems`,
        invoiceUpdation,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  ConfirmInvoiceItems(invoiceUpdation: InvoiceUpdation1): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}api/PODConfirmation/ConfirmInvoiceItems`,
        invoiceUpdation,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  AddInvoiceAttachment(headerID: number, CreatedBy: string, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach(x => {
        formData.append(x.name, x, x.name);
      });
    }
    formData.append('HeaderID', headerID.toString());
    formData.append('CreatedBy', CreatedBy);
    return this._httpClient.post<any>(`${this.baseAddress}api/PODConfirmation/AddInvoiceAttachment`,
      formData,
    ).pipe(catchError(this.errorHandler));
  }

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

