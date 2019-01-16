import * as React from 'react';
import { Fragment } from 'react';
import styles from './AlbertsonVendorWarning.module.scss';
import { IVendorComplain, IModalData, Step, IValidationError, IAttachment, IAttachmentModalData, INewItem } from '../interfaces/AlbertsonDomainInterfaces';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { debounce } from '@microsoft/sp-lodash-subset';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface IVendorComplainExampleState {
  columns: IColumn[];
  items: IVendorComplain[];
  isCompactMode: boolean;
  showModal: boolean;
  modalData: IModalData;
  showAttachmentModal: boolean;
  attachment: IAttachmentModalData;
  showNewItemModal: boolean;
  newItem: INewItem;
}

let _items: IVendorComplain[] = [];

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
  private _debounceModalChangeValue: any;
  private _debounceFilterChangeValue: any;
  constructor(props: any) {
    super(props);
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
        key: 'attachment',
        name: '',
        fieldName: '',
        minWidth: 10,
        maxWidth: 10,
        isResizable: true,
        data: 'any',
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
        minWidth: 10,
        maxWidth: 10,
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
        minWidth: 10,
        maxWidth: 10,
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
        minWidth: 50,
        maxWidth: 50,
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
        minWidth: 50,
        maxWidth: 50,
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
      showAttachmentModal: false,
      attachment: {},
      showNewItemModal: false,
      newItem: {}
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
      this.setState({ items: text ? _items.filter(i => `${i.upcpart1} ${i.upcpart2} ${i.upcpart3} ${i.upcpart4}`.toLowerCase().indexOf(text) > -1).slice() : _items.slice() });
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
      filter[0].isEditable = !filter[0].isEditable;
    }
    this.setState({
      items: items.slice()
    });
  }
  public componentDidMount() {
    const { items } = this.props;
    if (items && items.length > 0) {
      _items = items.slice();
      _items = this._sortItems(_items, 'key');
    } else {
      _items = [
        { key: 0, upcpart1: '0', upcpart2: '0', upcpart3: '44600', upcpart4: '32071', gtin: '12345678901234', corporateItemCode: '12345678', warningText: 'this product can get expired', itemDescription: 'demo desc', isProp65: 'Y', isOnLabel: 'Y', foodInd: 'N', effFromDate: new Date('12/20/2018').toLocaleDateString(), isEditable: false },
        { key: 1, upcpart1: '0', upcpart2: '0', upcpart3: '44600', upcpart4: '38025', gtin: '12345678901289', corporateItemCode: '25689543', warningText: '', itemDescription: 'demo desc', isProp65: 'Y', isOnLabel: 'Y', foodInd: 'N', effFromDate: new Date('12/31/2018').toLocaleDateString(), isEditable: false },
      ];
      _items = this._sortItems(_items, 'key');
    }
    this.setState({
      items: _items.slice()
    });
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
  private openAttachmentModal = (key: number) => (event: any) => {
    const { items } = this.state;
    let attachment: IAttachmentModalData = { key: key };
    const item = items[key];
    if (item && item.attachment) {
      attachment = {
        ...attachment,
        ...item.attachment
      };
    }
    this.setState({
      showAttachmentModal: true,
      attachment: attachment
    });
  }
  private closeAttachmentModal = (): void => {
    this.setState({
      showAttachmentModal: false
    });
  }
  private saveAttachmentModal = (): void => {
    const { attachment, items } = this.state;
    if (attachment && items) {
      const selected = items[attachment.key];
      if (selected) {
        selected.attachment = {
          name: attachment.name,
          data: attachment.data,
          typeOfDocument: attachment.typeOfDocument
        };
      }
    }
    this.setState({
      showAttachmentModal: false,
      items: items.slice()
    });
  }
  private changeTypeOfDocument = (value: any) => {
    const { attachment } = this.state;
    attachment.typeOfDocument = value.key;
    this.setState({
      attachment: {
        ...attachment
      }
    });
  }
  private getFileBuffer(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let reader: any = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.onerror = (e: any) => {
        reject(e.target.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }
  private _changeFileSelection = (e: any) => {
    if (e.currentTarget && e.currentTarget.files && e.currentTarget.files.length > 0) {
      const { attachment } = this.state;
      const file = e.currentTarget.files[0];
      if (file && file!.type == "application/pdf") {
        this.getFileBuffer(file).then((buffer: any) => {
          attachment.name = file.name;
          attachment.data = buffer;
          this.setState({
            attachment: {
              ...attachment
            }
          });
        });
      } else {
        alert('Invalid file');
      }
    }
  }
  private clearAttachment = () => {
    const { attachment } = this.state;
    this.setState({
      attachment: {
        ...attachment,
        name: '',
        data: null
      }
    });
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
      newItem: {}
    });
  }
  private closeNewItemModal = () => {
    this.setState({
      showNewItemModal: false
    });
  }
  private validateNewItem = (): IValidationError => {
    const result: IValidationError = { validationMessege: '', hasError: false };
    const { newItem } = this.state;
    if (!newItem.upcpart1 || !newItem.upcpart2 || !newItem.upcpart3 || !newItem.upcpart4 || !newItem.gtin || !newItem.corporateItemCode) {
      result.validationMessege = "Invalid item";
      result.hasError = true;
    }
    return result;
  }
  private changeNewItemValue = (fieldName: string) => (text: string) => {
    if (fieldName) {
      const { newItem } = this.state;
      this.setState({
        newItem: {
          ...newItem,
          [fieldName]: text
        }
      });
    }
  }
  private addItem = (): void => {
    const { items, newItem } = this.state;
    const result = this.validateNewItem();
    if (result.hasError) {
      alert(result.validationMessege);
    } else {
      let maxKey = 0;
      items.forEach((item) => {
        if (item!.key > maxKey) {
          maxKey = item.key;
        }
      });
      maxKey += 1;
      items.push({
        key: maxKey,
        upcpart1: newItem.upcpart1,
        upcpart2: newItem.upcpart2,
        upcpart3: newItem.upcpart3,
        upcpart4: newItem.upcpart4,
        gtin: newItem.gtin,
        corporateItemCode: newItem.corporateItemCode,
        warningText: '',
        itemDescription: '',
        isProp65: 'N',
        isOnLabel: 'N',
        foodInd: 'N',
        effFromDate: new Date().toLocaleDateString(),
        isEditable: false,
        attachment: null
      });
      this.setState({
        items: items.slice(),
        showNewItemModal: false
      });
    }

  }
  private previousClick = () => {
    const { items } = this.state;
    const vresult: IValidationError = this.validateOnNext();
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
    const vresult: IValidationError = this.validateOnNext();
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
  private validateOnNext(): IValidationError {
    const result = { validationMessege: null, hasError: false };
    const { items } = this.state;
    let filter = items.filter(x => x.isEditable);
    if (filter && filter.length > 0) {
      result.validationMessege = "Unsaved changes detected. Please save to proceed";
      result.hasError = true;
    } else {
      filter = items.filter(x => !x.upcpart1 || !x.upcpart2 || !x.upcpart3 || !x.upcpart4 || !x.gtin);
      if (filter && filter.length > 0) {
        result.validationMessege = "Contains invalid entries";
        result.hasError = true;
      }
    }
    return result;
  }
  public render() {
    const { columns, isCompactMode, items, modalData, showModal, showAttachmentModal, attachment, showNewItemModal, newItem } = this.state;
    let modalHeader = null;
    let label = null;
    let isEditable = false;
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
    }
    let icon = null;
    if (attachment!.name && attachment!.data) {
      icon = <Icon iconName="PDF" className="ms-IconExample" />;
    }
    let modalButtons = null;
    if (isEditable) {
      modalButtons = <Fragment>
        <DefaultButton onClick={this.saveModal} text="Ok" />
        <DefaultButton onClick={this.closeModal} text="Cancel" />
      </Fragment>;
    } else {
      modalButtons = <DefaultButton onClick={this.closeModal} text="Close" />;
    }
    return (
      <div className={styles.albertsonVendorWarning}>
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
              <TextField label="UPC Name" value={newItem.upcpart1} onChanged={this.changeNewItemValue('upcpart1')} />
              <TextField value={newItem.upcpart2} onChanged={this.changeNewItemValue('upcpart2')} />
              <TextField value={newItem.upcpart3} onChanged={this.changeNewItemValue('upcpart3')} />
              <TextField value={newItem.upcpart4} onChanged={this.changeNewItemValue('upcpart4')} />
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
            <TextField label={label} readOnly={!isEditable} value={modalData.value} multiline={true} onChanged={this.changeModalValue} />
            {modalButtons}
          </div>
        </Modal>

        <Modal
          titleAriaId="attachmentModal"
          subtitleAriaId="attachmentModalSub"
          isOpen={showAttachmentModal}
          onDismiss={this.closeAttachmentModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container"
        >
          <div className="ms-modalExample-header">
            <span id="attachmentModal">Attachment</span>
          </div>
          <div id="attachmentModalSub" className="ms-modalExample-body">
            <form>
              <Dropdown
                label="Type of Document"
                selectedKey={attachment ? attachment!.typeOfDocument : undefined}
                onChanged={this.changeTypeOfDocument}
                placeholder="Select a type of document..."
                options={[
                  { key: 'A', text: 'Option a' },
                  { key: 'B', text: 'Option b' },
                  { key: 'C', text: 'Option c' },
                  { key: 'D', text: 'Option d' },
                  { key: 'E', text: 'Option e' },
                  { key: 'F', text: 'Option f' },
                  { key: 'G', text: 'Option g' }
                ]}
              />
              <TextField label="Choose a file" readOnly placeholder="File name" value={attachment.name} />
              {icon}
              <input type="file" id={`addAttachment`}
                accept="application/pdf"
                onChange={this._changeFileSelection} />
            </form>
            <DefaultButton onClick={this.clearAttachment} text="Clear" />
            <DefaultButton onClick={this.saveAttachmentModal} text="Ok" />
            <DefaultButton onClick={this.closeAttachmentModal} text="Cancel" />
          </div>
        </Modal>
        <TextField placeholder="Filter by name" onChanged={this.onFilterChange}></TextField>
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionPreservedOnEmptyClick={false}
          selectionMode={SelectionMode.none}
          compact={isCompactMode}
          isHeaderVisible={true}
          onItemInvoked={this._onItemInvoked}
          onRenderItemColumn={this._onRenderColumn}
        />
        <DefaultButton onClick={this.openNewItemModal} text="Add Item" />
        <DefaultButton onClick={this.previousClick} text="previous" />
        <DefaultButton onClick={this.nextClick} text="next" />

      </div>
    );
  }
  private _onRenderColumn = (item: any, index: number, column: IColumn) => {
    const self = this;
    let value = null;
    if (item && column) {
      const { key, isEditable } = item;

      if (column.fieldName) {
        value = item[column.fieldName];
        switch (column.fieldName) {
          case 'isEditable':
            return <Checkbox label="" checked={value} disabled={false}
              onChange={self.toggleEditable(key)}></Checkbox>;
          case 'upcpart1':
          case 'upcpart2':
          case 'upcpart3':
          case 'upcpart4':
          case 'gtin':
          case 'corporateItemCode':
            return <span>{value}</span>;
          case 'warningText':
          case 'itemDescription':

            return <TextField readOnly={true} value={value} onClick={self.showModal(column.fieldName, key)}></TextField>;

          case 'isProp65':
          case 'isOnLabel':
          case 'foodInd':

            return <Dropdown
              label=""
              disabled={!isEditable}
              selectedKey={value}
              onChanged={this.onDropdownChange(column.fieldName, key)}
              placeholder=""
              options={[
                { key: 'Y', text: 'Yes' },
                { key: 'N', text: 'No' },
              ]}
            />;

          case 'effFromDate':
            const firstDayOfWeek = DayOfWeek.Sunday;
            return <DatePicker
              value={new Date(value)}
              disabled={!isEditable}
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
      } else if (column.key == 'attachment') {
        return <IconButton
          iconProps={{ iconName: 'Attach' }} title="Attachment" ariaLabel="Attachment" onClick={self.openAttachmentModal(key)}></IconButton>;
      }
    }
  }
  private _onItemInvoked = (item: any): void => {
    const { items } = this.state;
    const filter = items.filter(x => x.key == item.key);
    if (filter) {
      filter[0].isEditable = !filter[0].isEditable;
    }
    this.setState({
      items: items.slice()
    });
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


