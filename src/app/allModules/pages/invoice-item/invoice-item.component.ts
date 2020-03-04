import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { InvoiceDetails, InvoiceItemDetails } from 'app/models/invoice-details';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { InvoiceService } from 'app/services/invoice.service';
import { Guid } from 'guid-typescript';
import { fuseAnimations } from '@fuse/animations';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-invoice-item',
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InvoiceItemComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  MenuItems: string[];
  isProgressBarVisibile: boolean;
  allInvoicesCount: number;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SelectedInvoiceDetail: InvoiceDetails;
  InvoiceItemDetailsList: InvoiceItemDetails[] = [];
  InvoiceItemDetailsDisplayedColumns: string[] = [
    'ITEM_ID',
    'HEADER_ID',
    'MATERIAL_CODE',
    'MATERIAL_DESCRIPTION',
    'QUANTITY',
    'QUANTITY_UOM',
    'LR_NO',
    'LR_DATE',
    'FWD_AGENT',
    'CARRIER',
    'FREIGHT_ORDER',
    'FREIGHT_ORDER_DATE'
  ];
  InvoiceItemDetailsDataSource = new MatTableDataSource<InvoiceItemDetails>();
  @ViewChild(MatPaginator) InvoiceItemDetailsPaginator: MatPaginator;
  @ViewChild(MatSort) InvoiceItemDetailsSort: MatSort;

  InvoiceItemFormGroup: FormGroup;
  InvoiceItemFormArray: FormArray = this._formBuilder.array([]);

  constructor(
    private _router: Router,
    private _dashboardService: DashboardService,
    private _shareParameterService: ShareParameterService,
    private _invoiceService: InvoiceService,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _decimalPipe: DecimalPipe
  ) {
    this.isProgressBarVisibile = true;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedInvoiceDetail = this._shareParameterService.GetInvoiceDetail();
    if (!this.SelectedInvoiceDetail || !this.SelectedInvoiceDetail.HEADER_ID) {
      this._router.navigate(['/pages/dashboard']);
    }
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('InvoiceItem') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }

    this.InvoiceItemFormGroup = this._formBuilder.group({
      InvoiceItems: this.InvoiceItemFormArray
    });

    this.GetInvoiceItemDetailsByID();
  }
  GetInvoiceItemDetailsByID(): void {
    this.isProgressBarVisibile = true;
    this._invoiceService.GetInvoiceItemDetailsByID
      (this.currentUserID, this.SelectedInvoiceDetail.HEADER_ID).subscribe(
        data => {
          this.isProgressBarVisibile = false;
          this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
          // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
          // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
          // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
          console.log(this.InvoiceItemDetailsList);
          this.InvoiceItemDetailsList.forEach(x => {
            this.SetInvoiceItemValues(x);
          });
        },
        err => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(
            err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger
          );
        }
      );
  }


  SetInvoiceItemValues(invItem: InvoiceItemDetails): void {
    let QTYVal = '0';
    if (invItem.QUANTITY) {
      QTYVal = this._decimalPipe.transform(invItem.QUANTITY, '1.2-2');
    }
    const row = this._formBuilder.group({
      ITEM_ID: [invItem.ITEM_ID, Validators.required],
      HEADER_ID: [invItem.HEADER_ID, Validators.required],
      MATERIAL_CODE: [invItem.MATERIAL_CODE, Validators.required],
      MATERIAL_DESCRIPTION: [invItem.MATERIAL_DESCRIPTION, Validators.required],
      QUANTITY: [QTYVal, Validators.required],
      QUANTITY_UOM: [invItem.QUANTITY_UOM, Validators.required],
      LR_NO: [invItem.LR_NO, Validators.required],
      LR_DATE: [invItem.LR_DATE, Validators.required],
      FWD_AGENT: [invItem.FWD_AGENT, Validators.required],
      CARRIER: [invItem.CARRIER, Validators.required],
      FREIGHT_ORDER: [invItem.FREIGHT_ORDER, Validators.required],
      FREIGHT_ORDER_DATE: [invItem.FREIGHT_ORDER_DATE, Validators.required],
      STATUS: [invItem.STATUS, Validators.required],
      STATUS_DESCRIPTION: [invItem.STATUS_DESCRIPTION, Validators.required],
    });
    row.get('ITEM_ID').disable();
    row.get('HEADER_ID').disable();
    row.get('MATERIAL_CODE').disable();
    row.get('MATERIAL_DESCRIPTION').disable();
    row.get('LR_NO').disable();
    row.get('LR_DATE').disable();
    row.get('FWD_AGENT').disable();
    row.get('CARRIER').disable();
    row.get('FREIGHT_ORDER').disable();
    row.get('FREIGHT_ORDER_DATE').disable();
    this.InvoiceItemFormArray.push(row);
    // this.InvoiceItemDataSource.next(this.InvoiceItemFormArray.controls);
  }

  applyFilter(filterValue: string): void {
    this.InvoiceItemDetailsDataSource.filter = filterValue.trim().toLowerCase();
  }

}
