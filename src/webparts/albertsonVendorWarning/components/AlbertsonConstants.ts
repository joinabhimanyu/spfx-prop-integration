import { IColumn } from "office-ui-fabric-react/lib/components/DetailsList";
import { IDatePickerStrings } from "office-ui-fabric-react/lib/components/DatePicker";
import { IVendorComplain } from "../interfaces/AlbertsonDomainInterfaces";

export interface IValidationBlob {
  field?: string;
  required: boolean;
  pattern?: RegExp;
}

export const _contactInfoValidationBlob: IValidationBlob[] = [
  {
    field: 'firstname',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'lastname',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'email',
    required: true,
    pattern: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
  },
  {
    field: 'phone',
    required: true,
    pattern: /^([0-9]{10})$/
  },
  {
    field: 'employer',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  }
];

export const _venderInfoValidationBlob: IValidationBlob[] = [
  {
    field: 'vendName',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'vendNum',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
];

export const _itemsValidationBlob: IValidationBlob[] = [
  {
    field: 'upcpart1',
    required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'upcpart2', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'upcpart3', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'upcpart4', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'gtin', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'corporateItemCode', required: true,
    pattern: /^([a-zA-Z0-9 _-]{8})$/
  },
  {
    field: 'warningText', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'itemDescription', required: true,
    pattern: /^([a-zA-Z0-9 _-]+)$/
  },
  {
    field: 'isProp65',
    required: true
  },
  {
    field: 'isOnLabel',
    required: true
  },
  {
    field: 'foodInd',
    required: true
  }
];

export const _columns: IColumn[] = [
  {
    key: 'isDelete',
    name: '',
    fieldName: '',
    minWidth: 10,
    maxWidth: 10,
    isResizable: false,
    data: 'string',
    isPadded: true
  },
  {
    key: 'upcpart1',
    name: '',
    fieldName: 'upcpart1',
    minWidth: 30,
    maxWidth: 30,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,
    data: 'string',
    isPadded: false
  },
  {
    key: 'upcpart2',
    name: '',
    fieldName: 'upcpart2',
    minWidth: 30,
    maxWidth: 30,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,
    data: 'string',
    isPadded: false
  },
  {
    key: 'upcpart3',
    name: 'UPC Name',
    fieldName: 'upcpart3',
    minWidth: 50,
    maxWidth: 50,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,
    data: 'string',
    isPadded: false
  },
  {
    key: 'upcpart4',
    name: '',
    fieldName: 'upcpart4',
    minWidth: 50,
    maxWidth: 50,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,
    data: 'string',
    isPadded: false
  },
  {
    key: 'gtin',
    name: 'GTIN/Item Id',
    fieldName: 'gtin',
    minWidth: 97,
    maxWidth: 100,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,

    data: 'string',
    isPadded: false
  },
  {
    key: 'corporateItemCode',
    name: 'Corporate Item Code',
    fieldName: 'corporateItemCode',
    minWidth: 74,
    maxWidth: 80,
    isResizable: false,
    // isSorted: true,
    // isSortedDescending: false,
    // onColumnClick: this._onColumnClick,
    data: 'string',
    isPadded: false
  },
  {
    key: 'warningText',
    name: 'Warning Text/Removal Reason',
    fieldName: 'warningText',
    minWidth: 250,
    maxWidth: 300,
    isResizable: false,
    data: 'string',
    isPadded: false
  },
  {
    key: 'itemDescription',
    name: 'Item Desc',
    fieldName: 'itemDescription',
    minWidth: 250,
    maxWidth: 300,
    isResizable: false,
    data: 'string',
    isPadded: false
  },
  {
    key: 'isProp65',
    name: 'Prop 65 ?',
    fieldName: 'isProp65',
    minWidth: 70,
    maxWidth: 70,
    isResizable: false,
    data: 'string',
    isPadded: false
  },
  {
    key: 'isOnLabel',
    name: 'On Label ?',
    fieldName: 'isOnLabel',
    minWidth: 78,
    maxWidth: 78,
    isResizable: false,
    data: 'string',
    isPadded: false
  },
  {
    key: 'foodInd',
    name: 'Food ?',
    fieldName: 'foodInd',
    minWidth: 65,
    maxWidth: 65,
    isResizable: false,
    data: 'string',
    isPadded: false
  },
  {
    key: 'effFromDate',
    name: 'Eff From Date',
    fieldName: 'effFromDate',
    minWidth: 100,
    maxWidth: 120,
    isResizable: false,
    data: 'string',
    isPadded: false
  }
];

export const _errColumns: IColumn[] = [
  {
    key: 'errorMessage',
    name: '',
    fieldName: 'errorMessage',
    minWidth: 150,
    maxWidth: 200,
    isResizable: true,
    data: 'string',
    isPadded: true
  }
];
export const DayPickerStrings: IDatePickerStrings = {
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year',
};