import { Injectable } from '@angular/core';
import { InvoiceDetails } from 'app/models/invoice-details';

@Injectable({
  providedIn: 'root'
})
export class ShareParameterService {
  public CurrentInvoiceDetail: InvoiceDetails;
  constructor() { }
  SetInvoiceDetail(InvoiceDetail: InvoiceDetails): void {
    this.CurrentInvoiceDetail = InvoiceDetail;
  }
  GetInvoiceDetail(): InvoiceDetails {
    return this.CurrentInvoiceDetail;
  }
}
