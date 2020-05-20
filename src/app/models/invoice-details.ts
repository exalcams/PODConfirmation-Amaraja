export class InvoiceDetails {
    public constructor(init?: Partial<InvoiceDetails>) {
        Object.assign(this, init);
    }
    HEADER_ID: number;
    PLANT: string;
    PLANT_NAME: string;
    INV_NO: string;
    INV_DATE: string;
    INV_TYPE: string;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    QUANTITY_UOM: string;
    LR_NO: string;
    LR_DATE: string;
    VEHICLE_NO: string;
    VEHICLE_CAPACITY: string;
    FWD_AGENT: string;
    CARRIER: string;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: string;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: string;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: string;
    ACTUAL_DISPATCH_DATE: string;
    PROPOSED_DELIVERY_DATE: string;
    VEHICLE_REPORTED_DATE: Date;
    ACTUAL_DELIVERY_DATE: string;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    CREATED_ON?: Date;
    CREATED_BY: string;
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
    LR_NO: string;
    LR_DATE: string;
    FWD_AGENT: string;
    CARRIER: string;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: string;
    STATUS: string;
    STATUS_DESCRIPTION: string;
    REASON: string;
    REMARKS: string;
    CREATED_ON?: Date;
    CREATED_BY: string;
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
    INV_NO: string;
    ITEM_ID: number;
    INV_DATE?: Date;
    INV_TYPE: string;
    LR_NO: string;
    LR_DATE: string;
    VEHICLE_NO: string;
    CARRIER: string;
    VEHICLE_CAPACITY: string;
    EWAYBILL_NO: string;
    EWAYBILL_DATE: string;
    FREIGHT_ORDER: string;
    FREIGHT_ORDER_DATE: string;
    MATERIAL_CODE: string;
    MATERIAL_DESCRIPTION: string;
    QUANTITY: string;
    RECEIVED_QUANTITY: string;
    QUANTITY_UOM: string;
    PLANT: string;
    PLANT_NAME: string;
    OUTBOUND_DELIVERY: string;
    OUTBOUND_DELIVERY_DATE: string;
    ACTUAL_DISPATCH_DATE: string;
    PROPOSED_DELIVERY_DATE?: Date;
    VEHICLE_REPORTED_DATE?: Date;
    ACTUAL_DELIVERY_DATE?: Date;
    POD_UPLOADE_STATUS: string;
    TRANSIT_LEAD_TIME: string;
    CANC_INV_STATUS: string;
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
