import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatOption, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { UserWithRole, AuthenticationDetails, Plant, RoleWithApp } from 'app/models/master';
import { FormGroup, Validators, FormBuilder, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserComponent implements OnInit {
  MenuItems: string[];
  AllUsers: UserWithRole[] = [];
  AllPlants: Plant[] = [];
  SelectedUser: UserWithRole;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  userMainFormGroup: FormGroup;
  AllRoles: RoleWithApp[] = [];
  // fileToUpload: File;
  // fileUploader: FileUploader;
  baseAddress: string;
  slectedProfile: Uint8Array;
  IsPlantDisplay: boolean;
  @ViewChild('allSelected') private allSelected: MatOption;
  searchText: string;
  selectID: Guid;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;

    this.userMainFormGroup = this._formBuilder.group({
      userCode: ['', [Validators.required, Validators.pattern('^\\S*$')]],
      userName: ['', [Validators.required]],
      roleID: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern]],
      PlantList: [[]],
      password: ['', [Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,15}$')]],
      confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
      profile: ['']
    });
    this.userMainFormGroup.get('password').valueChanges.subscribe(
      (data) => {
        this.userMainFormGroup.get('confirmPassword').updateValueAndValidity();
      }
    );
    this.searchText = '';
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedUser = new UserWithRole();
    this.authenticationDetails = new AuthenticationDetails();
    this.IsPlantDisplay = false;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('User') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllPlants();
      this.GetAllRoles();
      this.GetAllUsers();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  ResetControl(): void {
    this.selectID = null;
    this.SelectedUser = new UserWithRole();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      // const control = this.userMainFormGroup.get(key);
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  AddUser(): void {
    this.ResetControl();
  }
  GetAllPlants(): void {
    this._masterService.GetAllPlants().subscribe(
      (data) => {
        this.AllPlants = data as Plant[];
        this.IsProgressBarVisibile = false;
        // console.log(this.AllUsers);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetAllRoles(): void {
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.AllRoles = <RoleWithApp[]>data;
        if (this.SelectedUser) {
          this.CheckRole(this.SelectedUser.RoleID);
        }
        // console.log(this.AllMenuApps);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  GetAllUsers(): void {
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        this.AllUsers = <UserWithRole[]>data;
        if (this.AllUsers.length && this.AllUsers.length > 0) {
          this.loadSelectedUser(this.AllUsers[0]);
        }
        this.IsProgressBarVisibile = false;
        // console.log(this.AllUsers);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedUser(selectedUser: UserWithRole): void {
    this.ResetControl();
    this.SelectedUser = selectedUser;
    this.selectID = selectedUser.UserID;
    this.userMainFormGroup.get('userCode').patchValue(this.SelectedUser.UserCode);
    this.userMainFormGroup.get('userName').patchValue(this.SelectedUser.UserName);
    this.userMainFormGroup.get('PlantList').patchValue(this.SelectedUser.PlantList);
    this.togglePerOne();
    this.userMainFormGroup.get('roleID').patchValue(this.SelectedUser.RoleID);
    this.userMainFormGroup.get('email').patchValue(this.SelectedUser.Email);
    this.userMainFormGroup.get('contactNumber').patchValue(this.SelectedUser.ContactNumber);
    this.CheckRole(this.SelectedUser.RoleID);
    this.userMainFormGroup.get('password').patchValue(this.SelectedUser.Password);
    this.userMainFormGroup.get('confirmPassword').patchValue(this.SelectedUser.Password);

  }
  RoleSelected(event: any): void {
    this.CheckRole(event.value);
  }

  CheckRole(roleID: Guid): void {
    const res = this.CheckIsAmarajaUser(roleID);
    if (res) {
      this.IsPlantDisplay = true;
      this.userMainFormGroup.get('PlantList').setValidators(Validators.required);
      this.userMainFormGroup.get('PlantList').updateValueAndValidity();
    } else {
      this.IsPlantDisplay = false;
      this.userMainFormGroup.get('PlantList').clearValidators();
      this.userMainFormGroup.get('PlantList').updateValueAndValidity();
    }
  }
  CheckIsAmarajaUser(roleID: Guid): boolean {
    const rol = this.AllRoles.filter(x => x.RoleID === roleID)[0];
    if (rol) {
      return rol.RoleName.toLowerCase() === 'amararaja user';
    }
    return false;
  }
  disableSpace(event): boolean {
    // this.AmountSelected();
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32) {
      return false;
    }
    return true;
  }

  togglePerOne(): boolean | void {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.userMainFormGroup.get('PlantList').value.length === this.AllPlants.length) {
      this.allSelected.select();
    }
  }
  toggleAllSelection(): void {
    if (this.allSelected.selected) {
      const pls = this.AllPlants.map(x => x.PlantCode);
      pls.push("all");
      this.userMainFormGroup.get('PlantList').patchValue(pls);
    } else {
      this.userMainFormGroup.get('PlantList').patchValue([]);
    }
  }

  SaveClicked(): void {
    if (this.userMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.SelectedUser.UserID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Update',
            Catagory: 'User'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
              this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
              let plList = this.userMainFormGroup.get('PlantList').value as string[];
              if (plList && plList.length) {
                const index = plList.findIndex(x => x === "all");
                if (index > -1) {
                  plList.splice(index, 1);
                }
              }
              this.SelectedUser.PlantList = plList;
              this.SelectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
              this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
              this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
              this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
              this.IsProgressBarVisibile = true;
              this._masterService.UpdateUser(this.SelectedUser).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
                  this.IsProgressBarVisibile = false;
                  this.GetAllUsers();
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.IsProgressBarVisibile = false;
                }
              );
            }
          }
        );

      } else {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Create',
            Catagory: 'User'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.SelectedUser = new UserWithRole();
              this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
              this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
              let plList = this.userMainFormGroup.get('PlantList').value as string[];
              if (plList && plList.length) {
                const index = plList.findIndex(x => x === "all");
                if (index > -1) {
                  plList.splice(index, 1);
                }
              }
              this.SelectedUser.PlantList = plList;
              // this.user.PlantList = this.userMainFormGroup.get('PlantList').value;
              this.SelectedUser.RoleID = this.userMainFormGroup.get('roleID').value;
              this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
              this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
              this.SelectedUser.CreatedBy = this.authenticationDetails.userID.toString();
              // this.user.Profile = this.slectedProfile;
              this.IsProgressBarVisibile = true;
              this._masterService.CreateUser(this.SelectedUser).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
                  this.IsProgressBarVisibile = false;
                  this.GetAllUsers();
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.IsProgressBarVisibile = false;
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.userMainFormGroup.controls).forEach(key => {
        this.userMainFormGroup.get(key).markAsTouched();
        this.userMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  DeleteClicked(): void {
    if (this.userMainFormGroup.valid) {
      if (this.SelectedUser.UserID) {
        const dialogConfig: MatDialogConfig = {
          data: {
            Actiontype: 'Delete',
            Catagory: 'User'
          },
          panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          result => {
            if (result) {
              this.SelectedUser.UserCode = this.userMainFormGroup.get('userCode').value;
              this.SelectedUser.UserName = this.userMainFormGroup.get('userName').value;
              this.SelectedUser.PlantList = this.userMainFormGroup.get('PlantList').value;
              this.SelectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
              this.SelectedUser.Email = this.userMainFormGroup.get('email').value;
              this.SelectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.SelectedUser.Password = this.userMainFormGroup.get('password').value;
              this.SelectedUser.ModifiedBy = this.authenticationDetails.userID.toString();
              this.IsProgressBarVisibile = true;
              this._masterService.DeleteUser(this.SelectedUser).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
                  this.IsProgressBarVisibile = false;
                  this.GetAllUsers();
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.IsProgressBarVisibile = false;
                }
              );
            }
          });
      }
    } else {
      Object.keys(this.userMainFormGroup.controls).forEach(key => {
        this.userMainFormGroup.get(key).markAsTouched();
        this.userMainFormGroup.get(key).markAsDirty();
      });
    }
  }

  OnUserSelectionChanged(selectedUser: UserWithRole): void {
    // console.log(selectedMenuApp);
    this.SelectedUser = selectedUser;
  }
  OnShowProgressBarEvent(status: string): void {
    if (status === 'show') {
      this.IsProgressBarVisibile = true;
    } else {
      this.IsProgressBarVisibile = false;
    }

  }

  RefreshAllUsers(msg: string): void {
    // console.log(msg);
    this.GetAllUsers();
  }

}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const confirmPassword = control.parent.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (confirmPassword.value === '') {
    return null;
  }

  if (password.value === confirmPassword.value) {
    return null;
  }

  return { 'passwordsNotMatching': true };
};