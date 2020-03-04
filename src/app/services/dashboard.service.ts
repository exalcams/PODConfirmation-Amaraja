import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { InvoiceDetails } from 'app/models/invoice-details';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
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
    CreateInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PODConfirmation/CreateInvoiceDetails`,
                invoice,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json'
                    })
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllInvoiceDetails(userID: Guid): Observable<InvoiceDetails[] | string> {
        return this._httpClient
            .get<InvoiceDetails[]>(
                `${this.baseAddress}api/PODConfirmation/GetAllInvoiceDetails?UserID=${userID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PODConfirmation/UpdateInvoiceDetails`,
                invoice,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json'
                    })
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteInvoiceDetails(invoice: InvoiceDetails): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PODConfirmation/DeleteInvoiceDetails`,
                invoice,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json'
                    })
                }
            )
            .pipe(catchError(this.errorHandler));
    }
}
