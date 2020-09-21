import { Injectable } from '@angular/core';
import { FilterClass, InvoiceDetails } from 'app/models/invoice-details';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: InvoiceDetails;
  public CurrentDashboardFilterClass: FilterClass = new FilterClass();
  public CurrentInvoiceFilterClass: FilterClass = new FilterClass();
  public CurrentReportFilterClass: FilterClass = new FilterClass();
  public CurrentSavedInvoiceFilterClass: FilterClass = new FilterClass();
  public CurrentPartialInvoiceFilterClass: FilterClass = new FilterClass();
  constructor() { }
  SetInvoiceDetail(InvoiceDetail: InvoiceDetails): void {
    this.CurrentInvoiceDetail = InvoiceDetail;
  }
  GetInvoiceDetail(): InvoiceDetails {
    return this.CurrentInvoiceDetail;
  }
  SetDashboardFilterClass(filterClass: FilterClass): void {
    this.CurrentDashboardFilterClass = filterClass;
  }
  GetDashboardFilterClass(): FilterClass {
    return this.CurrentDashboardFilterClass;
  }
  SetInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentInvoiceFilterClass = filterClass;
  }
  GetInvoiceFilterClass(): FilterClass {
    return this.CurrentInvoiceFilterClass;
  }
  SetReportFilterClass(filterClass: FilterClass): void {
    this.CurrentReportFilterClass = filterClass;
  }
  GetReportFilterClass(): FilterClass {
    return this.CurrentReportFilterClass;
  }
  SetSavedInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentSavedInvoiceFilterClass = filterClass;
  }
  GetSavedInvoiceFilterClass(): FilterClass {
    return this.CurrentSavedInvoiceFilterClass;
  }
  SetPartialInvoiceFilterClass(filterClass: FilterClass): void {
    this.CurrentPartialInvoiceFilterClass = filterClass;
  }
  GetPartialInvoiceFilterClass(): FilterClass {
    return this.CurrentPartialInvoiceFilterClass;
  }
}
