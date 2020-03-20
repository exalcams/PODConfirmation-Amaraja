import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';

import {
    MatFormFieldModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
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
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule
} from '@angular/material';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';

import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AcademyCoursesService } from 'app/services/courses.service';
import { AcademyCourseService } from 'app/services/course.service';
import { AcademyCoursesComponent } from './academy/courses/courses.component';
import { AcademyCourseComponent } from './academy/course/course.component';
import { InvoiceItemComponent } from './invoice-item/invoice-item.component';
import { DecimalPipe } from '@angular/common';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';

const routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'invoices',
        component: InvoiceDetailsComponent
    },
    {
        path: 'invItem',
        component: InvoiceItemComponent
    },
    // {
    //     path     : 'courses',
    //     component: AcademyCoursesComponent,
    //     resolve  : {
    //         academy: AcademyCoursesService
    //     }
    // },
    // {
    //     path     : 'courses/:courseId/:courseSlug',
    //     component: AcademyCourseComponent,
    //     resolve  : {
    //         academy: AcademyCourseService
    //     }
    // },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
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
        MatSortModule,
        MatTableModule,
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
    declarations: [DashboardComponent, AcademyCourseComponent, AcademyCoursesComponent, InvoiceItemComponent, InvoiceDetailsComponent],
    providers: [
        AcademyCoursesService,
        AcademyCourseService,
        DecimalPipe
    ],
    entryComponents: []
})
export class PagesModule { }
