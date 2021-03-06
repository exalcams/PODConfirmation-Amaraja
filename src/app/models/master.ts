import { Guid } from 'guid-typescript';

export class CustomerData {
    UserCode: string;
    UserName: string;
    Email: string;
    Password: string;
    ContactNumber: string;
}
export class UserWithRole {
    UserID: Guid;
    RoleID: Guid;
    UserName: string;
    UserCode: string;
    Email: string;
    Password: string;
    ContactNumber: string;
    OrganizationList: string[];
    PlantList: string[];
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class RoleWithApp {
    RoleID: Guid;
    RoleName: string;
    AppIDList: number[];
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class MenuApp {
    AppID: number;
    AppName: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class Reason {
    ReasonID: number;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}


export class AuthenticationDetails {
    isAuth: boolean;
    userID: Guid;
    userCode: string;
    userName: string;
    displayName: string;
    emailAddress: string;
    userRole: string;
    menuItemNames: string;
    profile: string;
    refreahToken: string;
    expires: string;
    issued: string;
    expiresin: string;
}
export class ChangePassword {
    UserID: Guid;
    UserName: string;
    CurrentPassword: string;
    NewPassword: string;
}
export class EMailModel {
    EmailAddress: string;
    siteURL: string;
}
export class ForgotPassword {
    UserID: Guid;
    EmailAddress: string;
    NewPassword: string;
    Token: string;
}
export class UserNotification {
    ID: number;
    UserID: string;
    Message: string;
    HasSeen: boolean;
    CreatedOn: Date;
    ModifiedOn?: Date;
}
export class Organization {
    OrganizationCode: string;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}

export class Plant {
    PlantCode: string;
    Description: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class PlantOrganizationMap {
    OrganizationCode: string;
    PlantCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class UserOrganizationMap {
    UserID: string;
    OrganizationCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class UserPlantMap {
    UserID: string;
    PlantCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
export class PlantWithOrganization {
    PlantCode: string;
    Description: string;
    OrganizationCode: string;
    IsActive: boolean;
    CreatedOn: Date | string;
    CreatedBy: string;
    ModifiedOn: Date | string | null;
    ModifiedBy: string;
}
