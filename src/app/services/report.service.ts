import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  GetFilteredInvoiceDetails(UserID: Guid, Status: string, StartDate: string, EndDate: string): Observable<ReportInvoice[] | string> {
    return this._httpClient.get<ReportInvoice[]>(
      `${this.baseAddress}api/Report/GetFilteredInvoiceDetails?UserID=${UserID}&Status=${Status}&StartDate=${StartDate}&EndDate=${EndDate}`
    )
      .pipe(catchError(this.errorHandler));
  }
}
