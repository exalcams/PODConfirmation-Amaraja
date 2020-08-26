import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { InvoiceDetails, ApproverDetails, ReportInvoice, StatusTemplate } from 'app/models/invoice-details';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ReportService } from 'app/services/report.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-delivery-compliance-report',
  templateUrl: './delivery-compliance-report.component.html',
  styleUrls: ['./delivery-compliance-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DeliveryComplianceReportComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  MenuItems: string[];
  isProgressBarVisibile: boolean;
  allInvoicesCount: number;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  FilteredInvoiceDetails: ReportInvoice[] = [];
  displayedColumns: string[] = [
    'ODIN',
    'INV_NO',
    'ITEM_NO',
    'INV_DATE',
    'INV_TYPE',
    'PLANT',
    'CUSTOMER',
    'CUSTOMER_NAME',
    'LR_NO',
    'LR_DATE',
    'VEHICLE_NO',
    'CARRIER',
    'VEHICLE_CAPACITY',
    'EWAYBILL_NO',
    'EWAYBILL_DATE',
    'FREIGHT_ORDER',
    'FREIGHT_ORDER_DATE',
    'MATERIAL_CODE',
    'MATERIAL_DESCRIPTION',
    'QUANTITY',
    'RECEIVED_QUANTITY',
    'QUANTITY_UOM',
    'OUTBOUND_DELIVERY',
    'OUTBOUND_DELIVERY_DATE',
    'STATUS',
    'DOWNLOAD',
  ];
  dataSource = new MatTableDataSource<ReportInvoice>();
  selection = new SelectionModel<ReportInvoice>(true, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  InvoiceFilterFormGroup: FormGroup;
  AllStatusTemplates: StatusTemplate[] = [];
  isDateError: boolean;
  constructor(
    private _router: Router,
    private _reportService: ReportService,
    private _shareParameterService: ShareParameterService,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe
  ) {
    this.isProgressBarVisibile = true;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.AllStatusTemplates = [
      { key: 'All Invoices', value: 'All' },
      { key: 'Pending (customer)', value: 'Open' },
      { key: 'Saved (customer)', value: 'Saved' },
      { key: 'Partially Confirmed (customer)', value: 'PartiallyConfirmed' },
      { key: 'Confirmed (customer)', value: 'Confirmed' },

    ];
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.currentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('DeliveryComplianceReport') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }

    this.InvoiceFilterFormGroup = this._formBuilder.group({
      Status: ['Open', Validators.required],
      StartDate: [],
      EndDate: [],
      InvoiceNumber: [''],
      Plant: [''],
      CustomerName: ['']
    });
    this.isDateError = false;
    if (this.currentUserRole.toLowerCase() === 'amararaja user') {
      this.getFilteredInvoiceDetails();
    } else {
      this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      );
      this._router.navigate(['/auth/login']);
    }
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  SearchInvoices(): void {
    this.getFilteredInvoiceDetails();
  }

  getFilteredInvoiceDetails(): void {
    if (this.InvoiceFilterFormGroup.valid) {
      if (!this.isDateError) {
        this.isProgressBarVisibile = true;
        const Status = this.InvoiceFilterFormGroup.get('Status').value;
        const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        const Plant = this.InvoiceFilterFormGroup.get('Plant').value;
        const CustomerName = this.InvoiceFilterFormGroup.get('CustomerName').value;
        let StartDate = null;
        const staDate = this.InvoiceFilterFormGroup.get('StartDate').value;
        if (staDate) {
          StartDate = this._datePipe.transform(staDate, 'yyyy-MM-dd');
        }
        let EndDate = null;
        const enDate = this.InvoiceFilterFormGroup.get('EndDate').value;
        if (enDate) {
          EndDate = this._datePipe.transform(enDate, 'yyyy-MM-dd');
        }
        this._reportService
          .GetFilteredInvoiceDetails(this.authenticationDetails.userID, Status, StartDate, EndDate, InvoiceNumber, Plant, CustomerName)
          .subscribe(
            data => {
              this.FilteredInvoiceDetails = data as ReportInvoice[];
              this.allInvoicesCount = this.FilteredInvoiceDetails.length;
              this.dataSource = new MatTableDataSource(
                this.FilteredInvoiceDetails
              );
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.isProgressBarVisibile = false;
            },
            err => {
              this.isProgressBarVisibile = false;
              this.notificationSnackBarComponent.openSnackBar(
                err instanceof Object ? 'Something went wrong' : err,
                SnackBarStatus.danger
              );
            }
          );
      }
    } else {
      Object.keys(this.InvoiceFilterFormGroup.controls).forEach(key => {
        this.InvoiceFilterFormGroup.get(key).markAsTouched();
        this.InvoiceFilterFormGroup.get(key).markAsDirty();
      });
    }
  }

  DateSelected(): void {
    const FROMDATEVAL = this.InvoiceFilterFormGroup.get('StartDate').value as Date;
    const TODATEVAL = this.InvoiceFilterFormGroup.get('EndDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

  isAllSelected(): boolean {
    if (this.selection && this.dataSource) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
    // return true;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    if (this.dataSource) {
      this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  onKeydown(event): boolean {
    // console.log(event.key);
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    } else {
      return false;
    }
  }
  invoiceRowClick(inv: ReportInvoice): void {
    const invoiceDetails: InvoiceDetails = new InvoiceDetails();
    invoiceDetails.HEADER_ID = inv.HEADER_ID;
    invoiceDetails.INV_NO = inv.INV_NO;
    invoiceDetails.ODIN = inv.ODIN;
    invoiceDetails.INV_DATE = inv.INV_DATE;
    invoiceDetails.INV_TYPE = inv.INV_TYPE;
    invoiceDetails.PLANT = inv.PLANT;
    invoiceDetails.CUSTOMER = inv.CUSTOMER;
    invoiceDetails.CUSTOMER_NAME = inv.CUSTOMER_NAME;
    invoiceDetails.VEHICLE_NO = inv.VEHICLE_NO;
    invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
    invoiceDetails.EWAYBILL_NO = inv.EWAYBILL_NO;
    invoiceDetails.OUTBOUND_DELIVERY = inv.OUTBOUND_DELIVERY;
    invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
    invoiceDetails.STATUS = inv.STATUS;
    this._shareParameterService.SetInvoiceDetail(invoiceDetails);
    this._router.navigate(['/pages/invItem']);
  }

  DowloandPODDocument(HeaderID: number, AttachmentID: number, fileName: string): void {
    this.isProgressBarVisibile = true;
    this._reportService.DowloandPODDocument(HeaderID, AttachmentID).subscribe(
      data => {
        if (data) {
          const BlobFile = data as Blob;
          saveAs(BlobFile, fileName);
        }
        this.isProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.isProgressBarVisibile = false;
      }
    );
  }
}

