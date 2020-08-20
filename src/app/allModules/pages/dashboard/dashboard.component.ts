import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatTabChangeEvent,
} from "@angular/material";
import { Router } from "@angular/router";
import { ChartType } from "chart.js";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { AuthenticationDetails } from "app/models/master";
import { fuseAnimations } from "@fuse/animations";
import {
    InvoiceDetails,
    ApproverDetails,
    DeliveryCount,
    InvoiceStatusCount,
    InvoiceHeaderDetail,
} from "app/models/invoice-details";
import { DashboardService } from "app/services/dashboard.service";
import { ShareParameterService } from "app/services/share-parameters.service";
import { SelectionModel } from "@angular/cdk/collections";
import { Guid } from "guid-typescript";
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class DashboardComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    currentUserCode: string;
    currentUsername: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    allInvoicesCount: number;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    deliveryCount: DeliveryCount;
    condition: string;
    InvoiceFilterFormGroup: FormGroup;
    isDateError: boolean;
    allInvoiceDetails: InvoiceDetails[] = [];
    allInvoiceHeaderDetails: InvoiceHeaderDetail[] = [];
    displayedColumns: string[] = [
        "INV_NO",
        "INV_DATE",
        "INV_TYPE",
        "PLANT",
        "VEHICLE_NO",
        "VEHICLE_CAPACITY",
        "FWD_AGENT",
        "CARRIER",
        "LR_NO",
        "LR_DATE",
        "FREIGHT_ORDER",
        "FREIGHT_ORDER_DATE",
        "EWAYBILL_NO",
        "EWAYBILL_DATE",
        "PROPOSED_DELIVERY_DATE",
        "ACTUAL_DELIVERY_DATE",
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
            position: "right",
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true,
            },
        },
        cutoutPercentage: 60,
        elements: {
            arc: {
                borderWidth: 0,
            },
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value;
                },
                fontColor: "#000",
                position: "default",
                // outsidePadding: 0,
                // textMargin: 0
            },
        },
    };
    public doughnutChartType: ChartType = "doughnut";
    public doughnutChartLabels: any[] = [
        "CONFIRMED INVOICES",
        "PENDING INVOICES",
    ];
    public doughnutChartData: any[] = [[0, 0]];
    // public doughnutChartData: any[] = [];
    public colors: any[] = [{ backgroundColor: ["#52de97", "#fb7800"] }];

    public doughnutChartOptions1 = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "right",
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true,
            },
        },
        cutoutPercentage: 60,
        elements: {
            arc: {
                borderWidth: 0,
            },
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value;
                },
                fontColor: "#000",
                position: "default",
                // outsidePadding: 0,
                // textMargin: 0
            },
        },
    };
    public doughnutChartType1: ChartType = "doughnut";
    public doughnutChartLabels1: any[] = ["ON-TIME DELIVERY", "LATE DELIVERY"];
    public doughnutChartData1: any[] = [[0, 0]];
    // public doughnutChartData: any[] = [];
    public colors1: any[] = [{ backgroundColor: ["#52de97", "#eff54f"] }];

    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
    ) {
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.deliveryCount = new DeliveryCount();
        this.condition = "InLineDelivery";
        this.isDateError = false;
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.userID;
            this.currentUserRole = this.authenticationDetails.userRole;
            this.currentUserCode = this.authenticationDetails.userCode;
            this.currentUsername = this.authenticationDetails.userName;
            this.MenuItems = this.authenticationDetails.menuItemNames.split(
                ","
            );
            if (this.MenuItems.indexOf("Dashboard") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        this.InvoiceFilterFormGroup = this._formBuilder.group({
            // Status: [''],
            StartDate: [],
            EndDate: [],
            // InvoiceNumber: [''],
            // LRNumber: ['']
        });
        this.GetInvoiceStatusCount();
        this.GetDeliveryCounts();
        this.GetInvoiceHeaderDetails();
        // this.GetDeliveryCount();
        // this.GetDeliveredInvoices();
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    GetDeliveryCount(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetDeliveryCount(this.authenticationDetails.userID)
            .subscribe(
                (data) => {
                    this.deliveryCount = data as DeliveryCount;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    tabChanged(event: MatTabChangeEvent): void {
        this.condition =
            event.index === 0 ? "InLineDelivery" : "DelayedDelivery";
        this.GetDeliveredInvoices();
    }

    GetDeliveredInvoices(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetDeliveredInvoices(
                this.authenticationDetails.userID,
                this.condition
            )
            .subscribe(
                (data) => {
                    this.allInvoiceDetails = data as InvoiceDetails[];
                    this.allInvoicesCount = this.allInvoiceDetails.length;
                    if (this.condition === "InLineDelivery") {
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
                (err) => {
                    this.isProgressBarVisibile = false;
                    this.notificationSnackBarComponent.openSnackBar(
                        err instanceof Object ? "Something went wrong" : err,
                        SnackBarStatus.danger
                    );
                }
            );
    }

    GetInvoiceStatusCount(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetInvoiceStatusCountByUserID(this.currentUserID)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .GetInvoiceStatusCountByUserName(this.currentUserCode)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetDeliveryCounts(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetDeliveryCount(this.currentUserID)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .GetDeliveryCountByUsername(this.currentUserCode)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetInvoiceHeaderDetails(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetInvoiceHeaderDetailByUserID(this.currentUserID)
                .subscribe(
                    (data: InvoiceHeaderDetail[]) => {
                        this.allInvoiceHeaderDetails = data;
                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .GetInvoiceHeaderDetailByUsername(this.currentUserCode)
                .subscribe(
                    (data: InvoiceHeaderDetail[]) => {
                        this.allInvoiceHeaderDetails = data;
                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    SearchInvoices(): void {
        this.getFilteredInvoiceDetails();
    }
    getFilteredInvoiceDetails(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.FilterInvoiceStatusCount();
                this.FilterDeliveryCount();
            }
        } else {
            Object.keys(this.InvoiceFilterFormGroup.controls).forEach(key => {
                this.InvoiceFilterFormGroup.get(key).markAsTouched();
                this.InvoiceFilterFormGroup.get(key).markAsDirty();
            });
        }
    }

    FilterInvoiceStatusCount(): void {
        // const Status = this.InvoiceFilterFormGroup.get('Status').value;
        // const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        // const LRNumber = this.InvoiceFilterFormGroup.get('LRNumber').value;
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
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterInvoiceStatusCount(this.currentUserID, StartDate, EndDate)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .FilterInvoiceStatusCountByUser(this.currentUserCode, StartDate, EndDate)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    FilterDeliveryCount(): void {
        // const Status = this.InvoiceFilterFormGroup.get('Status').value;
        // const InvoiceNumber = this.InvoiceFilterFormGroup.get('InvoiceNumber').value;
        // const LRNumber = this.InvoiceFilterFormGroup.get('LRNumber').value;
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
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterDeliveryCount(this.currentUserID, StartDate, EndDate)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else if (this.currentUserRole === "Customer") {
            this._dashboardService
                .FilterDeliveryCountByUser(this.currentUserCode, StartDate, EndDate)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
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

    GoToInvoiceItem(inv: InvoiceHeaderDetail): void {
        const invoiceDetails: InvoiceDetails = new InvoiceDetails();
        invoiceDetails.HEADER_ID = inv.HEADER_ID;
        invoiceDetails.INV_NO = inv.INV_NO;
        invoiceDetails.ODIN = inv.ODIN;
        invoiceDetails.VEHICLE_NO = inv.VEHICLE_NO;
        invoiceDetails.EWAYBILL_NO = inv.EWAYBILL_NO;
        invoiceDetails.OUTBOUND_DELIVERY = inv.OUTBOUND_DELIVERY;
        invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
        invoiceDetails.STATUS = inv.STATUS;
        this._shareParameterService.SetInvoiceDetail(invoiceDetails);
        this._router.navigate(['/pages/invItem']);
    }
}
