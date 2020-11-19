import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { Guid } from 'guid-typescript';
import { ReportInvoice } from 'app/models/invoice-details';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  baseAddress: string;
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    this.baseAddress = _authService.baseAddress;
  }
  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }
  GetPendingInvoiceDetails(UserID: Guid): Observable<ReportInvoice[] | string> {
    return this._httpClient.get<ReportInvoice[]>(
      `${this.baseAddress}api/Report/GetPendingInvoiceDetails?UserID=${UserID}`
    )
      .pipe(catchError(this.errorHandler));
  }
  GetFilteredInvoiceDetails(UserID: Guid, CurrentPage: number, Records: number, Status: string, StartDate: string, EndDate: string, InvoiceNumber: string,
    Organization: string, Division: string, Plant: string, CustomerName: string): Observable<ReportInvoice[] | string> {
    return this._httpClient.get<ReportInvoice[]>(
      `${this.baseAddress}api/Report/GetFilteredInvoiceDetails?UserID=${UserID}&CurrentPage=${CurrentPage}&Records=${Records}&Status=${Status}&StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&Organization=${Organization}&Division=${Division}&Plant=${Plant}&CustomerName=${CustomerName}`
    )
      .pipe(catchError(this.errorHandler));
  }

  GetDivisions(): Observable<string[] | string> {
    return this._httpClient.get<string[]>(
      `${this.baseAddress}api/Report/GetDivisions`
    )
      .pipe(catchError(this.errorHandler));
  }

  DowloandPODDocument(HeaderID: number, AttachmentID: number): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}api/Report/DowloandPODDocument?HeaderID=${HeaderID}&AttachmentID=${AttachmentID}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }
  DownloadInvoiceDetails(UserID: Guid, Status: string, StartDate: string, EndDate: string, InvoiceNumber: string,
    Organization: string, Division: string, Plant: string, CustomerName: string): Observable<Blob | string> {
    return this._httpClient.get(
      `${this.baseAddress}api/Report/DownloadInvoiceDetails?UserID=${UserID}&Status=${Status}&StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&Organization=${Organization}&Division=${Division}&Plant=${Plant}&CustomerName=${CustomerName}`,
      {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
      })
      .pipe(catchError(this.errorHandler));
  }
}
