export interface IDetailsDialogData {
  title: string;
  fields: IDetailField[];
  showEditButton?: boolean;
  editButtonText?: string;
}

export interface IDetailField {
  label: string;
  value: any;
  format?: (value: any) => string;
}
