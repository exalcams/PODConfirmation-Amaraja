import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Reason } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-reason',
  templateUrl: './reason.component.html',
  styleUrls: ['./reason.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ReasonComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctReasons: string[] = [];
  AllReasons: Reason[] = [];
  SelectedReason: Reason;
  searchText = '';
  selectReasonID = 0;
  ReasonFormGroup: FormGroup;
  KeysFormArray: FormArray = this._formBuilder.array([]);
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.ReasonFormGroup = this._formBuilder.group({
      Description: ['', Validators.required],
    });
    this.SelectedReason = new Reason();
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = sessionStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Reason') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllReasons();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    this.selectReasonID = 0;
    this.SelectedReason = new Reason();
    this.ReasonFormGroup.reset();
    Object.keys(this.ReasonFormGroup.controls).forEach(key => {
      this.ReasonFormGroup.get(key).markAsUntouched();
    });

  }

  AddReason(): void {
    this.ResetControl();
  }

  GetAllReasons(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllReasons().subscribe(
      (data) => {
        if (data) {
          this.AllReasons = data as Reason[];
          if (this.AllReasons.length && this.AllReasons.length > 0) {
            this.loadSelectedReason(this.AllReasons[0]);
          }
          this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  loadSelectedReason(reason: Reason): void {
    this.ResetControl();
    this.SelectedReason = reason;
    this.selectReasonID = reason.ReasonID;
    this.ReasonFormGroup.get('Description').patchValue(reason.Description);
  }

  SaveClicked(): void {
    if (this.ReasonFormGroup.valid) {
      this.GetReasonValues();
      if (this.SelectedReason.ReasonID) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.ReasonFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.ReasonFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.ReasonFormGroup);
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

  OpenConfirmationDialog(Actiontype: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: 'Reason'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateReason();
          } else if (Actiontype === 'Update') {
            this.UpdateReason();
          } else if (Actiontype === 'Delete') {
            this.DeleteReason();
          }
        }
      });
  }

  GetReasonValues(): void {
    this.SelectedReason.Description = this.ReasonFormGroup.get('Description').value;
  }
  CreateReason(): void {
    this.SelectedReason.CreatedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason created successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdateReason(): void {
    this.SelectedReason.ModifiedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason updated successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeleteReason(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteReason(this.SelectedReason).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Reason deleted successfully', SnackBarStatus.success);
        this.GetAllReasons();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

}
