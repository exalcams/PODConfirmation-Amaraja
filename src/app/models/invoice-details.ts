export class InvoiceDetails {
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
    ACTUAL_UNLOAD_DATE: string;
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
