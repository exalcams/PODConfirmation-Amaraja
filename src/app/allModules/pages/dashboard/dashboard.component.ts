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
    currentUsername: string;
    MenuItems: string[];
    isProgressBarVisibile: boolean;
    allInvoicesCount: number;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    deliveryCount: DeliveryCount;
    condition: string;
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
                    return args.value + "%";
                },
                fontColor: "#000",
                position: "outside",
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
    public colors: any[] = [{ backgroundColor: ["#fb7800", "#4452c6"] }];

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
                    return args.value + "%";
                },
                fontColor: "#000",
                position: "outside",
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
        public snackBar: MatSnackBar
    ) {
        this.isProgressBarVisibile = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.deliveryCount = new DeliveryCount();
        this.condition = "InLineDelivery";
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
                .GetInvoiceStatusCountByUserName(this.currentUsername)
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
                .GetDeliveryCountByUsername(this.currentUsername)
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
                .GetInvoiceHeaderDetailByUsername(this.currentUsername)
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
}
