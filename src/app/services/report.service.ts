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

  GetFilteredInvoiceDetails(UserID: Guid, Status: string, StartDate: string, EndDate: string, InvoiceNumber: string, CustomerName: string): Observable<ReportInvoice[] | string> {
    return this._httpClient.get<ReportInvoice[]>(
      `${this.baseAddress}api/Report/GetFilteredInvoiceDetails?UserID=${UserID}&Status=${Status}&StartDate=${StartDate}&EndDate=${EndDate}&InvoiceNumber=${InvoiceNumber}&CustomerName=${CustomerName}`
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
}
