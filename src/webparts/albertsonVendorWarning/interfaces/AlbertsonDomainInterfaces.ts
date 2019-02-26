
export type VendorOptions = {
  value?: string;
  label?: string;
};

export interface ISite {
  Id?: string;
  MasterUrl?: string;
  CustomMasterUrl?: string;
  ServerRelativeUrl?: string;
  Title?: string;
  Description?: string;
  Url?: string;
  IsCurrentSubSite?: boolean;
}

export enum UserRole {
  Admin,
  Vendor,
  VendorManager
}
export type UserGroup = {
  Description?: string;
  Id?: number;
  LoginName?: string;
  OnlyAllowMembersViewMembership?: boolean;
  OwnerTitle?: string;
  PrincipalType?: string;
  Title?: string;
};
export interface IUserManager {
  Id?: number;
  Email?: string;
  IsEmailAuthenticationGuestUser?: boolean;
  IsShareByEmailGuestUser?: boolean;
  IsSiteAdmin?: boolean;
  Title?: string;
  LoginName?: string;
  PrincipalType?: string;
  Role?: UserRole;
  UserGroups?: UserGroup[];
}
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
  isProp65?: string;
  isOnLabel?: string;
  foodInd?: string;
  effFromDate?: Date;
  isEditable: boolean;
  isCloned: boolean;
  clonedFrom?: number;
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
  _toggleSpinner: Function;
  changeStep: Function;
  _showAlertDialog:Function;
  _showConfirmDialog:Function;
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
  step1 = 1,
  step2 = 2
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

