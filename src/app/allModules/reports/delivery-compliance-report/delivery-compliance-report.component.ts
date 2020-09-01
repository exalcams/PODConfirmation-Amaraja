import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Organization, Plant, PlantOrganizationMap, PlantWithOrganization } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { InvoiceDetails, ApproverDetails, ReportInvoice, StatusTemplate } from 'app/models/invoice-details';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatOption } from '@angular/material';
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
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';

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
  AllOrganizations: Organization[] = [];
  AllPlants: Plant[] = [];
  FilteredPlants: Plant[] = [];
  AllPlantOrganizationMaps: PlantOrganizationMap[] = [];
  @ViewChild('allSelected') private allSelected: MatOption;
  @ViewChild('allSelected1') private allSelected1: MatOption;
  Divisions: string[] = [];
  allInvoicesCount: number;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  FilteredInvoiceDetails: ReportInvoice[] = [];
  displayedColumns: string[] = [
    'ORGANIZATION',
    'DIVISION',
    'PLANT',
    'ODIN',
    'INV_NO',
    'ITEM_NO',
    'INV_DATE',
    'INV_TYPE',
    'OUTBOUND_DELIVERY',
    'OUTBOUND_DELIVERY_DATE',
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
    'PROPOSED_DELIVERY_DATE',
    'ACTUAL_DELIVERY_DATE',
    'TRANSIT_LEAD_TIME',
    'MATERIAL_CODE',
    'MATERIAL_DESCRIPTION',
    'QUANTITY',
    'RECEIVED_QUANTITY',
    'QUANTITY_UOM',
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
    private _masterService: MasterService,
    private _excelService: ExcelService,
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
      Organization: [''],
      Division: [''],
      Plant: [''],
      CustomerName: ['']
    });
    this.isDateError = false;
    this.GetAllOrganizations();
    this.GetAllPlants();
    this.GetAllPlantOrganizationMaps();
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
        this.isProgressBarVisibile = false;
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
        let Organization1 = this.InvoiceFilterFormGroup.get('Organization').value as string;
        if (Organization1 && Organization1.toLowerCase() === "all") {
          Organization1 = '';
        }
        const Division = this.InvoiceFilterFormGroup.get('Division').value;
        let Plant1 = this.InvoiceFilterFormGroup.get('Plant').value as string;
        if (Plant1 && Plant1.toLowerCase() === "all") {
          Plant1 = '';
        }
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
          .GetFilteredInvoiceDetails(this.authenticationDetails.userID, Status, StartDate, EndDate, InvoiceNumber, Organization1, Division, Plant1, CustomerName)
          .subscribe(
            data => {
              this.FilteredInvoiceDetails = data as ReportInvoice[];
              // this.allInvoicesCount = this.FilteredInvoiceDetails.length;
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
  togglePerOne1(): boolean | void {
    // if (this.allSelected1.selected) {
    //   this.allSelected1.deselect();
    //   this.getFilteredPlants();
    //   return false;
    // }
    // if (this.InvoiceFilterFormGroup.get('OrganizationList').value.length) {
    //   if (this.InvoiceFilterFormGroup.get('OrganizationList').value.length === this.AllOrganizations.length) {
    //     this.allSelected1.select();
    //   }
    // }
    this.getFilteredPlants();
  }
  toggleAllSelection1(): void {
    // if (this.allSelected1.selected) {
    //   const pls = this.AllOrganizations.map(x => x.OrganizationCode);
    //   pls.push("all");
    //   this.InvoiceFilterFormGroup.get('OrganizationList').patchValue(pls);
    // } else {
    //   this.InvoiceFilterFormGroup.get('OrganizationList').patchValue([]);
    // }
    this.getFilteredPlants();
  }

  getFilteredPlants(): void {
    const org = this.InvoiceFilterFormGroup.get('Organization').value as string;
    if (org) {
      const plantOrgMap = this.AllPlantOrganizationMaps.filter(o => o.OrganizationCode === org);
      this.FilteredPlants = this.AllPlants.filter(o => plantOrgMap.some(y => o.PlantCode === y.PlantCode));
      const pl = this.InvoiceFilterFormGroup.get('Plant').value as string;
      if (pl) {
        const index = this.FilteredPlants.findIndex(x => x.PlantCode === pl);
        if (index < 0) {
          this.InvoiceFilterFormGroup.get('Plant').patchValue('');
        }
      }
    }
  }

  togglePerOne(): boolean | void {
    // if (this.allSelected.selected) {
    //   this.allSelected.deselect();
    //   return false;
    // }
    // if (this.InvoiceFilterFormGroup.get('PlantList').value.length) {
    //   if (this.InvoiceFilterFormGroup.get('PlantList').value.length === this.FilteredPlants.length) {
    //     this.allSelected.select();
    //   }
    // }
  }
  toggleAllSelection(): void {
    // if (this.allSelected.selected) {
    //   const pls = this.FilteredPlants.map(x => x.PlantCode);
    //   pls.push("all");
    //   this.InvoiceFilterFormGroup.get('PlantList').patchValue(pls);
    // } else {
    //   this.InvoiceFilterFormGroup.get('PlantList').patchValue([]);
    // }
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

  exportAsXLSX(): void {
    const currentPageIndex = this.dataSource.paginator.pageIndex;
    const PageSize = this.dataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.FilteredInvoiceDetails.slice(startIndex, endIndex);
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
        'Material Code': x.MATERIAL_CODE,
        'Material Description': x.MATERIAL_DESCRIPTION,
        'Quantity': x.QUANTITY,
        'Received Quantity': x.RECEIVED_QUANTITY,
        'UOM': x.QUANTITY_UOM,
        'Status': x.STATUS,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'report');
  }
}

