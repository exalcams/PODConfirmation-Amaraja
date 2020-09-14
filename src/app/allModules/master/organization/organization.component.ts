import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, Organization } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class OrganizationComponent implements OnInit {

  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  DistinctOrganizations: string[] = [];
  AllOrganizations: Organization[] = [];
  SelectedOrganization: Organization;
  searchText = '';
  selectID = '';
  OrganizationFormGroup: FormGroup;
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
    this.OrganizationFormGroup = this._formBuilder.group({
      OrganizationCode: ['', Validators.required],
      Description: ['', Validators.required],
    });
    this.SelectedOrganization = new Organization();
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
      if (this.MenuItems.indexOf('Organization') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllOrganizations();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  ResetControl(): void {
    this.selectID = '';
    this.SelectedOrganization = new Organization();
    this.OrganizationFormGroup.reset();
    Object.keys(this.OrganizationFormGroup.controls).forEach(key => {
      this.OrganizationFormGroup.get(key).markAsUntouched();
    });

  }

  AddOrganization(): void {
    this.ResetControl();
  }

  GetAllOrganizations(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllOrganizations().subscribe(
      (data) => {
        if (data) {
          this.AllOrganizations = data as Organization[];
          if (this.AllOrganizations.length && this.AllOrganizations.length > 0) {
            this.loadSelectedOrganization(this.AllOrganizations[0]);
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

  loadSelectedOrganization(Organization: Organization): void {
    this.ResetControl();
    this.SelectedOrganization = Organization;
    this.selectID = Organization.OrganizationCode;
    this.OrganizationFormGroup.get('OrganizationCode').patchValue(Organization.OrganizationCode);
    this.OrganizationFormGroup.get('Description').patchValue(Organization.Description);
  }

  SaveClicked(): void {
    if (this.OrganizationFormGroup.valid) {
      this.GetOrganizationValues();
      if (this.SelectedOrganization.CreatedBy) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      } else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    } else {
      this.ShowValidationErrors(this.OrganizationFormGroup);
    }
  }

  DeleteClicked(): void {
    if (this.OrganizationFormGroup.valid) {
      const Actiontype = 'Delete';
      this.OpenConfirmationDialog(Actiontype);
    } else {
      this.ShowValidationErrors(this.OrganizationFormGroup);
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
        Catagory: 'Organization'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateOrganization();
          } else if (Actiontype === 'Update') {
            this.UpdateOrganization();
          } else if (Actiontype === 'Delete') {
            this.DeleteOrganization();
          }
        }
      });
  }

  GetOrganizationValues(): void {
    this.SelectedOrganization.OrganizationCode = this.OrganizationFormGroup.get('OrganizationCode').value;
    this.SelectedOrganization.Description = this.OrganizationFormGroup.get('Description').value;
  }
  CreateOrganization(): void {
    this.SelectedOrganization.CreatedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateOrganization(this.SelectedOrganization).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization created successfully', SnackBarStatus.success);
        this.GetAllOrganizations();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  UpdateOrganization(): void {
    this.SelectedOrganization.ModifiedBy = this.CurrentUserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateOrganization(this.SelectedOrganization).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization updated successfully', SnackBarStatus.success);
        this.GetAllOrganizations();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  DeleteOrganization(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteOrganization(this.SelectedOrganization).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Organization deleted successfully', SnackBarStatus.success);
        this.GetAllOrganizations();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

}
