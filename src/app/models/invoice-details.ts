export class InvoiceDetails {
    HEADER_ID: number;
    PLANT: string;
    PLANT_NAME: string;
    INV_NO: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    ORGANIZATION: string;
    DIVISION: string;
    ODIN: string;
    VEHICLE_NO: string;
    VEHICLE_CAPACITY: string;
    POD_DATE: Date | string | null;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: Date | string | null;
    LR_NO: string;
    LR_DATE: Date | string | null;
    FWD_AGENT: string;
    CARRIER: string;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: Date | string | null;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: Date | string | null;
    ACTUAL_DISPATCH_DATE: Date | string | null;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    ISXMLCREATED: boolean;
    XMLMOVED_ON: Date | string | null;
    CREATED_BY: string;
    CREATED_ON: Date | string;
    IS_ACTIVE: boolean;
}

export class InvoiceItemDetails {
    ITEM_ID: number;
    ITEM_NO: string;
    HEADER_ID: number;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    RECEIVED_QUANTITY: string;
    QUANTITY_UOM: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    REASON: string;
    REMARKS: string;
    CREATED_BY: string;
    CREATED_ON: Date | string;
    IS_ACTIVE: boolean;
}

export class ApproverDetails {
    ApprovedBy: string;
    HEADERIDs: number[];
}

export class InvoiceUpdation {
    VEHICLE_REPORTED_DATE: string;
    InvoiceItems: InvoiceItemDetails[];
}

export class InvoiceUpdation1 {
    VEHICLE_REPORTED_DATE: string;
    HEADER_ID: number;
}

export class ReportInvoice {
    HEADER_ID: number;
    INV_NO: string;
    ITEM_ID: number;
    ITEM_NO: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    ORGANIZATION: string;
    DIVISION: string;
    ODIN: string;
    LR_NO: string;
    LR_DATE: Date | string | null;
    VEHICLE_NO: string;
    CARRIER: string;
    VEHICLE_CAPACITY: string;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: Date | string | null;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: Date | string | null;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    RECEIVED_QUANTITY: string;
    QUANTITY_UOM: string;
    PLANT: string;
    PLANT_NAME: string;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: Date | string | null;
    ACTUAL_DISPATCH_DATE: Date | string | null;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    POD_UPLOADE_STATUS: string;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
    STATUS: string;
    ATTACHMENT_ID: number;
    ATTACHMENT_NAME: string;
}

export class StatusTemplate {
    key: string;
    value: string;
}

export class DeliveryCount {
    TotalDelivery: number;
    InLineDelivery: number;
    DelayedDelivery: number;
}

export class InvoiceStatusCount {
    TotalInvoices: number;
    ConfirmedInvoices: number;
    PartiallyConfirmedInvoices: number;
    PendingInvoices: number;
}

export class InvoiceHeaderDetail {
    HEADER_ID: number;
    ORGANIZATION: string;
    DIVISION: string;
    PLANT: string;
    PLANT_NAME: string;
    INV_NO: string;
    ODIN: string;
    INV_DATE: Date | string | null;
    INV_TYPE: string;
    CUSTOMER: string;
    CUSTOMER_NAME: string;
    VEHICLE_NO: string;
    VEHICLE_CAPACITY: string;
    LR_NO: string;
    LR_DATE: Date | string | null;
    EWAYBILL_NO: string;
    OUTBOUND_DELIVERY: string;
    PROPOSED_DELIVERY_DATE: Date | string | null;
    VEHICLE_REPORTED_DATE: Date | string | null;
    ACTUAL_DELIVERY_DATE: Date | string | null;
    STATUS: string;
}
export class AttachmentDetails {
    FileName: string;
    blob: Blob;
}

export class FilterClass {
    Status: string;
    StartDate: string;
    EndDate: string;
    InvoiceNumber: string;
    Organization: string;
    Division: string;
    Plant: string;
    CustomerName: string;
    LRNumber: string;
}
