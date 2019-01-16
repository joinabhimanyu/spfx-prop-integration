

export interface IVendorComplain {
  key: number;
  upcpart1?: string;
  upcpart2?: string;
  upcpart3?: string;
  upcpart4?: string;
  gtin?: string;
  corporateItemCode?: string;
  warningText?: string;
  itemDescription?: string;
  isProp65: string;
  isOnLabel: string;
  foodInd?: string;
  effFromDate?: string;
  isEditable: boolean;
  attachment?: IAttachment;
}

export interface INewItem {
  upcpart1?: string;
  upcpart2?: string;
  upcpart3?: string;
  upcpart4?: string;
  gtin?: string;
  corporateItemCode?: string;
}

export interface IAttachment {
  name?: string;
  data?: any;
  typeOfDocument?: string;
}

export interface IAttachmentModalData {
  key?: number;
  name?: string;
  data?: any;
  typeOfDocument?: string;
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
  validationMessege?: string;
  hasError: boolean;
}

export interface IContactModalData {
  subject?: string;
  body?: string;
}

