
export interface IUPC {
  upcpart1?: string;
  upcpart2?: string;
  upcpart3?: string;
  upcpart4?: string;
}
export interface IVendorComplain {
  key: number;
  upc?: IUPC;
  gtin?: string;
  corporateItemCode?: string;
  warningText?: string;
  itemDescription?: string;
  isProp65: string;
  isOnLabel: string;
  foodInd?: string;
  effFromDate?: string;
  isEditable: boolean;
  canBeEditable: boolean;
  isCloned: boolean;
}

export interface INewItem {
  upc?: IUPC;
  gtin?: string;
  corporateItemCode?: string;
}

export interface IAttachmentProps {
  userid?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  vendNum?: string;
  vendName?: string;
  files?: IAttachment[];
  setFiles: Function;
  changeStep: Function;
}

export interface IAttachment {
  key?: number;
  name?: string;
  uploadTimeStamp?: string;
  serverRelativeUrl?: string;
}

export interface IModalData {
  key?: string;
  value?: string;
  index?: number;
}

export enum Step {
  step1,
  step2,
  step3
}
export interface IContactInfo {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  employer?: string;
}

export interface IVendorInfo {
  vendNum?: string;
  vendName?: string;
}

export interface IValidationError {
  errors?: IValidationFields[];
  hasError?: boolean;
}

export interface IValidationFields {
  field?: string;
  errorMessage?: string;
}

export interface IContactModalData {
  subject?: string;
  body?: string;
}

