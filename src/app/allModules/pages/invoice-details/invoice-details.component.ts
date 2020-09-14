import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { InvoiceDetails, ApproverDetails, InvoiceUpdation, InvoiceUpdation1, StatusTemplate } from 'app/models/invoice-details';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { FormGroup, FormArray, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InvoiceService } from 'app/services/invoice.service';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';

@Component({
    selector: 'app-invoice-details',
    templateUrl: './invoice-details.component.html',
    styleUrls: ['./invoice-details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class InvoiceDetailsComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserCode: string;
    currentUserRole: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    allInvoicesCount: number;
    minDate: Date;
    // maxDate: Date;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    allInvoiceDetails: InvoiceDetails[] = [];
    InvoiceDetailsFormGroup: FormGroup;
    InvoiceDetailsFormArray: FormArray = this._formBuilder.array([]);
    displayedColumns: string[] = [
        // 'SELECT',
        'ORGANIZATION',
        'DIVISION',
        'PLANT',
        'ODIN',
        'INV_NO',
        'INV_DATE',
        'INV_TYPE',
        'OUTBOUND_DELIVERY',
        'OUTBOUND_DELIVERY_DATE',
        'LR_NO',
        'LR_DATE',
        'VEHICLE_NO',
        'CARRIER',
        'VEHICLE_CAPACITY',
        'FWD_AGENT',
        'EWAYBILL_NO',
        'EWAYBILL_DATE',
        'FREIGHT_ORDER',
        'FREIGHT_ORDER_DATE',
        'PROPOSED_DELIVERY_DATE',
        'ACTUAL_DELIVERY_DATE',
        'TRANSIT_LEAD_TIME',
        'STATUS',
        'VEHICLE_REPORTED_DATE',
        'Action'
    ];
    dataSource: MatTableDataSource<AbstractControl>;
    selection = new SelectionModel<InvoiceDetails>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('fileInput') fileInput: ElementRef<HTMLElement>;
    fileToUpload: File;
    fileToUploadList: File[] = [];
    SelectedInvoiceDetail: InvoiceDetails;
    InvoiceFilterFormGroup: FormGroup;
    AllStatusTemplates: StatusTemplate[] = [];
    isDateError: boolean;
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        private _invoiceService: InvoiceService,
        private _excelService: ExcelService,
        private _datePipe: DatePipe,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder
    ) {
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.SelectedInvoiceDetail = new InvoiceDetails();
        this.isDateError = false;
        this.minDate = new Date();
        // this.maxDate = new Date();
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
            if (this.MenuItems.indexOf('InvoiceDetails') < 0) {
                this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
                );
                this._router.navigate(['/auth/login']);
            }
        } else {
            this._router.navigate(['/auth/login']);
        }
        this.InvoiceDetailsFormGroup = this._formBuilder.group({
            InvoiceDetails: this.InvoiceDetailsFormArray
        });
        this.InvoiceFilterFormGroup = this._formBuilder.group({
            Status: ['Open'],
            StartDate: [],
            EndDate: [],
            InvoiceNumber: [''],
            LRNumber: ['']
        });
        // if (this.currentUserRole.toLowerCase() === 'amararaja user') {
        //     this.getConfirmedInvoiceDetails();
        // } else {
        //     this.getAllInvoiceDetails();
        // }
        this.AllStatusTemplates = [
            { key: 'All Invoices', value: 'All' },
            { key: 'Pending', value: 'Open' },
            { key: 'Saved', value: 'Saved' },
            { key: 'Partially Confirmed', value: 'PartiallyConfirmed' },
            { key: 'Confirmed', value: 'Confirmed' },
            // { key: 'Approved (AR User)', value: 'Approved' }
        ];
        this.getFilteredInvoiceDetails();
    }

    ResetControl(): void {
        this.SelectedInvoiceDetail = new InvoiceDetails();
        this.fileToUpload = null;
        this.fileToUploadList = [];
        this.ResetInvoiceDetails();
    }

    ResetInvoiceDetails(): void {
        this.ClearFormArray(this.InvoiceDetailsFormArray);
    }
    ClearFormArray = (formArray: FormArray) => {
        while (formArray.length !== 0) {
            formArray.removeAt(0);
        }
    }
    // applyFilter(filterValue: string): void {
    //     this.dataSource.filter = filterValue.trim().toLowerCase();
    // }

    getAllInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetAllInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
                    this.allInvoiceDetails.forEach(x => {
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
                    if (this.allInvoicesCount > 0) {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
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

    GetOpenAndSavedInvoiceDetailByUser(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetOpenAndSavedInvoiceDetailByUser(this.currentUserCode)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
                    this.allInvoiceDetails.forEach(x => {
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
                    if (this.allInvoicesCount > 0) {
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                    }
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

    getConfirmedInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetConfirmedInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    // this.dataSource = new MatTableDataSource(
                    //     this.allInvoiceDetails
                    // );
                    // this.dataSource.paginator = this.paginator;
                    // this.dataSource.sort = this.sort;
                    this.ClearFormArray(this.InvoiceDetailsFormArray);
                    this.allInvoiceDetails.forEach(x => {
                        this.InsertInvoiceDetailsFormGroup(x);
                    });
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

    InsertInvoiceDetailsFormGroup(asnItem: InvoiceDetails): void {
        const row = this._formBuilder.group({
            INV_NO: [asnItem.INV_NO],
            INV_DATE: [asnItem.INV_DATE],
            INV_TYPE: [asnItem.INV_TYPE],
            OUTBOUND_DELIVERY: [asnItem.OUTBOUND_DELIVERY],
            OUTBOUND_DELIVERY_DATE: [asnItem.OUTBOUND_DELIVERY_DATE],
            PLANT: [asnItem.PLANT],
            ORGANIZATION: [asnItem.ORGANIZATION],
            DIVISION: [asnItem.DIVISION],
            ODIN: [asnItem.ODIN],
            VEHICLE_NO: [asnItem.VEHICLE_NO],
            VEHICLE_CAPACITY: [asnItem.VEHICLE_CAPACITY],
            FWD_AGENT: [asnItem.FWD_AGENT],
            CARRIER: [asnItem.CARRIER],
            EWAYBILL_NO: [asnItem.EWAYBILL_NO],
            EWAYBILL_DATE: [asnItem.EWAYBILL_DATE],
            FREIGHT_ORDER: [asnItem.FREIGHT_ORDER],
            FREIGHT_ORDER_DATE: [asnItem.FREIGHT_ORDER_DATE],
            PROPOSED_DELIVERY_DATE: [asnItem.PROPOSED_DELIVERY_DATE],
            ACTUAL_DELIVERY_DATE: [asnItem.ACTUAL_DELIVERY_DATE],
            TRANSIT_LEAD_TIME: [asnItem.TRANSIT_LEAD_TIME],
            STATUS: [asnItem.STATUS],
            VEHICLE_REPORTED_DATE: [asnItem.VEHICLE_REPORTED_DATE],
        });
        row.disable();
        // let minDate = new Date();
        // if (asnItem.LR_DATE) {
        //     minDate = asnItem.LR_DATE as Date;
        // } else if (asnItem.INV_DATE) {
        //     minDate = asnItem.INV_DATE as Date;
        // }
        // row.get('VEHICLE_REPORTED_DATE').setValidators(Validators.min(minDate));
        row.get('VEHICLE_REPORTED_DATE').enable();
        this.InvoiceDetailsFormArray.push(row);
        this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
        // return row;
    }

    invoiceRowClick(index: number): void {
        const row1 = this.GetSelectedInvoiceDeatils(index);
        this._shareParameterService.SetInvoiceDetail(row1);
        this._router.navigate(['/pages/invItem']);
    }

    GetSelectedInvoiceDeatils(index: number): InvoiceDetails {
        const ivoiceDetailsFormArray = this.InvoiceDetailsFormGroup.get('InvoiceDetails') as FormArray;
        // const row1 = new InvoiceDetails();
        const invNo = ivoiceDetailsFormArray.controls[index].get('INV_NO').value;
        const row1 = this.allInvoiceDetails.filter(x => x.INV_NO === invNo)[0];
        if (row1) {
            row1.VEHICLE_REPORTED_DATE = ivoiceDetailsFormArray.controls[index].get('VEHICLE_REPORTED_DATE').value;
            return row1;
        }
        return new InvoiceDetails();
    }


    SaveAndUploadInvoiceItem(index: number): void {
        this.SelectedInvoiceDetail = this.GetSelectedInvoiceDeatils(index);
        if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'approved') {
            if (this.SelectedInvoiceDetail.STATUS && this.SelectedInvoiceDetail.STATUS.toLocaleLowerCase() !== 'confirmed') {
                if (this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE) {
                    const el: HTMLElement = this.fileInput.nativeElement;
                    el.click();
                    // const event = new MouseEvent('click', { bubbles: true });
                    // this.renderer.invokeElementMethod(
                    //   this.fileInput.nativeElement, 'dispatchEvent', [event]);
                } else {
                    this.notificationSnackBarComponent.openSnackBar(
                        'Please fill out Vehicle reported date', SnackBarStatus.danger
                    );
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



    // isAllSelected(): boolean {
    //     if (this.selection && this.dataSource) {
    //         const numSelected = this.selection.selected.length;
    //         const numRows = this.dataSource.data.length;
    //         return numSelected === numRows;
    //     }
    //     // return true;
    // }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    // masterToggle(): void {
    //     if (this.dataSource) {
    //         this.isAllSelected() ?
    //             this.selection.clear() :
    //             this.dataSource.data.forEach(row => this.selection.select(row));
    //     }
    // }

    handleFileInput(evt): void {
        if (evt.target.files && evt.target.files.length > 0) {
            this.fileToUpload = evt.target.files[0];
            this.fileToUploadList = [];
            this.fileToUploadList.push(this.fileToUpload);
            const Actiontype = 'Confirm';
            const Catagory = 'Invoice';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }

    ApproveSelectedInvoices(): void {
        const Actiontype = 'Approve';
        const Catagory = 'Selected Invoice(s)';
        this.OpenConfirmationDialog(Actiontype, Catagory);

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
                    this.ConfirmInvoiceItems(Actiontype);
                }
            });
    }


    ConfirmInvoiceItems(Actiontype: string): void {
        this.isProgressBarVisibile = true;
        const invoiceUpdation = new InvoiceUpdation1();
        const VehReportedDate = this._datePipe.transform(this.SelectedInvoiceDetail.VEHICLE_REPORTED_DATE, 'yyyy-MM-dd HH:mm:ss');
        invoiceUpdation.VEHICLE_REPORTED_DATE = VehReportedDate;
        invoiceUpdation.HEADER_ID = this.SelectedInvoiceDetail.HEADER_ID;
        this._invoiceService.ConfirmInvoiceItems(invoiceUpdation).subscribe(
            data => {
                const Ststs = 'confirmed';
                if (Actiontype === 'Confirm' && this.fileToUploadList && this.fileToUploadList.length) {
                    this._invoiceService.AddInvoiceAttachment(this.SelectedInvoiceDetail.HEADER_ID,
                        this.currentUserID.toString(), this.fileToUploadList).subscribe(
                            (dat) => {
                                this.isProgressBarVisibile = false;
                                this.notificationSnackBarComponent.openSnackBar(`Invoice ${Ststs} successfully`, SnackBarStatus.success);
                                this.ResetControl();
                                this.GetOpenAndSavedInvoiceDetailByUser();
                            },
                            (err) => {
                                console.error(err);
                                this.isProgressBarVisibile = false;
                                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                                this.GetOpenAndSavedInvoiceDetailByUser();
                            }
                        );
                } else {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar
                        (`Invoice ${Ststs} successfully`, SnackBarStatus.success);
                    this.ResetControl();
                    this.GetOpenAndSavedInvoiceDetailByUser();
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

    ApproveInvoices(): void {
        const approverDetails = new ApproverDetails();
        approverDetails.ApprovedBy = this.currentUserID.toString();
        approverDetails.HEADERIDs = this.selection.selected.map(a => a.HEADER_ID);
        this.isProgressBarVisibile = true;
        this._dashboardService
            .ApproveSelectedInvoices(approverDetails)
            .subscribe(
                data => {
                    this.notificationSnackBarComponent.openSnackBar(`Selected Invoice(s) approved successfully`, SnackBarStatus.success);
                    this.selection = new SelectionModel<InvoiceDetails>(true, []);
                    this.getConfirmedInvoiceDetails();
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
    SearchInvoices(): void {
        this.getFilteredInvoiceDetails();
    }
    getFilteredInvoiceDetails(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.isProgressBarVisibile = true;
                const Status = this.InvoiceFilterFormGroup.get('Status').value;
                const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
                const LRNumber = this.InvoiceFilterFormGroup.get('LRNumber').value;
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
                this._dashboardService
                    .FilterInvoiceDetailByUser(this.currentUserCode, Status, StartDate, EndDate, InvoiceNumber, LRNumber)
                    .subscribe(
                        data => {
                            this.allInvoiceDetails = data as InvoiceDetails[];
                            this.allInvoicesCount = this.allInvoiceDetails.length;
                            // this.dataSource = new MatTableDataSource(
                            //     this.allInvoiceDetails
                            // );
                            // this.dataSource.paginator = this.paginator;
                            // this.dataSource.sort = this.sort;
                            this.ClearFormArray(this.InvoiceDetailsFormArray);
                            this.dataSource = new MatTableDataSource(this.InvoiceDetailsFormArray.controls);
                            this.allInvoiceDetails.forEach(x => {
                                this.InsertInvoiceDetailsFormGroup(x);
                            });
                            if (this.allInvoicesCount > 0) {
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;
                            }
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
    onKeydown(event): boolean {
        // console.log(event.key);
        if (event.key === 'Backspace' || event.key === 'Delete') {
            return true;
        } else {
            return false;
        }
    }

    exportAsXLSX(): void {
        const currentPageIndex = this.dataSource.paginator.pageIndex;
        const PageSize = this.dataSource.paginator.pageSize;
        const startIndex = currentPageIndex * PageSize;
        const endIndex = startIndex + PageSize;
        const itemsShowed = this.allInvoiceDetails.slice(startIndex, endIndex);
        const itemsShowedd = [];
        itemsShowed.forEach(x => {
            const item = {
                'Organization': x.ORGANIZATION,
                'Division': x.DIVISION,
                'Plant': x.PLANT,
                'Invoice No': x.ODIN,
                'Reference No': x.INV_NO,
                'Invoice Date': x.INV_DATE ? this._datePipe.transform(x.INV_DATE, 'dd-MM-yyyy') : '',
                'Invoice Type': x.INV_TYPE,
                'Outbound delivery': x.OUTBOUND_DELIVERY,
                'Outbound delivery date': x.OUTBOUND_DELIVERY_DATE ? this._datePipe.transform(x.OUTBOUND_DELIVERY_DATE, 'dd-MM-yyyy') : '',
                'LR Number': x.LR_NO,
                'LR date': x.LR_DATE ? this._datePipe.transform(x.LR_DATE, 'dd-MM-yyyy') : '',
                'Vehicle No': x.VEHICLE_NO,
                'Carrier': x.CARRIER,
                'Vehicle Capacity': x.VEHICLE_CAPACITY,
                'E-Way bill No': x.EWAYBILL_NO,
                'E-Way bill date': x.EWAYBILL_DATE ? this._datePipe.transform(x.EWAYBILL_DATE, 'dd-MM-yyyy') : '',
                'Freight order': x.FREIGHT_ORDER,
                'Freight order date': x.FREIGHT_ORDER_DATE ? this._datePipe.transform(x.FREIGHT_ORDER_DATE, 'dd-MM-yyyy') : '',
                'Proposed delivery date': x.PROPOSED_DELIVERY_DATE ? this._datePipe.transform(x.PROPOSED_DELIVERY_DATE, 'dd-MM-yyyy') : '',
                'Actual delivery date': x.ACTUAL_DELIVERY_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
                'Lead time': x.TRANSIT_LEAD_TIME,
                'Status': x.STATUS,
                'Vehicle reported date': x.VEHICLE_REPORTED_DATE ? this._datePipe.transform(x.ACTUAL_DELIVERY_DATE, 'dd-MM-yyyy') : '',
            };
            itemsShowedd.push(item);
        });
        this._excelService.exportAsExcelFile(itemsShowedd, 'invoices');
    }
}
