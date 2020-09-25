import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule, 
    MatProgressSpinnerModule, MatTooltipModule, MatProgressBarModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonToggleModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule, MatNativeDateModule, MatPaginatorModule, MatRippleModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatTableModule, MatSortModule, MatTabsModule, MatTreeModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule, FuseCountdownModule, FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule } from '@fuse/components';
import { MenuAppComponent } from './menu-app/menu-app.component';
import { RoleComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { RoleSideBarComponent } from './role/role-side-bar/role-side-bar.component';
import { RoleMainContentComponent } from './role/role-main-content/role-main-content.component';
import { MenuAppSideBarComponent } from './menu-app/menu-app-side-bar/menu-app-side-bar.component';
import { MenuAppMainContentComponent } from './menu-app/menu-app-main-content/menu-app-main-content.component';
import { ReasonComponent } from './reason/reason.component';
import { PlantComponent } from './plant/plant.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { OrganizationComponent } from './organization/organization.component';
import { DataMigrationComponent } from './data-migration/data-migration.component';

const menuRoutes: Routes = [
    // {
    //     path: 'menuApp',
    //     component: MenuAppComponent,
    // },
    // {
    //     path: 'role',
    //     component: RoleComponent,
    // },
    {
        path: 'user',
        component: UserComponent,
    },
    {
        path: 'organization',
        component: OrganizationComponent,
    },
    {
        path: 'plant',
        component: PlantComponent,
    },
    {
        path: 'reason',
        component: ReasonComponent,
    },
    {
        path: 'dataMigration',
        component: DataMigrationComponent,
    },
];
@NgModule({
    declarations: [
       UserComponent,
       RoleComponent,
       RoleSideBarComponent,
       RoleMainContentComponent,
       MenuAppComponent,
       MenuAppSideBarComponent,
       MenuAppMainContentComponent,
       ReasonComponent,
       PlantComponent,
       OrganizationComponent,
       DataMigrationComponent,
    ],
    imports: [
        RouterModule.forChild(menuRoutes),
        // HttpClientModule,
        // TranslateModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,

        FormsModule
    ],
    providers: [

    ]
})
export class MasterModule {
}

