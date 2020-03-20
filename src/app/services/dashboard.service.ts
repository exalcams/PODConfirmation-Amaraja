import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { InvoiceDetails, ApproverDetails, DeliveryCount } from 'app/models/invoice-details';

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

    GetConfirmedInvoiceDetails(userID: Guid): Observable<InvoiceDetails[] | string> {
        return this._httpClient
            .get<InvoiceDetails[]>(
                `${this.baseAddress}api/PODConfirmation/GetConfirmedInvoiceDetails?UserID=${userID}`
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

    ApproveSelectedInvoices(invoices: ApproverDetails): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}api/PODConfirmation/ApproveSelectedInvoices`,
                invoices,
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json'
                    })
                }
            )
            .pipe(catchError(this.errorHandler));
    }


    GetDeliveryCount(userID: Guid): Observable<DeliveryCount | string> {
        return this._httpClient
            .get<DeliveryCount>(
                `${this.baseAddress}api/Dashboard/GetDeliveryCount?UserID=${userID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetDeliveredInvoices(userID: Guid, Condition: string): Observable<InvoiceDetails[] | string> {
        return this._httpClient
            .get<InvoiceDetails[]>(
                `${this.baseAddress}api/Dashboard/GetDeliveredInvoices?UserID=${userID}&Condition=${Condition}`
            )
            .pipe(catchError(this.errorHandler));
    }
}
