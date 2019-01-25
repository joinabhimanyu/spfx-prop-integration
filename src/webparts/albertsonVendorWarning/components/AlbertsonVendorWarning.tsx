import * as React from 'react';
import styles from './AlbertsonVendorWarning.module.scss';
import { IVendorComplain, IModalData, Step, IValidationError, IValidationFields, INewItem } from '../interfaces/AlbertsonDomainInterfaces';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, IconButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { debounce } from '@microsoft/sp-lodash-subset';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IUPC } from '../../../../lib/webparts/albertsonVendorWarning/interfaces/AlbertsonDomainInterfaces';

export interface IVendorComplainExampleState {
  columns: IColumn[];
  items: IVendorComplain[];
  isCompactMode: boolean;
  showModal: boolean;
  modalData: IModalData;
  showNewItemModal: boolean;
  newItem: INewItem;
  selectedItem?: IVendorComplain;
}

// let _items: IVendorComplain[] = [];

const DayPickerStrings: IDatePickerStrings = {
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

export default class AlbertsonVendorWarning extends React.Component<any, IVendorComplainExampleState> {
  private _selection: Selection;
  private _debounceModalChangeValue: any;
  private _debounceFilterChangeValue: any;
  constructor(props: any) {
    super(props);
    this._selection = new Selection({
      onSelectionChanged: () => this.setState({ selectedItem: this._getSelectionDetails() })
    });
    const _columns: IColumn[] = [
      {
        key: 'isEditable',
        name: '',
        fieldName: 'isEditable',
        minWidth: 10,
        maxWidth: 10,
        isResizable: true,
        data: 'boolean',
        isPadded: true
      },
      {
        key: 'isDelete',
        name: '',
        fieldName: '',
        minWidth: 10,
        maxWidth: 10,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'upcpart1',
        name: '',
        fieldName: 'upcpart1',
        minWidth: 40,
        maxWidth: 50,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'upcpart2',
        name: '',
        fieldName: 'upcpart2',
        minWidth: 40,
        maxWidth: 50,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'upcpart3',
        name: 'UPC Name',
        fieldName: 'upcpart3',
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'upcpart4',
        name: '',
        fieldName: 'upcpart4',
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'gtin',
        name: 'GTIN/Item Id',
        fieldName: 'gtin',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,

        data: 'string',
        isPadded: true
      },
      {
        key: 'corporateItemCode',
        name: 'Corporate Item Code',
        fieldName: 'corporateItemCode',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true
      },
      {
        key: 'warningText',
        name: 'Warning Text/Removal Reason',
        fieldName: 'warningText',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'itemDescription',
        name: 'Item Desc',
        fieldName: 'itemDescription',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'isProp65',
        name: 'Prop 65 ?',
        fieldName: 'isProp65',
        minWidth: 90,
        maxWidth: 100,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'isOnLabel',
        name: 'On Label ?',
        fieldName: 'isOnLabel',
        minWidth: 90,
        maxWidth: 100,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'foodInd',
        name: 'Food ?',
        fieldName: 'foodInd',
        minWidth: 90,
        maxWidth: 100,
        isResizable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'effFromDate',
        name: 'Eff From Date',
        fieldName: 'effFromDate',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
        data: 'string',
        isPadded: true
      }
    ];
    this.state = {
      columns: _columns,
      items: [],
      modalData: {},
      isCompactMode: false,
      showModal: false,
      showNewItemModal: false,
      newItem: { upc: {} },
      selectedItem: this._getSelectionDetails()
    };
    this._debounceModalChangeValue = (text: string) => {
      const { modalData } = this.state;
      this.setState({
        modalData: {
          ...modalData,
          value: text,
        }
      });
    };
    this._debounceFilterChangeValue = (text: string) => {
      const { items } = this.state;
      this.setState({ items: text ? items.filter(i => `${i!.upc!.upcpart1} ${i!.upc!.upcpart2} ${i!.upc!.upcpart3} ${i!.upc!.upcpart4}`.toLowerCase().indexOf(text) > -1).slice() : items.slice() });
    };
    this._debounceModalChangeValue = debounce(this._debounceModalChangeValue, 500);
    this._debounceFilterChangeValue = debounce(this._debounceFilterChangeValue, 500);
  }
  private deleteItem = (key: number) => () => {
    const result = confirm('You sure you want to delete this?');
    if (result) {
      let { items } = this.state;
      items = items.filter((item, index) => index != key);
      items = items.map((item, index) => {
        return {
          ...item,
          key: index
        };
      });
      this.setState({
        items: items.slice()
      });
    }
  }
  private toggleEditable = (key: number) => (ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
    const { items } = this.state;
    const filter = items.filter(x => x.key == key);
    if (filter && filter.length > 0) {
      const { canBeEditable } = filter[0];
      if (canBeEditable) {
        filter[0].isEditable = !filter[0].isEditable;
        this.setState({
          items: items.slice()
        });
      }
    }
  }
  public async componentDidMount() {
    let { items } = this.props;
    if (items && items.length > 0) {
      items = items.slice();
      items = this._sortItems(items, 'key');
    } else {
      items = await this.testSeedItems();
      items = this._sortItems(items, 'key');
    }
    this.setState({
      items: items.slice()
    });
  }
  private async testSeedItems(): Promise<IVendorComplain[]> {

    return new Promise<IVendorComplain[]>((resolve, reject) => {
      const items: IVendorComplain[] = [
        {
          key: 0, upc: { upcpart1: '0', upcpart2: '0', upcpart3: '44600', upcpart4: '32071' } as IUPC,
          gtin: '12345678901234', corporateItemCode: '12345678', warningText: 'this product can get expired', itemDescription: 'demo desc', isProp65: 'Y', isOnLabel: 'Y', foodInd: 'N', effFromDate: new Date('12/20/2018').toLocaleDateString(), isEditable: false, canBeEditable: true, isCloned: false
        },
        {
          key: 1, upc: { upcpart1: '0', upcpart2: '0', upcpart3: '44600', upcpart4: '38025' } as IUPC,
          gtin: '12345678901289', corporateItemCode: '25689543', warningText: '', itemDescription: 'demo desc', isProp65: 'Y', isOnLabel: 'Y', foodInd: 'N', effFromDate: new Date('12/31/2018').toLocaleDateString(), isEditable: false, canBeEditable: true, isCloned: false
        },
      ];
      setTimeout(() => {
        resolve(items as IVendorComplain[]);
      }, 10);
    });
  }
  private async seedItems(): Promise<IVendorComplain[]> {
    const items: IVendorComplain[] = [];
    // get previous entered items from sharepoint
    return Promise.resolve(items);
  }
  private showModal = (fieldName: string, index: number) => (event: any) => {
    const data = this.state.items[index];
    if (data) {
      this.setState({
        showModal: true,
        modalData: {
          key: fieldName,
          value: data[fieldName],
          index: index
        }
      });
    }
  }
  private onDropdownChange = (fieldName: string, key: number) => (value: any) => {
    const { items } = this.state;
    if (fieldName) {
      if (items[key]) {
        items[key]![fieldName] = value.key || 'N';
        this.setState({
          items: items.slice()
        });
      }
    } else {
      alert('no item selected');
    }
  }
  private upcChange = (fieldName: string, key: number) => (text: string) => {
    if (fieldName) {
      const { items } = this.state;
      if (items[key]) {
        items[key]!['upc']![fieldName] = text || '';
        this.setState({
          items: items.slice()
        });
      }
    }
  }
  private valuesChanged = (fieldName: string, key: number) => (text: string) => {
    if (fieldName) {
      const { items } = this.state;
      if (items[key]) {
        items[key]![fieldName] = text || '';
        this.setState({
          items: items.slice()
        });
      }
    }
  }
  private onSelectDate = (index: number) => (date: Date | null | undefined) => {
    const { items } = this.state;
    if (items[index]) {
      items[index].effFromDate = date.toLocaleDateString();
      this.setState({
        items: items.slice()
      });
    }
  }
  private closeModal = (): void => {
    this.setState({
      showModal: false,
      modalData: {},
    });
  }
  private saveModal = (): void => {
    const { modalData, items } = this.state;
    if (modalData && items) {
      const selected = items[modalData.index];
      if (selected) {
        selected[modalData.key] = modalData.value;
      }
    }
    this.setState({
      showModal: false,
      items: items.slice(),
      modalData: {},
    });
  }
  private changeModalValue = (text: string): void => {
    this._debounceModalChangeValue(text);
  }
  private onFilterChange = (text: string): void => {
    this._debounceFilterChangeValue(text);
  }
  private openNewItemModal = () => {
    this.setState({
      showNewItemModal: true,
      newItem: { upc: {} }
    });
  }
  private closeNewItemModal = () => {
    this.setState({
      showNewItemModal: false
    });
  }
  private validateUPC = (item: INewItem): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    !item!.upc!.upcpart1 || !item!.upc!.upcpart2 || !item!.upc!.upcpart3 || !item!.upc!.upcpart4 ? (function () {
      result.fields.push({
        field: 'UPC',
        errorMessage: 'Invalid UPC'
      });
      result.valid = false;
    }()) : (function () {
    }());
    return result;
  }
  private validateGTIN = (item: INewItem): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    !item.gtin ? (function () {
      result.fields.push({
        field: 'gtin',
        errorMessage: 'GTIN cannot be blank'
      }); result.valid = false;

    }()) : (function () {
    }());
    return result;
  }
  private validateCorporateItemCode = (item: INewItem): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    !item.corporateItemCode ? (function () {
      result.fields.push({
        field: 'corporateItemCode',
        errorMessage: 'Corporate Item Code cannot be blank'
      }); result.valid = false;

    }()) : (function () {
    }());
    return result;
  }
  private validateNewItem = (): IValidationError => {
    const result: IValidationError = { errors: [], hasError: false };
    const { newItem } = this.state;
    const vUPC = this.validateUPC({ ...newItem });
    const vGTIN = this.validateGTIN({ ...newItem });
    const vCIC = this.validateCorporateItemCode({ ...newItem });
    if (vUPC.valid || vGTIN.valid || vCIC.valid) {
      return result;
    } else {
      result.errors = [...vUPC.fields, ...vGTIN.fields, ...vCIC.fields];
      result.hasError = true;
    }
    return result;
  }
  private changeNewItemValue = (fieldName: string) => (text: string) => {
    if (fieldName) {
      const { newItem } = this.state;
      if (fieldName.indexOf(".") == -1) {
        this.setState({
          newItem: {
            ...newItem,
            [fieldName]: text
          }
        });
      } else {
        const parts = fieldName.split(".");
        this.setState({
          newItem: {
            ...newItem,
            [parts[0] || '']: {
              ...newItem[parts[0] || ''],
              [parts[1] || '']: text
            }
          }
        });
      }

    }
  }
  private addItem = (): void => {
    const { items, newItem } = this.state;
    const result = this.validateNewItem();
    if (result.hasError) {
      console.log(JSON.stringify(result.errors));
    } else {
      let maxKey = 0;
      if (items.length > 0) {
        items.forEach((item) => {
          if (item!.key > maxKey) {
            maxKey = item.key;
          }
        });
        maxKey += 1;
      }
      items.push({
        key: maxKey,
        upc: {
          ...newItem!.upc
        },
        gtin: newItem.gtin,
        corporateItemCode: newItem.corporateItemCode,
        warningText: '',
        itemDescription: '',
        isProp65: 'N',
        isOnLabel: 'N',
        foodInd: 'N',
        effFromDate: new Date().toLocaleDateString(),
        isEditable: false,
        canBeEditable: true,
        isCloned: false
      });
      this.setState({
        items: items.slice(),
        showNewItemModal: false
      });
    }

  }
  private previousClick = () => {
    const { items } = this.state;
    const vresult = this.validateOnNext();
    if (vresult.hasError) {
      alert(vresult.validationMessege);
    } else {
      if (this.props.setItems && typeof this.props.setItems == 'function') {
        this.props.setItems(items);
      }
      if (this.props.changeStep) {
        this.props.changeStep(Step.step1);
      }
    }
  }
  private nextClick = () => {
    const { items } = this.state;
    const vresult = this.validateOnNext();
    if (vresult.hasError) {
      alert(vresult.validationMessege);
    } else {
      if (this.props.setItems && typeof this.props.setItems == 'function') {
        this.props.setItems(items);
      }
      if (this.props.changeStep) {
        this.props.changeStep(Step.step3);
      }
    }
  }
  private validateOnNext() {
    const result = { validationMessege: null, hasError: false };
    let { items } = this.state;
    items = items as IVendorComplain[];
    let filter = items.filter(x => x.isEditable);
    if (filter && filter.length > 0) {
      result.validationMessege = "Unsaved changes detected. Please save to proceed";
      result.hasError = true;
    } else {
      const invalidEntries = [];
      for (let item of items) {
        const arg: INewItem = {
          upc: {
            ...item.upc
          },
          gtin: item.gtin,
          corporateItemCode: item.corporateItemCode
        };
        if (this.validateUPC({ ...arg }) || this.validateGTIN({ ...arg }) || this.validateCorporateItemCode({ ...arg })) {
          continue;
        } else {
          invalidEntries.push(item);
        }
      }
      if (invalidEntries.length > 0) {
        result.validationMessege = "Contains invalid entries";
        result.hasError = true;
      }
    }
    return result;
  }
  private addUPCByCloningItem = (): void => {
    let { items, selectedItem } = this.state;
    items = items as IVendorComplain[];
    selectedItem = selectedItem as IVendorComplain;
    if (selectedItem) {
      const arg: INewItem = {
        upc: {
          ...selectedItem.upc
        },
        gtin: selectedItem.gtin,
        corporateItemCode: selectedItem.corporateItemCode
      };
      if (this.validateGTIN({ ...arg }) || this.validateCorporateItemCode({ ...arg })) {
        let maxKey = 0;
        if (items.length > 0) {
          items.forEach((item) => {
            if (item!.key > maxKey) {
              maxKey = item.key;
            }
          });
          maxKey += 1;
        }
        items.push({
          ...selectedItem,
          key: maxKey,
          upc: {},
          isEditable: false,
          canBeEditable: true,
          isCloned: true
        });
        this.setState({
          items: items.slice()
        });
      } else {
        alert('Invalid row to cloan. Please add either GTIN or Corporate Item Code');
      }
    }
  }
  public render() {
    const { columns, isCompactMode, items, modalData, showModal, showNewItemModal, newItem, selectedItem } = this.state;
    let modalHeader = null;
    let label = null;
    let isEditable = false;
    let isCloned = false;
    if (modalData && modalData.key) {
      switch (modalData.key) {
        case 'warningText':
          modalHeader = "Enter Warning Text";
          label = "Warning Text *";
          break;
        case 'itemDescription':
          modalHeader = "Enter Item Description";
          label = "Item Description *";
          break;
      }
      const item = items[modalData.index];
      isEditable = item!.isEditable;
      isCloned = item!.isCloned;
    }
    let modalButtons = null;
    if (isCloned) {
      modalButtons = <DefaultButton onClick={this.closeModal} text="Close" />;
    } else {
      if (isEditable) {
        modalButtons = <div>
          <DefaultButton onClick={this.saveModal} text="Ok" />
          <DefaultButton onClick={this.closeModal} text="Cancel" />
        </div>;
      } else {
        modalButtons = <DefaultButton onClick={this.closeModal} text="Close" />;
      }
    }
    let addUpcDisabled: boolean = false;
    if (!selectedItem) {
      addUpcDisabled = true;
    } else {
      const { gtin, corporateItemCode } = selectedItem as IVendorComplain;
      if (!gtin && !corporateItemCode) {
        addUpcDisabled = true;
      }
    }
    return (
      <div>
        <div className={styles.flexGrowOne}>
          <Modal
            titleAriaId="newItemModal"
            subtitleAriaId="newItemModalSub"
            isOpen={showNewItemModal}
            onDismiss={this.closeNewItemModal}
            isBlocking={false}
            containerClassName="ms-modalExample-container"
          >
            <div className="ms-modalExample-header">
              <span id="newItemModal">New Item</span>
            </div>
            <div id="newItemModalSub" className="ms-modalExample-body">
              <form>
                <TextField label="UPC Name" value={newItem!.upc!.upcpart1} onChanged={this.changeNewItemValue('upc.upcpart1')} />
                <TextField value={newItem!.upc!.upcpart2} onChanged={this.changeNewItemValue('upc.upcpart2')} />
                <TextField value={newItem!.upc!.upcpart3} onChanged={this.changeNewItemValue('upc.upcpart3')} />
                <TextField value={newItem!.upc!.upcpart4} onChanged={this.changeNewItemValue('upc.upcpart4')} />
                <TextField label="GTIN/Item Code" value={newItem.gtin} onChanged={this.changeNewItemValue('gtin')} />
                <TextField label="Corporate Item Code" value={newItem.corporateItemCode} onChanged={this.changeNewItemValue('corporateItemCode')} />

                <DefaultButton onClick={this.addItem} text="Ok" />
                <DefaultButton onClick={this.closeNewItemModal} text="Cancel" />

              </form>
            </div>
          </Modal>
          <Modal
            titleAriaId="itemModal"
            subtitleAriaId="itemModalSub"
            isOpen={showModal}
            onDismiss={this.closeModal}
            isBlocking={false}
            containerClassName="ms-modalExample-container"
          >
            <div className="ms-modalExample-header">
              <span id="itemModal">{modalHeader}</span>
            </div>
            <div id="itemModalSub" className="ms-modalExample-body">
              <TextField label={label} disabled={isCloned ? true : (!isEditable)} value={modalData.value} multiline={true} onChanged={this.changeModalValue} />
              {modalButtons}
            </div>
          </Modal>
          <TextField placeholder="Filter by name" onChanged={this.onFilterChange}></TextField>
          <DetailsList
            items={items}
            columns={columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selection={this._selection}
            selectionPreservedOnEmptyClick={true}
            selectionMode={SelectionMode.single}
            compact={isCompactMode}
            isHeaderVisible={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            onItemInvoked={this._onItemInvoked}
            onRenderItemColumn={this._onRenderColumn}
          />
        </div>
        <div className={[styles.vendorWarningFooter, styles.minusMarginForFooterReset].join(' ')}>

          <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
            <div>
              <DefaultButton onClick={this.openNewItemModal} primary={true} text="Add Another Item" />
              <DefaultButton disabled={addUpcDisabled} onClick={this.addUPCByCloningItem} primary={true} text="Add UPC" />
            </div>
            <div>
              <ActionButton
                data-automation-id="back"
                iconProps={{ iconName: 'ChromeBack' }}
                onClick={this.previousClick}
                className={styles.spaceRight}
              >
                Previous
              </ActionButton>
              <ActionButton
                data-automation-id="Finish"
                iconProps={{ iconName: 'ChromeBackMirrored' }}
                onClick={this.nextClick}
                className={styles.reverseDirection}
              >
                Next
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
  private _getSelectionDetails(): IVendorComplain {
    const selectionCount = this._selection.getSelectedCount();
    switch (selectionCount) {
      case 0:
        return null;
      case 1:
        return this._selection.getSelection()[0] as IVendorComplain;
      default:
        return null;
    }
  }
  private _onRenderColumn = (item: IVendorComplain, index: number, column: IColumn) => {
    const self = this;
    let value = null;
    if (item && column) {
      const { key, isEditable, isCloned, canBeEditable } = item;

      if (column.fieldName) {
        value = item[column.fieldName];
        switch (column.fieldName) {
          case 'isEditable':
            return <Checkbox label="" checked={value} disabled={!canBeEditable}
              onChange={self.toggleEditable(key)}></Checkbox>;
          case 'upcpart1':
          case 'upcpart2':
          case 'upcpart3':
          case 'upcpart4':
            // return <span>{item!['upc']![column.fieldName]}</span>;
            return <TextField disabled={!isEditable} value={item!['upc']![column.fieldName]}
              onChanged={this.upcChange(column.fieldName, key)}></TextField>;
          case 'gtin':
          case 'corporateItemCode':
            return <TextField disabled={isCloned ? true : (!isEditable)} value={value}
              onChanged={this.valuesChanged(column.fieldName, key)}></TextField>;
          case 'warningText':
          case 'itemDescription':
            return <TextField readOnly={true} value={value} onClick={self.showModal(column.fieldName, key)}></TextField>;
          case 'isProp65':
          case 'isOnLabel':
          case 'foodInd':
            return <Dropdown
              label=""
              disabled={isCloned ? true : (!isEditable)}
              selectedKey={value}
              onChanged={this.onDropdownChange(column.fieldName, key)}
              placeHolder=""
              options={[
                { key: 'Y', text: 'Yes' },
                { key: 'N', text: 'No' },
              ]}
            />;
          case 'effFromDate':
            const firstDayOfWeek = DayOfWeek.Sunday;
            return <DatePicker
              value={new Date(value)}
              disabled={isCloned ? true : (!isEditable)}
              firstDayOfWeek={firstDayOfWeek}
              strings={DayPickerStrings}
              placeholder="Select a date"
              ariaLabel="Select a date"
              onAfterMenuDismiss={() => console.log('onAfterMenuDismiss called')}
              onSelectDate={self.onSelectDate(key)}
            ></DatePicker>;
          default:
            return <span>{value}</span>;
        }
      } else if (column.key == 'isDelete') {
        return <IconButton
          iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={self.deleteItem(key)}></IconButton>;
      }
      // else if (column.key == 'attachment') {
      //   return <IconButton
      //     iconProps={{ iconName: 'Attach' }} title="Attachment" ariaLabel="Attachment" onClick={self.openAttachmentModal(key)}></IconButton>;
      // }
    }
  }
  private _onItemInvoked = (item: any): void => {
    const { items } = this.state;
    const filter = items.filter(x => x.key == item.key);
    if (filter && filter.length > 0) {
      const { canBeEditable } = filter[0];
      if (canBeEditable) {
        filter[0].isEditable = !filter[0].isEditable;
        this.setState({
          items: items.slice()
        });
      }
    }
  }
  private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, items } = this.state;
    let newItems: IVendorComplain[] = items.slice();
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter((currCol: IColumn, idx: number) => {
      return column.key === currCol.key;
    })[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        // currColumn.isSorted = true;
      } else {
        // newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    newItems = this._sortItems(newItems, currColumn.fieldName || '', currColumn.isSortedDescending);
    this.setState({
      columns: newColumns.slice(),
      items: newItems.slice()
    });
  }

  private _sortItems = (items: IVendorComplain[], sortBy: string, descending = false): IVendorComplain[] => {
    if (descending) {
      return items.sort((a: IVendorComplain, b: IVendorComplain) => {
        if (a[sortBy] < b[sortBy]) {
          return 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return -1;
        }
        return 0;
      });
    } else {
      return items.sort((a: IVendorComplain, b: IVendorComplain) => {
        if (a[sortBy] < b[sortBy]) {
          return -1;
        }
        if (a[sortBy] > b[sortBy]) {
          return 1;
        }
        return 0;
      });
    }
  }

}


