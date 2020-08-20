import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { AuthService } from 'app/services/auth.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';
import { UserWithRole, RoleWithApp, AuthenticationDetails, Plant } from 'app/models/master';
import { CustomValidator } from 'app/shared/custom-validator';

@Component({
  selector: 'user-main-content',
  templateUrl: './user-main-content.component.html',
  styleUrls: ['./user-main-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserMainContentComponent implements OnInit, OnChanges {

  @Input() currentSelectedUser: UserWithRole = new UserWithRole();
  @Output() SaveSucceed: EventEmitter<string> = new EventEmitter<string>();
  @Output() ShowProgressBarEvent: EventEmitter<string> = new EventEmitter<string>();
  user: UserWithRole;
  userMainFormGroup: FormGroup;
  AllRoles: RoleWithApp[] = [];
  AllPlants: Plant[] = [];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // fileToUpload: File;
  // fileUploader: FileUploader;
  baseAddress: string;
  slectedProfile: Uint8Array;
  authenticationDetails: AuthenticationDetails;
  IsPlantDisplay: boolean;

  constructor(private _masterService: MasterService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authService: AuthService) {
    this.userMainFormGroup = this._formBuilder.group({
      userCode: ['', [Validators.required, Validators.pattern('^\\S*$')]],
      userName: ['', [Validators.required]],
      roleID: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern]],
      PlantList: [''],
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
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.user = new UserWithRole();
    this.authenticationDetails = new AuthenticationDetails();
    this.baseAddress = _authService.baseAddress;
    this.IsPlantDisplay = false;
  }


  ngOnInit(): void {

    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetAllRoles();
    this.GetAllPlants();
  }

  ResetControl(): void {
    this.user = new UserWithRole();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      // const control = this.userMainFormGroup.get(key);
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllRoles(): void {
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.AllRoles = <RoleWithApp[]>data;
        if (this.user) {
          this.CheckRole(this.user.RoleID);
        }
        // console.log(this.AllMenuApps);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllPlants(): void {
    this._masterService.GetAllPlants().subscribe(
      (data) => {
        this.AllPlants = data as Plant[];
        const plant = new Plant();
        plant.PlantCode = 'All';
        plant.Description = 'All';
        this.AllPlants.unshift(plant);
      },
      (err) => {
        console.error(err);
      }
    );
  }

  OnPlantChanged(event): void {
    const val = event.value as string[];
    if (val && val.length) {
      if (val.includes("All")) {
        const pls = this.AllPlants.map(x => x.PlantCode);
        // this.userMainFormGroup.get('PlantList').patchValue(pls);
        this.userMainFormGroup.get('PlantList').patchValue(["All"]);
      }
    }
  }

  SaveClicked(): void {
    if (this.userMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.user.UserID) {
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
              this.ShowProgressBarEvent.emit('show');
              this.user.UserCode = this.userMainFormGroup.get('userCode').value;
              this.user.UserName = this.userMainFormGroup.get('userName').value;
              this.user.PlantList = this.userMainFormGroup.get('PlantList').value;
              this.user.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
              this.user.Email = this.userMainFormGroup.get('email').value;
              this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.user.Password = this.userMainFormGroup.get('password').value;
              this.user.ModifiedBy = this.authenticationDetails.userID.toString();
              this._masterService.UpdateUser(this.user).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('User updated successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
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
              this.ShowProgressBarEvent.emit('show');
              this.user = new UserWithRole();
              this.user.UserCode = this.userMainFormGroup.get('userCode').value;
              this.user.UserName = this.userMainFormGroup.get('userName').value;
              this.user.PlantList = this.userMainFormGroup.get('PlantList').value;
              this.user.RoleID = this.userMainFormGroup.get('roleID').value;
              this.user.Email = this.userMainFormGroup.get('email').value;
              this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.user.Password = this.userMainFormGroup.get('password').value;
              this.user.CreatedBy = this.authenticationDetails.userID.toString();
              // this.user.Profile = this.slectedProfile;
              this._masterService.CreateUser(this.user).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('User created successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
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
      if (this.user.UserID) {
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
              this.ShowProgressBarEvent.emit('show');
              this.user.UserCode = this.userMainFormGroup.get('userCode').value;
              this.user.UserName = this.userMainFormGroup.get('userName').value;
              this.user.PlantList = this.userMainFormGroup.get('PlantList').value;
              this.user.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
              this.user.Email = this.userMainFormGroup.get('email').value;
              this.user.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
              this.user.Password = this.userMainFormGroup.get('password').value;
              this.user.ModifiedBy = this.authenticationDetails.userID.toString();
              this._masterService.DeleteUser(this.user).subscribe(
                (data) => {
                  // console.log(data);
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
                  this.SaveSucceed.emit('success');
                  this._masterService.TriggerNotification('User deleted successfully');
                },
                (err) => {
                  console.error(err);
                  this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                  this.ShowProgressBarEvent.emit('hide');
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentSelectedUser) {
      this.user = new UserWithRole();
      this.user.UserID = this.currentSelectedUser.UserID;
      this.user.UserCode = this.currentSelectedUser.UserCode;
      this.user.UserName = this.currentSelectedUser.UserName;
      this.user.PlantList = this.currentSelectedUser.PlantList;
      this.user.RoleID = this.currentSelectedUser.RoleID;
      this.user.Email = this.currentSelectedUser.Email;
      this.user.ContactNumber = this.currentSelectedUser.ContactNumber;
      this.user.Password = this.currentSelectedUser.Password;
      this.user.CreatedBy = this.currentSelectedUser.CreatedBy;
      this.user.CreatedOn = this.currentSelectedUser.CreatedOn;
      this.user.ModifiedBy = this.currentSelectedUser.ModifiedBy;
      this.user.ModifiedOn = this.currentSelectedUser.ModifiedOn;
      this.userMainFormGroup.get('userCode').patchValue(this.user.UserCode);
      this.userMainFormGroup.get('userName').patchValue(this.user.UserName);
      this.userMainFormGroup.get('PlantList').patchValue(this.user.PlantList);
      this.userMainFormGroup.get('roleID').patchValue(this.user.RoleID);
      this.userMainFormGroup.get('email').patchValue(this.user.Email);
      this.userMainFormGroup.get('contactNumber').patchValue(this.user.ContactNumber);
      this.CheckRole(this.user.RoleID);
      this.userMainFormGroup.get('password').patchValue(this.user.Password);
      this.userMainFormGroup.get('confirmPassword').patchValue(this.user.Password);
    } else {
      // this.menuAppMainFormGroup.get('appName').patchValue('');
      this.ResetControl();
    }
  }
  disableSpace(event): boolean {
    // this.AmountSelected();
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32) {
      return false;
    }
    return true;
  }
  // handleFileInput(evt): void {
  //   if (evt.target.files && evt.target.files.length > 0) {
  //     this.fileToUpload = evt.target.files[0];
  //   }
  // }
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
