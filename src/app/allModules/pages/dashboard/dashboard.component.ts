import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {
    MatIconRegistry,
    MatSnackBar,
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatTabChangeEvent,
    MatOption,
} from "@angular/material";
import { Router } from "@angular/router";
import { ChartType } from "chart.js";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { AuthenticationDetails, Organization, Plant, PlantOrganizationMap, PlantWithOrganization } from "app/models/master";
import { fuseAnimations } from "@fuse/animations";
import {
    InvoiceDetails,
    ApproverDetails,
    DeliveryCount,
    InvoiceStatusCount,
    InvoiceHeaderDetail, FilterClass
} from "app/models/invoice-details";
import { DashboardService } from "app/services/dashboard.service";
import { ShareParameterService } from "app/services/share-parameters.service";
import { SelectionModel } from "@angular/cdk/collections";
import { Guid } from "guid-typescript";
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MasterService } from 'app/services/master.service';
import { ReportService } from 'app/services/report.service';

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
    isProgressBarVisibile1: boolean;
    isProgressBarVisibile2: boolean;
    AllOrganizations: Organization[] = [];
    AllPlants: Plant[] = [];
    FilteredPlants: Plant[] = [];
    AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
    @ViewChild('allSelected') private allSelected: MatOption;
    @ViewChild('allSelected1') private allSelected1: MatOption;
    Divisions: string[] = [];
    allInvoicesCount: number;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    deliveryCount: DeliveryCount;
    condition: string;
    InvoiceFilterFormGroup: FormGroup;
    isDateError: boolean;
    allInvoiceDetails: InvoiceHeaderDetail[] = [];
    // allInvoiceHeaderDetails: InvoiceHeaderDetail[] = [];
    displayedColumns: string[] = [
        'ORGANIZATION',
        'DIVISION',
        'PLANT',
        'ODIN',
        'INV_NO',
        'INV_DATE',
        'INV_TYPE',
        'CUSTOMER',
        'CUSTOMER_NAME',
        'VEHICLE_NO',
        // 'VEHICLE_CAPACITY',
        'LR_NO',
        'LR_DATE',
        'STATUS'
    ];
    dataSource = new MatTableDataSource<InvoiceHeaderDetail>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    currentLabel: string;
    currentCustomPage: number;
    records: number;
    isLoadMoreVisible: boolean;
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
        "PARTIALLY CONFIRMED INVOICES",
        "PENDING INVOICES",
    ];
    public doughnutChartData: any[] = [[0, 0]];
    // public doughnutChartData: any[] = [];
    public colors: any[] = [{ backgroundColor: ["#52de97", '#4452c6', "#fb7800"] }];

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
    public doughnutChartLabels1: any[] = ["ON TIME DELIVERY", "LATE DELIVERY"];
    public doughnutChartData1: any[] = [[0, 0]];
    // public doughnutChartData: any[] = [];
    public colors1: any[] = [{ backgroundColor: ["#52de97", "#eff54f"] }];

    CurrentFilterClass: FilterClass = new FilterClass();
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _reportService: ReportService,
        private _masterService: MasterService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
    ) {
        this.isProgressBarVisibile = false;
        this.isProgressBarVisibile1 = false;
        this.isProgressBarVisibile2 = false;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.deliveryCount = new DeliveryCount();
        this.condition = "InLineDelivery";
        this.isDateError = false;
        this.currentLabel = 'PENDING INVOICES';
        this.currentCustomPage = 1;
        this.allInvoiceDetails = [];
        this.records = 500;
        this.isLoadMoreVisible = false;
        this.CurrentFilterClass = this._shareParameterService.GetDashboardFilterClass();
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = sessionStorage.getItem("authorizationData");
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
        if (this.CurrentFilterClass) {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                StartDate: [this.CurrentFilterClass.StartDate],
                EndDate: [this.CurrentFilterClass.EndDate],
                Organization: [this.CurrentFilterClass.Organization ? this.CurrentFilterClass.Organization : ''],
                Division: [this.CurrentFilterClass.Division ? this.CurrentFilterClass.Division : ''],
                Plant: [this.CurrentFilterClass.Plant ? this.CurrentFilterClass.Plant : ''],
            });
        } else {
            this.InvoiceFilterFormGroup = this._formBuilder.group({
                // Status: [''],
                StartDate: [],
                EndDate: [],
                Organization: [''],
                Division: [''],
                Plant: [''],
                // InvoiceNumber: [''],
                // LRNumber: ['']
            });
        }
        this.GetAllOrganizations();
        this.GetAllPlants();
        this.GetAllPlantOrganizationMaps();
        this.GetDivisions();
        // this.GetInvoiceStatusCount();
        this.getFilteredInvoiceDetails();
        // this.GetInvoiceHeaderDetails();
        // this.LoadInitialData();
        // this.GetDeliveryCount();
        // this.GetDeliveredInvoices();
    }

    applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    GetAllOrganizations(): void {
        this._masterService.GetAllOrganizationsByUserID(this.currentUserID).subscribe(
            (data) => {
                this.AllOrganizations = data as Organization[];
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetAllPlants(): void {
        this._masterService.GetAllPlantsByUserID(this.currentUserID).subscribe(
            (data) => {
                this.AllPlants = data as Plant[];
                this.FilteredPlants = data as Plant[];
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetAllPlantOrganizationMaps(): void {
        this._masterService.GetAllPlantOrganizationMaps().subscribe(
            (data) => {
                this.AllPlantOrganizationMaps = data as PlantWithOrganization[];
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetDivisions(): void {
        this._reportService.GetDivisions().subscribe(
            data => {
                this.Divisions = data as string[];
                this.Divisions.unshift("All");
            },
            err => {
                console.error(err);
                // this.isProgressBarVisibile = false;
            }
        );
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

    // tabChanged(event: MatTabChangeEvent): void {
    //     this.condition =
    //         event.index === 0 ? "InLineDelivery" : "DelayedDelivery";
    //     this.GetDeliveredInvoices();
    // }

    // GetDeliveredInvoices(): void {
    //     this.isProgressBarVisibile = true;
    //     this._dashboardService
    //         .GetDeliveredInvoices(
    //             this.authenticationDetails.userID,
    //             this.condition
    //         )
    //         .subscribe(
    //             (data) => {
    //                 this.allInvoiceDetails = data as InvoiceDetails[];
    //                 this.allInvoicesCount = this.allInvoiceDetails.length;
    //                 if (this.condition === "InLineDelivery") {
    //                     this.deliveryCount.InLineDelivery = this.allInvoiceDetails.length;
    //                 } else {
    //                     this.deliveryCount.DelayedDelivery = this.allInvoiceDetails.length;
    //                 }
    //                 this.dataSource = new MatTableDataSource(
    //                     this.allInvoiceDetails
    //                 );
    //                 this.dataSource.paginator = this.paginator;
    //                 this.dataSource.sort = this.sort;
    //                 this.isProgressBarVisibile = false;
    //             },
    //             (err) => {
    //                 this.isProgressBarVisibile = false;
    //                 this.notificationSnackBarComponent.openSnackBar(
    //                     err instanceof Object ? "Something went wrong" : err,
    //                     SnackBarStatus.danger
    //                 );
    //             }
    //         );
    // }

    GetInvoiceStatusCount(): void {
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .GetInvoiceStatusCountByUserID(this.currentUserID)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile1 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
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
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);

                        this.doughnutChartData = chartData;

                        this.isProgressBarVisibile1 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
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

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
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

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
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

    // GetInvoiceHeaderDetails(): void {
    //     if (this.currentUserRole === "Amararaja User") {
    //         this._dashboardService
    //             .GetInvoiceHeaderDetailByUserID(this.currentUserID)
    //             .subscribe(
    //                 (data: InvoiceHeaderDetail[]) => {
    //                     this.allInvoiceHeaderDetails = data;
    //                     this.isProgressBarVisibile = false;
    //                 },
    //                 (err) => {
    //                     this.isProgressBarVisibile = false;
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         err instanceof Object
    //                             ? "Something went wrong"
    //                             : err,
    //                         SnackBarStatus.danger
    //                     );
    //                 }
    //             );
    //     } else if (this.currentUserRole === "Customer") {
    //         this._dashboardService
    //             .GetInvoiceHeaderDetailByUsername(this.currentUserCode)
    //             .subscribe(
    //                 (data: InvoiceHeaderDetail[]) => {
    //                     this.allInvoiceHeaderDetails = data;
    //                     this.isProgressBarVisibile = false;
    //                 },
    //                 (err) => {
    //                     this.isProgressBarVisibile = false;
    //                     this.notificationSnackBarComponent.openSnackBar(
    //                         err instanceof Object
    //                             ? "Something went wrong"
    //                             : err,
    //                         SnackBarStatus.danger
    //                     );
    //                 }
    //             );
    //     }
    // }
    LoadInitialData(): void {
        if (this.currentUserRole === "Amararaja User") {
            this.FilterPendingInvoices();
        } else if (this.currentUserRole === "Customer") {
            this.FilterPendingInvoicesByUser();
        }
    }
    SearchInvoices(): void {
        this.currentLabel = 'PENDING INVOICES';
        this.currentCustomPage = 1;
        this.allInvoiceDetails = [];
        this.getFilteredInvoiceDetails();
    }
    getFilteredInvoiceDetails(): void {
        if (this.InvoiceFilterFormGroup.valid) {
            if (!this.isDateError) {
                this.currentCustomPage = 1;
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
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        if (!this.CurrentFilterClass) {
            this.CurrentFilterClass = new FilterClass();
        }
        this.CurrentFilterClass.StartDate = StartDate;
        this.CurrentFilterClass.EndDate = EndDate;
        this.CurrentFilterClass.Organization = Organization1;
        this.CurrentFilterClass.Division = Division;
        this.CurrentFilterClass.Plant = Plant1;
        this._shareParameterService.SetDashboardFilterClass(this.CurrentFilterClass);
        this.isProgressBarVisibile1 = true;
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterInvoiceStatusCount(this.currentUserID, Organization1, Division, Plant1, StartDate, EndDate)
                .subscribe(
                    (data: InvoiceStatusCount) => {
                        const chartData: number[] = [];
                        chartData.push(data.ConfirmedInvoices);
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);
                        this.doughnutChartData = chartData;
                        this.isProgressBarVisibile1 = false;

                        this.FilterPendingInvoices();
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
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
                        chartData.push(data.PartiallyConfirmedInvoices);
                        chartData.push(data.PendingInvoices);
                        this.doughnutChartData = chartData;
                        this.isProgressBarVisibile1 = false;

                        this.FilterPendingInvoicesByUser();
                    },
                    (err) => {
                        this.isProgressBarVisibile1 = false;
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
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile2 = true;
        if (this.currentUserRole === "Amararaja User") {
            this._dashboardService
                .FilterDeliveryCount(this.currentUserID, Organization1, Division, Plant1, StartDate, EndDate)
                .subscribe(
                    (data: DeliveryCount) => {
                        const chartData: number[] = [];

                        chartData.push(data.InLineDelivery);
                        chartData.push(data.DelayedDelivery);

                        this.doughnutChartData1 = chartData;

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
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

                        this.isProgressBarVisibile2 = false;
                    },
                    (err) => {
                        this.isProgressBarVisibile2 = false;
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

    GoToInvoiceItem(invoiceDetails: InvoiceDetails): void {
        // const invoiceDetails: InvoiceDetails = new InvoiceDetails();
        // invoiceDetails.HEADER_ID = inv.HEADER_ID;
        // invoiceDetails.INV_NO = inv.INV_NO;
        // invoiceDetails.ODIN = inv.ODIN;
        // invoiceDetails.INV_DATE = inv.INV_DATE;
        // invoiceDetails.INV_TYPE = inv.INV_TYPE;
        // invoiceDetails.PLANT = inv.PLANT;
        // invoiceDetails.VEHICLE_NO = inv.VEHICLE_NO;
        // invoiceDetails.EWAYBILL_NO = inv.EWAYBILL_NO;
        // invoiceDetails.OUTBOUND_DELIVERY = inv.OUTBOUND_DELIVERY;
        // invoiceDetails.VEHICLE_REPORTED_DATE = inv.VEHICLE_REPORTED_DATE;
        // invoiceDetails.STATUS = inv.STATUS;
        this._shareParameterService.SetInvoiceDetail(invoiceDetails);
        this._router.navigate(['/pages/invItem']);
    }


    doughnutChartClicked(e: any): void {
        // console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                // console.log(clickedElementIndex, label, value);
                if (label) {
                    if (label.toLowerCase() === "pending invoices") {
                        this.currentLabel = 'PENDING INVOICES';
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterPendingInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterPendingInvoicesByUser();
                        }
                    }
                    else if (label.toLowerCase() === "confirmed invoices") {
                        this.currentLabel = 'CONFIRMED INVOICES';
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterConfirmedInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterConfirmedInvoicesByUser();
                        }
                    }
                    else if (label.toLowerCase() === "partially confirmed invoices") {
                        this.currentLabel = 'PARTIALLY CONFIRMED INVOICES';
                        this.currentCustomPage = 1;
                        this.allInvoiceDetails = [];
                        if (this.currentUserRole === "Amararaja User") {
                            this.FilterPartiallyConfirmedInvoices();
                        } else if (this.currentUserRole === "Customer") {
                            this.FilterPartiallyConfirmedInvoicesByUser();
                        }
                    }
                }
            }
        }
    }
    doughnutChart1Clicked(e: any): void {
        // console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex] as String;
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                // console.log(clickedElementIndex, label, value);
                if (label.toLowerCase() === "on time delivery") {
                    this.currentLabel = 'ON TIME DELIVERY';
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterOnTimeDeliveryInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterOnTimeDeliveryInvoicesByUser();
                    }
                }
                else if (label.toLowerCase() === "late delivery") {
                    this.currentLabel = 'LATE DELIVERY';
                    this.currentCustomPage = 1;
                    this.allInvoiceDetails = [];
                    if (this.currentUserRole === "Amararaja User") {
                        this.FilterLateDeliveryInvoices();
                    } else if (this.currentUserRole === "Customer") {
                        this.FilterLateDeliveryInvoicesByUser();
                    }
                }
            }
        }
    }
    LoadMoreData(): void {
        if (this.currentLabel.toLowerCase() === "pending invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterPendingInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterPendingInvoicesByUser();
            }
        }
        else if (this.currentLabel.toLowerCase() === "confirmed invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterConfirmedInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterConfirmedInvoicesByUser();
            }
        }
        else if (this.currentLabel.toLowerCase() === "partially confirmed invoices") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterPartiallyConfirmedInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterPartiallyConfirmedInvoicesByUser();
            }
        }
        else if (this.currentLabel.toLowerCase() === "on time delivery") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterOnTimeDeliveryInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterOnTimeDeliveryInvoicesByUser();
            }
        }
        else if (this.currentLabel.toLowerCase() === "late delivery") {
            this.currentCustomPage = this.currentCustomPage + 1;
            if (this.currentUserRole === "Amararaja User") {
                this.FilterLateDeliveryInvoices();
            } else if (this.currentUserRole === "Customer") {
                this.FilterLateDeliveryInvoicesByUser();
            }
        }
    }
    FilterConfirmedInvoices(): void {
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterConfirmedInvoices(this.currentUserID, this.currentCustomPage, this.records, Organization1, Division, Plant1, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterPartiallyConfirmedInvoices(): void {
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterPartiallyConfirmedInvoices(this.currentUserID, this.currentCustomPage, this.records, Organization1, Division, Plant1, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterPendingInvoices(): void {
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterPendingInvoices(this.currentUserID, this.currentCustomPage, this.records, Organization1, Division, Plant1, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterOnTimeDeliveryInvoices(): void {
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterOnTimeDeliveryInvoices(this.currentUserID, this.currentCustomPage, this.records, Organization1, Division, Plant1, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterLateDeliveryInvoices(): void {
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
            Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
            Plant1 = '';
        }
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterLateDeliveryInvoices(this.currentUserID, this.currentCustomPage, this.records, Organization1, Division, Plant1, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterConfirmedInvoicesByUser(): void {
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterConfirmedInvoicesByUser(this.currentUserCode, this.currentCustomPage, this.records, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }
    FilterPartiallyConfirmedInvoicesByUser(): void {
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterPartiallyConfirmedInvoicesByUser(this.currentUserCode, this.currentCustomPage, this.records, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }
    FilterPendingInvoicesByUser(): void {
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterPendingInvoicesByUser(this.currentUserCode, this.currentCustomPage, this.records, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterOnTimeDeliveryInvoicesByUser(): void {
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterOnTimeDeliveryInvoicesByUser(this.currentUserCode, this.currentCustomPage, this.records, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }

    FilterLateDeliveryInvoicesByUser(): void {
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
        this.isProgressBarVisibile = true;
        this._dashboardService.FilterLateDeliveryInvoicesByUser(this.currentUserCode, this.currentCustomPage, this.records, StartDate, EndDate).subscribe(
            (data) => {
                const data1 = data as InvoiceHeaderDetail[];
                if (data1) {
                    if (data.length < this.records) {
                        this.isLoadMoreVisible = false;
                    } else {
                        this.isLoadMoreVisible = true;
                    }
                    data1.forEach(x => {
                        this.allInvoiceDetails.push(x);
                    });
                }
                this.dataSource = new MatTableDataSource(this.allInvoiceDetails);
                this.dataSource.paginator = this.paginator;
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }
}
