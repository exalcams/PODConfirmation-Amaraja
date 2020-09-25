import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogConfig, MatDialog } from "@angular/material";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationDetails, CustomerData } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcelService } from 'app/services/excel.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as XLSX from 'xlsx';
import { ReportService } from 'app/services/report.service';
import { MasterService } from 'app/services/master.service';
@Component({
  selector: "app-data-migration",
  templateUrl: "./data-migration.component.html",
  styleUrls: ["./data-migration.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class DataMigrationComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  arrayBuffer: any;
  fileToUpload: File;
  math = Math;
  CustomerDatas: CustomerData[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _masterService: MasterService,
    private _datePipe: DatePipe,
    private dialog: MatDialog,
  ) {
    this.IsProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.userID;
      this.currentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('DataMigration') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  UploadDataMigrationClicked(): void {
    if (this.fileToUpload) {
      if (this.CustomerDatas && this.CustomerDatas.length > 0) {
        this.SetActionToOpenConfirmation('Submit');
      } else {
        this.notificationSnackBarComponent.openSnackBar('Seleted file does not have valid customer data', SnackBarStatus.danger);
      }
    } else {
      this.notificationSnackBarComponent.openSnackBar('Please select a file to upload customer data', SnackBarStatus.danger);
    }

  }

  UploadDataMigrationAttachment(Actiontype: string): void {
    this.CreateCustomer();
  }

  CreateCustomer(): void {
    this.IsProgressBarVisibile = true;
    if (this.CustomerDatas) {
      this._masterService.CreateCustomers(this.CustomerDatas).subscribe((data) => {
        this.notificationSnackBarComponent.openSnackBar('Customer data submitted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.ResetControl();
      },
        (err) => {
          console.error(err);
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
          this.IsProgressBarVisibile = false;
        });
    }
  }



  ResetControl(): void {
    this.CustomerDatas = [];
    this.ResetAttachments();
  }

  ResetAttachments(): void {
    this.fileToUpload = null;
  }

  SetActionToOpenConfirmation(Actiontype: string): void {
    const Catagory = 'Customer Data';
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
          if (Actiontype === 'Submit') {
            this.UploadDataMigrationAttachment(Actiontype);
          }
        }
      });
  }

  onSelectFile(event): void {
    this.ResetControl();
    this.fileToUpload = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.fileToUpload);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join("");
      const workbook = XLSX.read(bstr, { type: "binary" });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      this.CustomerDatas = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as CustomerData[];
      // workbook.SheetNames.forEach(element => {
      //   if (element.toLowerCase() === 'bpc_fact') {
      //     const worksheet1 = workbook.Sheets[element];
      //     this.BPCFactXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCFactXLSX[];
      //   }
      // });
      // const first_sheet_name = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[first_sheet_name];
      // console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      // const arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // this.fileToUploadList = [];
      // console.log(this.fileToUploadList);
    };
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

}
