import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort
} from '@angular/material';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { fuseAnimations } from '@fuse/animations';
import { InvoiceDetails, ApproverDetails } from 'app/models/invoice-details';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Guid } from 'guid-typescript';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    allInvoicesCount: number;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    allInvoiceDetails: InvoiceDetails[] = [];
    displayedColumns: string[] = [
        'SELECT',
        'INV_NO',
        'INV_DATE',
        'INV_TYPE',
        'PLANT',
        'VEHICLE_NO',
        'VEHICLE_CAPACITY',
        'FWD_AGENT',
        'CARRIER',
        'EWAYBILL_NO',
        'EWAYBILL_DATE',
        'OUTBOUND_DELIVERY',
        'OUTBOUND_DELIVERY_DATE',
    ];
    dataSource = new MatTableDataSource<InvoiceDetails>();
    selection = new SelectionModel<InvoiceDetails>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar
    ) {
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserRole = this.authenticationDetails.userRole;
            this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
            if (this.MenuItems.indexOf('Dashboard') < 0) {
                this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
                );
                this._router.navigate(['/auth/login']);
            }
        } else {
            this._router.navigate(['/auth/login']);
        }

        if (this.currentUserRole.toLowerCase() === 'amararaja user') {
            this.getConfirmedInvoiceDetails();
        } else {
            this.getAllInvoiceDetails();
        }
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getAllInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetAllInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
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

    getConfirmedInvoiceDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetConfirmedInvoiceDetails(this.authenticationDetails.userID)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    this.dataSource = new MatTableDataSource(
                        this.allInvoiceDetails
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

    invoiceRowClick(row: InvoiceDetails): void {
        // console.log(row);
        this._shareParameterService.SetInvoiceDetail(row);
        this._router.navigate(['/pages/invItem']);
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

    ApproveSelectedInvoices(): void {
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
}
