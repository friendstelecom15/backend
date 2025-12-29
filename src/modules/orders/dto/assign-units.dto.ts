export class AssignOrderItemUnitsDto {
  orderItemId: string;
  units: {
    imei?: string;
    serial?: string;
  }[];
}
