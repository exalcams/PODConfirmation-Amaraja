import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatTabChangeEvent
} from '@angular/material';
import { Router } from '@angular/router';
import { ChartType } from 'chart.js';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails } from 'app/models/master';
import { fuseAnimations } from '@fuse/animations';
import { InvoiceDetails, ApproverDetails, DeliveryCount } from 'app/models/invoice-details';
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
    deliveryCount: DeliveryCount;
    condition: string;
    allInvoiceDetails: InvoiceDetails[] = [];
    displayedColumns: string[] = [
        'INV_NO',
        'INV_DATE',
        'INV_TYPE',
        'PLANT',
        'VEHICLE_NO',
        'VEHICLE_CAPACITY',
        'FWD_AGENT',
        'CARRIER',
        'LR_NO',
        'LR_DATE',
        'FREIGHT_ORDER',
        'FREIGHT_ORDER_DATE',
        'EWAYBILL_NO',
        'EWAYBILL_DATE',
        'PROPOSED_DELIVERY_DATE',
        'ACTUAL_DELIVERY_DATE'
    ];
    dataSource = new MatTableDataSource<InvoiceDetails>();
    selection = new SelectionModel<InvoiceDetails>(true, []);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // Doughnut Chart
    public doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: 'left',
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true
            }
        },
        cutoutPercentage: 80,
        elements: {
            arc: {
                borderWidth: 0
            }
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value + '%';
                },
                fontColor: '#000',
                position: 'outside'
            }
        }
    };
    public doughnutChartType: ChartType = 'doughnut';
    public doughnutChartLabels: any[] = ['INVOICE DISPATCHED', 'POD CONFIRMED'];
    public doughnutChartData: any[] = [
        [4, 2]
    ];
    // public doughnutChartData: any[] = [];
    public colors: any[] = [{ backgroundColor: ['#fb7800', '#4452c6'] }];

    public doughnutChartOptions1 = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: 'left',
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true
            }
        },
        cutoutPercentage: 80,
        elements: {
            arc: {
                borderWidth: 0
            }
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value + '%';
                },
                fontColor: '#000',
                position: 'outside'
            }
        }
    };
    public doughnutChartType1: ChartType = 'doughnut';
    public doughnutChartLabels1: any[] = ['ON-TIME DELIVERY', 'LITE DELIVERY'];
    public doughnutChartData1: any[] = [
        [4, 2]
    ];
    // public doughnutChartData: any[] = [];
    public colors1: any[] = [{ backgroundColor: ['#52de97', '#eff54f'] }];
   

    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar
    ) {
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.deliveryCount = new DeliveryCount();
        this.condition = 'InLineDelivery';
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
        this.GetDeliveryCount();
        this.GetDeliveredInvoices();
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    GetDeliveryCount(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetDeliveryCount(this.authenticationDetails.userID)
            .subscribe(
                data => {
                    this.deliveryCount = data as DeliveryCount;
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

    tabChanged(event: MatTabChangeEvent): void {
        this.condition = event.index === 0 ? 'InLineDelivery' : 'DelayedDelivery';
        this.GetDeliveredInvoices();
    }

    GetDeliveredInvoices(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetDeliveredInvoices(this.authenticationDetails.userID, this.condition)
            .subscribe(
                data => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    if (this.condition === 'InLineDelivery') {
                        this.deliveryCount.InLineDelivery = this.allInvoiceDetails.length;
                    } else {
                        this.deliveryCount.DelayedDelivery = this.allInvoiceDetails.length;
                    }
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

}
