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

// import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';
import { ChartsModule } from "ng2-charts";
import 'chart.js';
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AcademyCoursesService } from 'app/services/courses.service';
import { AcademyCourseService } from 'app/services/course.service';
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
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        // NgxChartsModule,
        // NgxDonutChartModule,
        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        ChartsModule,
        FormsModule
    ],
    declarations: [DashboardComponent, InvoiceItemComponent, InvoiceDetailsComponent],
    providers: [
        AcademyCoursesService,
        AcademyCourseService,
        DecimalPipe
    ],
    entryComponents: []
})
export class PagesModule { }
