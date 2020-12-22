import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { FilterClass, InvoiceDetails, InvoiceItemDetails, InvoiceUpdation, InvoiceUpdation1 } from 'app/models/invoice-details';

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
  GetInvoiceItemDetailsByHeaderID(HeaderID: number): Observable<InvoiceItemDetails[] | string> {
    return this._httpClient.get<InvoiceItemDetails[]>(
      `${this.baseAddress}api/PODConfirmation/GetInvoiceItemDetailsByHeaderID?HeaderID=${HeaderID}`
    )
      .pipe(catchError(this.errorHandler));
  }

  GetInvoiceItemDetailsByID(UserID: Guid, ID: number): Observable<InvoiceItemDetails[] | string> {
    return this._httpClient.get<InvoiceItemDetails[]>(
      `${this.baseAddress}api/PODConfirmation/GetInvoiceItemDetailsByID?UserID=${UserID}&ID=${ID}`
    )
      .pipe(catchError(this.errorHandler));
  }

  GetInvoiceItemDetailsByUserAndID(UserCode: string, ID: number): Observable<InvoiceItemDetails[] | string> {
    return this._httpClient.get<InvoiceItemDetails[]>(
      `${this.baseAddress}api/PODConfirmation/GetInvoiceItemDetailsByUserAndID?UserCode=${UserCode}&ID=${ID}`
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
  GetAllSavedInvoicesByUserID(UserID: Guid): Observable<InvoiceDetails[] | string> {
    return this._httpClient
      .get<InvoiceDetails[]>(
        `${this.baseAddress}api/PODConfirmation/GetAllSavedInvoicesByUserID?UserID=${UserID}`
      )
      .pipe(catchError(this.errorHandler));
  }
  GetAllSavedInvoices(): Observable<InvoiceDetails[] | string> {
    return this._httpClient
      .get<InvoiceDetails[]>(
        `${this.baseAddress}api/PODConfirmation/GetAllSavedInvoices`
      )
      .pipe(catchError(this.errorHandler));
  }
  FilterSavedInvoices(StartDate: string, EndDate: string, InvoiceNumber: string,
    Organization: string, Division: string, Plant: string, CustomerName: string): Observable<InvoiceDetails[] | string> {
    return this._httpClient.get<InvoiceDetails[]>(
      `${this.baseAddress}api/PODConfirmation/FilterSavedInvoices?StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&Organization=${Organization}&Division=${Division}&Plant=${Plant}&CustomerName=${CustomerName}`
    )
      .pipe(catchError(this.errorHandler));
  }
  FilterSavedInvoiceByUserID(UserID: Guid, CurrentPage: number, Records: number, StartDate: string, EndDate: string, InvoiceNumber: string,
    Organization: string, Division: string, Plant: string, CustomerName: string): Observable<InvoiceDetails[] | string> {
    return this._httpClient.get<InvoiceDetails[]>(
      `${this.baseAddress}api/PODConfirmation/FilterSavedInvoicesByUserID?UserID=${UserID}&CurrentPage=${CurrentPage}&Records=${Records}&StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&Organization=${Organization}&Division=${Division}&Plant=${Plant}&CustomerName=${CustomerName}`
    )
      .pipe(catchError(this.errorHandler));
  }
  FilterSavedInvoicesByUserID(filterClass: FilterClass): Observable<InvoiceDetails[] | string> {
    return this._httpClient.post<InvoiceDetails[]>(
      `${this.baseAddress}api/PODConfirmation/FilterSavedInvoicesByUserID`, filterClass
    )
      .pipe(catchError(this.errorHandler));
  }
  DownloadSavedInvoicesByUserID(filterClass: FilterClass): Observable<Blob | string> {
    return this._httpClient.post(
      `${this.baseAddress}api/PODConfirmation/DownloadSavedInvoicesByUserID`, filterClass,
      {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
      .pipe(catchError(this.errorHandler));
  }
  GetAllPartiallyConfirmedInvoices(): Observable<InvoiceDetails[] | string> {
    return this._httpClient
      .get<InvoiceDetails[]>(
        `${this.baseAddress}api/PODConfirmation/GetAllPartiallyConfirmedInvoices`
      )
      .pipe(catchError(this.errorHandler));
  }
  FilterPartiallyConfirmedInvoice(CurrentPage: number, Records: number, StartDate: string, EndDate: string, InvoiceNumber: string,
    Organization: string, Division: string, Plant: string, CustomerName: string): Observable<InvoiceDetails[] | string> {
    return this._httpClient.get<InvoiceDetails[]>(
      `${this.baseAddress}api/PODConfirmation/FilterPartiallyConfirmedInvoices?CurrentPage=${CurrentPage}&Records=${Records}&StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&Organization=${Organization}&Division=${Division}&Plant=${Plant}&CustomerName=${CustomerName}`
    )
      .pipe(catchError(this.errorHandler));
  }
  FilterPartiallyConfirmedInvoices(filterClass: FilterClass): Observable<InvoiceDetails[] | string> {
    return this._httpClient.post<InvoiceDetails[]>(
      `${this.baseAddress}api/PODConfirmation/FilterPartiallyConfirmedInvoices`, filterClass
    )
      .pipe(catchError(this.errorHandler));
  }
  DownloadPartiallyConfirmedInvoices(filterClass: FilterClass): Observable<Blob | string> {
    return this._httpClient.post(
      `${this.baseAddress}api/PODConfirmation/DownloadPartiallyConfirmedInvoices`, filterClass,
      {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      }
    )
      .pipe(catchError(this.errorHandler));
  }
  UpdatePartiallyConfirmedInvoiceStatus(HeaderID: number, Status: string, ModifiedBy: string): Observable<InvoiceDetails[] | string> {
    return this._httpClient
      .get<InvoiceDetails[]>(
        `${this.baseAddress}api/PODConfirmation/UpdatePartiallyConfirmedInvoiceStatus?HeaderID=${HeaderID}&Status=${Status}`
      )
      .pipe(catchError(this.errorHandler));
  }
}

