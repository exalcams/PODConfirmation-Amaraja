import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
import { AuthenticationDetails, Reason } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort, MatDialogConfig, MatDialog } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { InvoiceDetails, InvoiceItemDetails, InvoiceUpdation } from 'app/models/invoice-details';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { InvoiceService } from 'app/services/invoice.service';
import { Guid } from 'guid-typescript';
import { fuseAnimations } from '@fuse/animations';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { MasterService } from 'app/services/master.service';

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
  currentUserName: string;
  currentUserCode: string;
  currentUserRole: string;
  MenuItems: string[];
  isProgressBarVisibile: boolean;
  allInvoicesCount: number;
  minDate: Date;
  maxDate: Date;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SelectedInvoiceDetail: InvoiceDetails;
  InvoiceItemDetailsList: InvoiceItemDetails[] = [];
  InvoiceItemDetailsDisplayedColumns: string[] = [
    // 'ITEM_ID',
    'ITEM_NO',
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
  @ViewChild('fileInput') fileInput: ElementRef<HTMLElement>;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  InvoiceItemFormGroup: FormGroup;
  InvoiceItemFormArray: FormArray = this._formBuilder.array([]);
  displayedColumns: string[] = [
    // 'SELECT',
    'ITEM_NO',
    'MATERIAL_CODE',
    'QUANTITY',
    'RECEIVED_QUANTITY',
    'REASON',
    'REMARKS',
  ];
  dataSource: MatTableDataSource<AbstractControl>;

  AllReasons: Reason[] = [];
  // ReasonTemplates: string[] = [];

  constructor(
    private _router: Router,
    private _dashboardService: DashboardService,
    private _shareParameterService: ShareParameterService,
    private _invoiceService: InvoiceService,
    private _masterService: MasterService,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _decimalPipe: DecimalPipe,
    private renderer: Renderer
  ) {
    this.SelectedInvoiceDetail = this._shareParameterService.GetInvoiceDetail();
    if (!this.SelectedInvoiceDetail || !this.SelectedInvoiceDetail.HEADER_ID) {
      this._router.navigate(['/pages/dashboard']);
    }
    this.isProgressBarVisibile = true;
    this.minDate = new Date();
    if (this.SelectedInvoiceDetail.LR_DATE) {
      this.minDate = this.SelectedInvoiceDetail.LR_DATE as Date;
    } else if (this.SelectedInvoiceDetail.INV_DATE) {
      this.minDate = this.SelectedInvoiceDetail.INV_DATE as Date;
    }
    this.maxDate = new Date();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    // this.ReasonTemplates = ['Completely Received', 'Partially Received', 'Damaged'];
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.currentUserName = this.authenticationDetails.userName;
      this.currentUserCode = this.authenticationDetails.userCode;
      this.currentUserRole = this.authenticationDetails.userRole;
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
      VehicleReportedDate: ['', Validators.required],
      InvoiceItems: this.InvoiceItemFormArray
    });
    this.GetAllReasons();
    this.GetInvoiceItemDetails();
  }

  ResetControl(): void {
    this.InvoiceItemDetailsList = [];
    // this.SelectedInvoiceDetail = new InvoiceDetails();
    this.InvoiceItemFormGroup.reset();
    Object.keys(this.InvoiceItemFormGroup.controls).forEach(key => {
      this.InvoiceItemFormGroup.get(key).markAsUntouched();
    });
    this.ResetInvoiceItems();
    this.fileToUpload = null;
    this.fileToUploadList = [];
  }

  ResetInvoiceItems(): void {
    this.ClearFormArray(this.InvoiceItemFormArray);
    this.dataSource = new MatTableDataSource(this.InvoiceItemFormArray.controls);
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  GetAllReasons(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllReasons().subscribe(
      (data) => {
        if (data) {
          this.AllReasons = data as Reason[];
          if (this.AllReasons && this.AllReasons.length) {
            const index = this.AllReasons.findIndex(x => x.Description.toLocaleLowerCase() === 'completely received')[0];
            if (index < 0) {
              const res = new Reason();
              res.ReasonID = 100;
              res.Description = 'Completely received';
            }
          }
          this.isProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetInvoiceItemDetails(): void {
    if (this.currentUserRole === "Administrator") {
      this.GetInvoiceItemDetailsByHeaderID();
    }
    if (this.currentUserRole === "Amararaja User") {
      this.GetInvoiceItemDetailsByID();
    } else if (this.currentUserRole === "Customer") {
      this.GetInvoiceItemDetailsByUserAndID();
    }
  }
  GetInvoiceItemDetailsByHeaderID(): void {
    this.isProgressBarVisibile = true;
    this._invoiceService.GetInvoiceItemDetailsByHeaderID
      (this.SelectedInvoiceDetail.HEADER_ID).subscribe(
        data => {
          this.isProgressBarVisibile = false;
          this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE);
          this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
          // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
          // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
          // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
          // console.log(this.InvoiceItemDetailsList);
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
  GetInvoiceItemDetailsByID(): void {
    this.isProgressBarVisibile = true;
    this._invoiceService.GetInvoiceItemDetailsByID
      (this.currentUserID, this.SelectedInvoiceDetail.HEADER_ID).subscribe(
        data => {
          this.isProgressBarVisibile = false;
          this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE);
          this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
          // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
          // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
          // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
          // console.log(this.InvoiceItemDetailsList);
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
  GetInvoiceItemDetailsByUserAndID(): void {
    this.isProgressBarVisibile = true;
    this._invoiceService.GetInvoiceItemDetailsByUserAndID
      (this.currentUserCode, this.SelectedInvoiceDetail.HEADER_ID).subscribe(
        data => {
          this.isProgressBarVisibile = false;
          this.InvoiceItemFormGroup.controls.VehicleReportedDate.patchValue(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE);
          this.InvoiceItemDetailsList = data as InvoiceItemDetails[];
          // this.InvoiceItemDetailsDataSource = new MatTableDataSource(this.InvoiceItemDetailsList);
          // this.InvoiceItemDetailsDataSource.paginator = this.InvoiceItemDetailsPaginator;
          // this.InvoiceItemDetailsDataSource.sort = this.InvoiceItemDetailsSort;
          // console.log(this.InvoiceItemDetailsList);
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
    const QTYValue = parseFloat(QTYVal.replace(/,/g, ''));
    let REQTYVal = '0';
    if (invItem.RECEIVED_QUANTITY) {
      REQTYVal = this._decimalPipe.transform(invItem.RECEIVED_QUANTITY, '1.2-2');
    }
    let REQTYValue = parseFloat(REQTYVal.replace(/,/g, ''));
    if (this.currentUserRole === "Customer") {
      REQTYValue = REQTYValue > 0 ? REQTYValue : QTYValue;
    }
    const row = this._formBuilder.group({
      ITEM_NO: [invItem.ITEM_NO],
      ITEM_ID: [invItem.ITEM_ID],
      HEADER_ID: [invItem.HEADER_ID],
      MATERIAL_CODE: [invItem.MATERIAL_CODE],
      MATERIAL_DESCRIPTION: [invItem.MATERIAL_DESCRIPTION],
      QUANTITY: [QTYValue],
      RECEIVED_QUANTITY: [REQTYValue, [Validators.required, Validators.min(0), Validators.max(QTYValue)]],
      QUANTITY_UOM: [invItem.QUANTITY_UOM],
      // LR_NO: [invItem.LR_NO],
      // LR_DATE: [invItem.LR_DATE],
      // FWD_AGENT: [invItem.FWD_AGENT],
      // CARRIER: [invItem.CARRIER],
      // FREIGHT_ORDER: [invItem.FREIGHT_ORDER],
      // FREIGHT_ORDER_DATE: [invItem.FREIGHT_ORDER_DATE],
      STATUS: [invItem.STATUS],
      STATUS_DESCRIPTION: [invItem.STATUS_DESCRIPTION],
      REASON: [invItem.REASON],
      REMARKS: [invItem.REMARKS],
    });
    row.get('ITEM_ID').disable();
    row.get('HEADER_ID').disable();
    row.get('MATERIAL_CODE').disable();
    row.get('MATERIAL_DESCRIPTION').disable();
    row.get('QUANTITY').disable();
    row.get('QUANTITY_UOM').disable();
    // row.get('LR_NO').disable();
    // row.get('LR_DATE').disable();
    // row.get('FWD_AGENT').disable();
    // row.get('CARRIER').disable();
    // row.get('FREIGHT_ORDER').disable();
    // row.get('FREIGHT_ORDER_DATE').disable();
    this.InvoiceItemFormArray.push(row);
    this.dataSource = new MatTableDataSource(this.InvoiceItemFormArray.controls);
    this.DynamicResonValidator(QTYValue, REQTYValue, row);
    // this.InvoiceItemDataSource.next(this.InvoiceItemFormArray.controls);
  }

  valueChanges(orderedQty: number, receivedQty: number, index: number): void {
    if (orderedQty && receivedQty) {
      const InvoiceItemsArr = this.InvoiceItemFormGroup.get('InvoiceItems') as FormArray;
      const formGroup = InvoiceItemsArr.controls[index] as FormGroup;
      this.DynamicResonValidator(orderedQty, receivedQty, formGroup);
    }
  }

  DynamicResonValidator(orderedQty: number, receivedQty: number, formGroup: FormGroup): void {
    const REASONControl = formGroup.get('REASON') as FormControl;
    const REMARKSControl = formGroup.get('REMARKS') as FormControl;
    if (receivedQty < orderedQty) {
      REASONControl.enable();
      REMARKSControl.enable();
      REASONControl.setValidators(Validators.required);
      // REMARKSControl.setValidators(Validators.required);
      REMARKSControl.clearValidators();
    } else {
      if (this.currentUserRole === "Customer") {
        REASONControl.patchValue('Completely received');
        REMARKSControl.patchValue('');
      }
      REASONControl.disable();
      REMARKSControl.disable();
      REASONControl.clearValidators();
      REMARKSControl.clearValidators();
    }
    REASONControl.updateValueAndValidity();
    REMARKSControl.updateValueAndValidity();
  }

  SaveAndUploadInvoiceItem(): void {
    if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'approved') {
      if (this.SelectedInvoiceDetail.STATUS && !this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase().includes('confirmed')) {
        if (this.InvoiceItemFormGroup.valid) {
          const el: HTMLElement = this.fileInput.nativeElement;
          el.click();
          // const event = new MouseEvent('click', { bubbles: true });
          // this.renderer.invokeElementMethod(
          //   this.fileInput.nativeElement, 'dispatchEvent', [event]);
        } else {
          this.ShowValidationErrors(this.InvoiceItemFormGroup);
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(
          'Invoice has already been confirmed', SnackBarStatus.danger
        );
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has already been approved', SnackBarStatus.danger
      );
    }
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
      const Actiontype = 'Confirm';
      const Catagory = 'Invoice item';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }


  SaveInvoiceItem(): void {
    if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'approved') {
      if (this.SelectedInvoiceDetail.STATUS && !this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase().includes('confirmed')) {

        if (this.InvoiceItemFormGroup.valid) {
          const Actiontype = 'Save';
          const Catagory = 'Invoice item';
          this.OpenConfirmationDialog(Actiontype, Catagory);
        } else {
          this.ShowValidationErrors(this.InvoiceItemFormGroup);
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(
          'Invoice has already been confirmed', SnackBarStatus.danger
        );
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has already been approved ', SnackBarStatus.danger
      );
    }
  }

  UpdateInvoiceStatus(): void {
    if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() === 'partiallyconfirmed') {
      if (this.InvoiceItemFormGroup.valid) {
        const Actiontype = 'Change';
        const Catagory = 'Status to save';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        this.ShowValidationErrors(this.InvoiceItemFormGroup);
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has to Partially Confirmed to update the status to save', SnackBarStatus.danger
      );
    }
  }

  ApproveInvoiceItem(): void {
    if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'approved') {
      if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() === 'confirmed') {
        if (this.InvoiceItemFormGroup.valid) {
          const Actiontype = 'Approve';
          const Catagory = 'Invoice item';
          this.OpenConfirmationDialog(Actiontype, Catagory);
        } else {
          this.ShowValidationErrors(this.InvoiceItemFormGroup);
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(
          'POD Document not yet uploaded by customer', SnackBarStatus.danger
        );
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar(
        'Invoice has already been approved ', SnackBarStatus.danger
      );
    }
  }

  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Change') {
            this.UpdatePartiallyConfirmedInvoiceStatus();
          } else {
            this.UpdateInvoiceItems(Actiontype);
          }
        }
      });
  }

  UpdatePartiallyConfirmedInvoiceStatus(): void {
    this._invoiceService.UpdatePartiallyConfirmedInvoiceStatus(this.SelectedInvoiceDetail.HEADER_ID,
      'Saved', this.currentUserID.toString()).subscribe(
        (dat) => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(`Invoice status changed to save`, SnackBarStatus.success);
          this.ResetControl();
          // this.GetInvoiceItemDetails();
          this._router.navigate(['/pages/partialinvoice']);
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        }
      );
  }

  GetInvoiceItemValues(Actiontype: string): InvoiceItemDetails[] {
    const InvoiceItemsArr = this.InvoiceItemFormGroup.get('InvoiceItems') as FormArray;
    InvoiceItemsArr.controls.forEach((x) => {
      const ItemID = x.get('ITEM_ID').value;
      const SelectedRFQItem = this.InvoiceItemDetailsList.filter(y => y.ITEM_ID === ItemID)[0];
      SelectedRFQItem.RECEIVED_QUANTITY = x.get('RECEIVED_QUANTITY').value;
      SelectedRFQItem.REASON = x.get('REASON').value;
      SelectedRFQItem.REMARKS = x.get('REMARKS').value;
      SelectedRFQItem.STATUS = Actiontype === 'Save' ? 'Saved' : Actiontype === 'Approve' ? 'Approved' :
        Actiontype === 'Confirm' ? 'confirmed' : '';
    });
    return this.InvoiceItemDetailsList;
  }

  UpdateInvoiceItems(Actiontype: string): void {
    this.isProgressBarVisibile = true;
    let Ststs = '';
    const invoiceUpdation = new InvoiceUpdation();
    let VehReportedDate = this.InvoiceItemFormGroup.controls.VehicleReportedDate.value;
    if (VehReportedDate) {
      VehReportedDate = this._datePipe.transform(VehReportedDate, 'yyyy-MM-dd HH:mm:ss');
    }
    invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
    invoiceUpdation.InvoiceItems = this.GetInvoiceItemValues(Actiontype);
    this._invoiceService.UpdateInvoiceItems(invoiceUpdation).subscribe(
      data => {
        const InvDetail = data as InvoiceDetails;
        if (InvDetail) {
          Ststs = InvDetail.STATUS;
        } else {
          Ststs = Actiontype === 'Save' ? 'Saved' : Actiontype === 'Approve' ? 'Approved' :
            Actiontype === 'Confirm' ? 'confirmed' : '';
        }
        if (Actiontype === 'Confirm' && this.fileToUploadList && this.fileToUploadList.length) {
          this._invoiceService.AddInvoiceAttachment(this.SelectedInvoiceDetail.HEADER_ID,
            this.currentUserID.toString(), this.fileToUploadList).subscribe(
              (dat) => {
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(`Invoice item ${Ststs} successfully`, SnackBarStatus.success);
                this.ResetControl();
                this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE = new Date(VehReportedDate);
                this.SelectedInvoiceDetail.STATUS = Ststs;
                this.GetInvoiceItemDetails();
              },
              (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
              }
            );
        } else {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar
            (`Invoice item ${Ststs} successfully`, SnackBarStatus.success);
          this.ResetControl();
          this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE = new Date(VehReportedDate);
          this.SelectedInvoiceDetail.STATUS = Ststs;
          this.GetInvoiceItemDetails();
        }
      },
      err => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(
          err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger
        );
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.InvoiceItemDetailsDataSource.filter = filterValue.trim().toLowerCase();
  }

  onKeydown(event): boolean {
    // console.log(event.key);
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    } else {
      return false;
    }
  }

}
