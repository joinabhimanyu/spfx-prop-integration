import * as React from 'react';
import styles from './AlbertsonVendorWarning.module.scss';
import { IVendorComplain, IModalData, Step, IValidationError, IValidationFields } from '../interfaces/AlbertsonDomainInterfaces';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, IDetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn, IDetailsRowProps, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { DefaultButton, IconButton, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { debounce } from '@microsoft/sp-lodash-subset';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { IUPC } from '../interfaces/AlbertsonDomainInterfaces';
import { _columns, DayPickerStrings, _errColumns, IValidationBlob, _itemsValidationBlob } from './AlbertsonConstants';
import { getTheme, mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import Dialog, { DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { _onFormatDate } from '../utils/commonUtility';

const InfoSolid = () => (
  <Icon iconName="InfoSolid" className="ms-IconExample" />
);
const theme = getTheme();
export interface IVendorComplainExampleState {
  columns: IColumn[];
  items: IVendorComplain[];
  isCompactMode: boolean;
  showModal: boolean;
  modalData: IModalData;
  selectedItem?: IVendorComplain;
  validationError?: IValidationError;
  deleteKey?: number;
}
export interface ISelectRowArgs {
  index?: number;
}

export default class AlbertsonVendorWarning extends React.Component<any, IVendorComplainExampleState> {
  private _selection: Selection;
  private _debounceModalChangeValue: any;
  // private _debounceFilterChangeValue: any;
  private _root = null;
  private _suppressEvent: boolean = false;

  //#region Generic events
  private setSelectedRow = (arg: ISelectRowArgs) => {
    // this._selection.setChangeEvents(false, true);
    this._suppressEvent = true;
    const self = this;
    setTimeout(() => {
      self._selection.setAllSelected(false);
      if (arg.index != null) {
        setTimeout(() => {
          self._selection.setIndexSelected(arg.index, true, false);
          self.validateSelectedItem();
          self._suppressEvent = false;
          setTimeout(() => {
            self.setState({ items: self.state.items.slice() });
          });
        });
      } else {
        self._suppressEvent = false;
      }
    });
  }
  private _resetSelectedItem = (): void => {
    let { items } = this.state;
    items = items.map((item) => ({
      ...item,
      isEditable: false
    }));
    this.setState({
      items: items.slice(),
      selectedItem: null
    });
  }
  private _setSelectedItem = (_item: IVendorComplain): void => {
    const { items } = this.state;
    const filter = items.filter(x => x.key == _item.key);
    filter[0].isEditable = true;
    this.setState({
      items: items.slice(),
      selectedItem: {
        ..._item,
        isEditable: true
      }
    });
  }
  constructor(props: any) {
    super(props);
    this._selection = new Selection({
      onSelectionChanged: () => {
        const self = this;
        const _item = this._getSelectionDetails() as IVendorComplain;
        const { selectedItem } = this.state;
        let { items } = this.state;
        if (!this._suppressEvent) {
          if (JSON.stringify(_item) != JSON.stringify(selectedItem)) {
            this.validateSelectedItem();
            setTimeout(() => {
              const { validationError } = self.state;
              if (validationError!.hasError) {
                self.setSelectedRow({ index: selectedItem.key });
              } else {
                if (!_item) {
                  self._resetSelectedItem();
                } else {
                  self._resetSelectedItem();
                  setTimeout(() => {
                    self._setSelectedItem(_item);
                  });
                }
              }
            });
          }
        }
      }
    });
    this.state = {
      columns: _columns,
      items: [],
      modalData: {},
      isCompactMode: false,
      showModal: false,
      selectedItem: this._getSelectionDetails(),
      validationError: {
        errors: []
      }
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
    // this._debounceFilterChangeValue = (text: string) => {
    //   const { items } = this.state;
    //   this.setState({ items: text ? items.filter(i => `${i!.upc!.upcpart1} ${i!.upc!.upcpart2} ${i!.upc!.upcpart3} ${i!.upc!.upcpart4}`.toLowerCase().indexOf(text) > -1).slice() : items.slice() });
    // };
    this._debounceModalChangeValue = debounce(this._debounceModalChangeValue, 500);
    // this._debounceFilterChangeValue = debounce(this._debounceFilterChangeValue, 500);
  }
  public async componentDidMount() {
    let { items } = this.props;
    if (items && items.length > 0) {
      items = items.slice();
      items = this._sortItems(items, 'key');
    }
    this.setState({
      items: items.slice()
    });
  }

  private async seedItems(): Promise<IVendorComplain[]> {
    const items: IVendorComplain[] = [];
    return Promise.resolve(items);
  }
  // private onFilterChange = (text: string): void => {
  //   this._debounceFilterChangeValue(text);
  // }
  //#endregion

  //#region Grid change events
  private propagateChangeToClonedRow = (key: number, value: any, fieldName: string, items: IVendorComplain[]): IVendorComplain[] => {
    const filter = items.filter(x => x.clonedFrom == key);
    if (filter && filter.length > 0) {
      filter.forEach((item) => {
        item[fieldName] = value;
      });
    }
    return (items as IVendorComplain[]).slice();
  }
  private upcChange = (fieldName: string, key: number) => (text: string) => {
    if (fieldName) {
      const { items, selectedItem } = this.state;
      let selected: any = items.filter(x => x.key == key);
      if (selected && selected.length > 0) {
        selected = selected[0] as IVendorComplain;
        selected!['upc']![fieldName] = text || '';
        if (selectedItem) {
          selectedItem!['upc']![fieldName] = text || '';
        }
        this.setState({
          items: items.slice(),
          selectedItem
        });
        const self = this;
        setTimeout(() => {
          self.validateSelectedItem();
          setTimeout(() => {
            self.setState({ items: self.state.items.slice() });
          });
        });
      }
    }
  }
  private valuesChanged = (fieldName: string, key: number) => (text: string) => {
    if (fieldName) {
      let { items, selectedItem } = this.state;
      let selected: any = items.filter(x => x.key == key);
      if (selected && selected.length > 0) {
        selected = selected[0] as IVendorComplain;
        selected![fieldName] = text || '';
        if (selectedItem) {
          selectedItem![fieldName] = text || '';
        }
        items = this.propagateChangeToClonedRow(key, text || '', fieldName, items);
        this.setState({
          items: items.slice(),
          selectedItem
        });
        const self = this;
        setTimeout(() => {
          self.validateSelectedItem();
          setTimeout(() => {
            self.setState({ items: self.state.items.slice() });
          });
        });
      }
    }
  }
  private onDropdownChange = (fieldName: string, key: number) => (value: any) => {
    let { items, selectedItem } = this.state;
    if (fieldName) {
      let selected: any = items.filter(x => x.key == key);
      if (selected && selected.length > 0) {
        selected = selected[0] as IVendorComplain;
        selected![fieldName] = value.key || 'N';
        selectedItem![fieldName] = value.key || 'N';
        items = this.propagateChangeToClonedRow(key, value.key || 'N', fieldName, items);
        this.setState({
          items: items.slice(),
          selectedItem
        });
        const self = this;
        setTimeout(() => {
          self.validateSelectedItem();
          setTimeout(() => {
            self.setState({ items: self.state.items.slice() });
          });
        });
      }
    }
  }
  //#endregion

  //#region Validation
  private validateUPC = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _upcBlob = _itemsValidationBlob.filter(x => x.field == 'upcpart1' || x.field == 'upcpart2' || x.field == 'upcpart3' || x.field == 'upcpart4');
    const [part1, part2, part3, part4] = _upcBlob;
    (part1.required && !item!.upc!.upcpart1) || (
      part2.required &&
      !item!.upc!.upcpart2
    ) || (part3.required && !item!.upc!.upcpart3) || (
        part4.required && !item!.upc!.upcpart4
      ) ? (function () {
        result.fields.push({
          field: 'UPC',
          errorMessage: 'Required'
        });
        result.valid = false;
      }()) : (function () {
        const [pat1, pat2, pat3, pat4] = [part1.pattern, part2.pattern, part3.pattern, part4.pattern];
        if (!pat1.test(item!.upc!.upcpart1) || !pat2.test(item!.upc!.upcpart2) || !pat3.test(item!.upc!.upcpart3) || !pat4.test(item!.upc!.upcpart4)) {
          result.fields.push({
            field: 'UPC',
            errorMessage: 'Invalid'
          });
          result.valid = false;
        }
      }());
    return result;
  }
  private validateGTIN = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _gtinBlob = _itemsValidationBlob.filter(x => x.field == 'gtin')[0];
    (_gtinBlob.required && !item.gtin) ? (function () {
      result.fields.push({
        field: 'gtin',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
      if (!_gtinBlob.pattern.test(item!.gtin)) {
        result.fields.push({
          field: 'gtin',
          errorMessage: 'Invalid'
        }); result.valid = false;
      }
    }());
    return result;
  }
  private validateCorporateItemCode = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _itemCodeBlob = _itemsValidationBlob.filter(x => x.field == 'corporateItemCode')[0];
    (_itemCodeBlob.required && !item.corporateItemCode) ? (function () {
      result.fields.push({
        field: 'corporateItemCode',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
      if (!_itemCodeBlob.pattern.test(item.corporateItemCode)) {
        result.fields.push({
          field: 'corporateItemCode',
          errorMessage: 'Invalid'
        }); result.valid = false;
      }
    }());
    return result;
  }
  private validateWarningText = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _warningTextBlob = _itemsValidationBlob.filter(x => x.field == 'warningText')[0];
    (_warningTextBlob.required && !item.warningText) ? (function () {
      result.fields.push({
        field: 'warningText',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
      if (!_warningTextBlob.pattern.test(item.warningText)) {
        result.fields.push({
          field: 'warningText',
          errorMessage: 'Invalid'
        }); result.valid = false;

      }
    }());
    return result;
  }
  private validateItemDescription = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _itemDescriptionBlob = _itemsValidationBlob.filter(x => x.field == 'itemDescription')[0];
    (_itemDescriptionBlob.required && !item.itemDescription) ? (function () {
      result.fields.push({
        field: 'itemDescription',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
      if (!_itemDescriptionBlob.pattern.test(item.itemDescription)) {
        result.fields.push({
          field: 'itemDescription',
          errorMessage: 'Invalid'
        }); result.valid = false;
      }
    }());
    return result;
  }
  private validateProp65 = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _isProp65Blob = _itemsValidationBlob.filter(x => x.field == 'isProp65')[0];
    (_isProp65Blob.required && item.isProp65 == null) ? (function () {
      result.fields.push({
        field: 'isProp65',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
    }());
    return result;
  }
  private validateOnLabel = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _isOnLabelBlob = _itemsValidationBlob.filter(x => x.field == 'isOnLabel')[0];
    (_isOnLabelBlob.required && item.isOnLabel == null) ? (function () {
      result.fields.push({
        field: 'isOnLabel',
        errorMessage: 'Required'
      }); result.valid = false;

    }()) : (function () {
    }());
    return result;
  }
  private validateFoodInd = (item: IVendorComplain): { fields: IValidationFields[], valid: boolean } => {
    const result = { fields: [], valid: true };
    const _foodIndBlob = _itemsValidationBlob.filter(x => x.field == 'foodInd')[0];
    (_foodIndBlob.required && item.foodInd == null) ? (function () {
      result.fields.push({
        field: 'foodInd',
        errorMessage: 'Required'
      }); result.valid = false;
    }()) : (function () {
    }());
    return result;
  }
  private validateSelectedItem = (): void => {
    const { selectedItem } = this.state;
    const result = this.validateItem(selectedItem as IVendorComplain);
    this.setState({
      validationError: result
    });
    return;
  }
  private validateItem = (_item: IVendorComplain): IValidationError => {
    const result: IValidationError = { errors: [], hasError: false };
    let errors = [];
    if (_item) {
      const { vUPC, vGTIN, vCIC, vWarningText, vItemDescription, vProp65, vOnLabel, vFoodInd } =
        ({
          vUPC: this.validateUPC({ ..._item }), vGTIN: this.validateGTIN({ ..._item }), vCIC: this.validateCorporateItemCode({ ..._item }),
          vWarningText: this.validateWarningText({ ..._item }), vItemDescription: this.validateItemDescription({ ..._item }),
          vProp65: this.validateProp65({ ..._item }), vOnLabel: this.validateOnLabel({ ..._item }), vFoodInd: this.validateFoodInd({ ..._item })
        });
      if (_item.isCloned) {
        if (!vUPC.valid) {
          errors = errors.concat([...vUPC.fields]);
        }
      } else {
        if (!vUPC.valid && !vGTIN.valid && !vCIC.valid) {
          errors = errors.concat([...vUPC.fields, ...vGTIN.fields, ...vCIC.fields]);
        } else {
          const upcFields = vUPC.fields.filter(x => x.errorMessage == 'Invalid');
          const gtinFields = vGTIN.fields.filter(x => x.errorMessage == 'Invalid');
          const cicFields = vCIC.fields.filter(x => x.errorMessage == 'Invalid');
          errors = errors.concat([...upcFields, ...gtinFields, ...cicFields]);
        }
        if (!vWarningText.valid || !vItemDescription.valid || !vProp65.valid || vOnLabel.valid || !vFoodInd.valid) {
          errors = errors.concat([...vWarningText.fields, ...vItemDescription.fields, ...vProp65.fields, ...vOnLabel.fields, ...vFoodInd.fields]);
        }
      }
      if (errors.length > 0) {
        result.errors = errors.slice();
        result.hasError = true;
      }
    }
    return result;
  }
  //#endregion

  //#region Edit Modal
  private showModal = (fieldName: string, key: number) => (event: any) => {
    const { items } = this.state;
    let selected: any = items.filter(x => x.key == key);
    if (selected && selected.length > 0) {
      selected = selected[0] as IVendorComplain;
      this.setState({
        showModal: true,
        modalData: {
          key: fieldName,
          value: selected[fieldName],
          index: key
        }
      });
    }
  }
  private saveModal = (): void => {
    let { modalData, items, selectedItem } = this.state;
    if (modalData && items) {
      let selected: any = items.filter(x => x.key == modalData.index);
      if (selected && selected.length > 0) {
        selected = selected[0] as IVendorComplain;
        selected[modalData.key] = modalData.value;
      }
      if (selectedItem) {
        selectedItem![modalData.key] = modalData.value;
      }
    }
    items = this.propagateChangeToClonedRow(modalData.index, modalData.value, modalData.key, items);
    this.setState({
      showModal: false,
      items: items.slice(),
      modalData: {},
      selectedItem
    });
    const self = this;
    setTimeout(() => {
      self.validateSelectedItem();
      setTimeout(() => {
        self.setState({ items: self.state.items.slice() });
      });
    });
  }
  private closeModal = (): void => {
    this.setState({
      showModal: false,
      modalData: {},
    });
  }
  private changeModalValue = (text: string): void => {
    this._debounceModalChangeValue(text);
  }
  //#endregion

  //#region Navigation
  private executeNavigation = (step: Step = null, target: string = null) => {
    if (target == 'reset') {
      if (this.props.resetDetails) {
        this.props.resetDetails();
      }
    } else {
      const { items } = this.state;
      const results: IValidationError[] = items.map(item => this.validateItem(item as IVendorComplain));
      if (results.filter(x => x.hasError).length > 0) {
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Invalid', subText: 'Please correct the data before proceeding' });
        return;
      }
      if (this.props.setItems && typeof this.props.setItems == 'function') {
        this.setState({
          selectedItem: null
        });
        const self = this;
        setTimeout(() => {
          self.props.setItems(items.map(item => ({ ...item, isEditable: false })).slice());
          setTimeout(() => {
            if (step && self.props.changeStep) {
              self.props.changeStep(step);
            }
            if (target == "submit") {
              if (self.props.submitDetails) {
                self.props.submitDetails();
              }
            }
          });
        });
      }
    }
  }
  private previousClick = () => {
    this.executeNavigation(Step.step1);
  }
  private submitDetails = () => {
    this.executeNavigation(null, "submit");
  }
  private resetDetails = () => {
    this.executeNavigation(null, "reset");
  }
  //#endregion

  //#region Add and Clone Item
  private addItem = (): void => {
    let { items } = this.state;
    let maxKey = 0;
    if (items.length > 0) {
      items.forEach((item) => {
        if (item!.key > maxKey) {
          maxKey = item.key;
        }
      });
      maxKey += 1;
    }
    const _newItem: IVendorComplain = {
      key: maxKey,
      upc: { upcpart1: '', upcpart2: '', upcpart3: '', upcpart4: '' },
      gtin: '',
      corporateItemCode: '',
      warningText: '',
      itemDescription: '',
      isProp65: null,
      isOnLabel: null,
      foodInd: null,
      effFromDate: null,
      isEditable: false,
      isCloned: false,
      clonedFrom: null

    };
    items.splice(0, 0, Object.assign({}, _newItem));
    items = this.rearrangeIndices(items);
    items = this._sortItems(items, 'key');
    this.setState({
      items: items.slice(),
    });
    const self = this;
    setTimeout(() => {
      self._resetSelectedItem();
      setTimeout(() => {
        self._setSelectedItem(items[0] as IVendorComplain);
        setTimeout(() => {
          self.setSelectedRow({ index: 0 });
        });
      });
    });
  }
  private addUPCByCloningItem = (): void => {
    let { items, selectedItem } = this.state;
    items = items as IVendorComplain[];
    selectedItem = selectedItem as IVendorComplain;
    if (selectedItem) {
      if (this.validateGTIN({ ...selectedItem }) || this.validateCorporateItemCode({ ...selectedItem })) {
        let maxKey = 0;
        if (items.length > 0) {
          items.forEach((item) => {
            if (item!.key > maxKey) {
              maxKey = item.key;
            }
          });
          maxKey += 1;
        }
        const _newItem: IVendorComplain = {
          ...selectedItem,
          key: maxKey,
          upc: { upcpart1: '', upcpart2: '', upcpart3: '', upcpart4: '' },
          isEditable: false,
          isCloned: true,
          clonedFrom: selectedItem.key
        };
        items.splice(selectedItem.key + 1, 0, Object.assign({}, _newItem));
        items = this.rearrangeIndices(items);
        items = this._sortItems(items, 'key');
        this.setState({
          items: items.slice()
        });
        const self = this;
        setTimeout(() => {
          self._resetSelectedItem();
          setTimeout(() => {
            self._setSelectedItem(items[selectedItem.key + 1] as IVendorComplain);
            setTimeout(() => {
              self.setSelectedRow({ index: selectedItem.key + 1 });
            });
          });
        });
      } else {
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Invalid', subText: 'Invalid row to cloan. Please add either GTIN or Corporate Item Code' });
      }
    }
  }
  //#endregion

  //#region Render and Render Column
  public render() {
    const listStyle = {
      msListCell: {
        backgroundColor: 'white'
      }
    };
    let { columns, isCompactMode, items, modalData, showModal, selectedItem, validationError } = this.state;
    items = items as IVendorComplain[];
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
      let item: any = items.filter(x => x.key == modalData.index);
      if (item && item.length > 0) {
        item = item[0];
        isEditable = item!.isEditable;
        isCloned = item!.isCloned;
      }
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
    let addUpcDisabled: boolean = validationError ? validationError!.hasError || false : false;
    if (!selectedItem) {
      addUpcDisabled = true;
    } else {
      const { gtin, corporateItemCode, warningText, itemDescription, isProp65, isOnLabel, foodInd, isCloned: isClonedItem } = selectedItem as IVendorComplain;
      if (isClonedItem) {
        addUpcDisabled = true;
      } else {
        if (!gtin && !corporateItemCode) {
          addUpcDisabled = true;
        } else {
          if (!warningText || !itemDescription || isProp65 == null || isOnLabel == null || foodInd == null) {
            addUpcDisabled = true;
          }
        }
      }
    }
    return (
      <div className={[styles.dFlex, styles.dColumn, styles.flexGrowOne].join(' ')}>
        <div className={[styles.dFlex, styles.flexGrowOne, styles.dColumn].join(' ')}>
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
            </div>
            <div className="ms-modalExample-footer">
              {modalButtons}
            </div>
          </Modal>
          <div className={[styles.infoDiv, styles.marginBottom15, 'ms-borderColor-themeTertiary'].join(' ')}>
            <div><InfoSolid /></div>
            <div>Data governance to provide suitable text here</div>
          </div>

          {validationError.hasError ?
            // <div className={styles.marginBottom15}>
            //   {/* place for validation errors */}
            //   <h4>{validationError.errors.length} validation error(s)</h4>
            // </div> 
            null
            : null}

          {/* <TextField placeholder="Filter by name" className={styles.marginBottom15} onChanged={this.onFilterChange}></TextField> */}
          <div className={styles.vendorWarningBodyGrid}>
            <DetailsList
              componentRef={(ev) => this._root = ev}
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
              // onItemInvoked={this._onItemInvoked}
              onRenderItemColumn={this._onRenderColumn}
              onRenderRow={this._onRenderRow}
              className={styles.vendorGrid}
            />
          </div>
        </div>
        <div className={[styles.vendorWarningFooter, styles.minusMarginForFooterReset].join(' ')}>

          <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
            <div>
              {/* disabled={validationError ? validationError!.hasError || false : false} */}
              <ActionButton
                ariaLabel="Add Another Item"
                iconProps={{ iconName: 'Add' }}
                onClick={this.addItem}
                className={styles.spaceRight}
                primary={true}
              >
                Add Another Item
        </ActionButton>
              <ActionButton
                ariaLabel="Add UPC"
                iconProps={{ iconName: 'Copy' }}
                onClick={this.addUPCByCloningItem}
                primary={true}
                disabled={addUpcDisabled}
              >
                Add UPC
        </ActionButton>
              {/* <DefaultButton onClick={this.addItem} primary={true} text="Add Another Item" />
              <DefaultButton disabled={addUpcDisabled} onClick={this.addUPCByCloningItem} primary={true} text="Add UPC" /> */}
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
                ariaLabel="submits the entire details"
                iconProps={{ iconName: 'CheckMark' }}
                onClick={this.submitDetails}
                className={styles.spaceRight}
              >
                Submit
              </ActionButton>
              <ActionButton
                ariaLabel="cancels the entire form"
                iconProps={{ iconName: 'Cancel' }}
                onClick={this.resetDetails}
              >
                Cancel
              </ActionButton>
              {/* <DefaultButton ariaLabel="submits the entire details" primary={true} onClick={this.submitDetails} text="Submit" />
              <DefaultButton ariaLabel="cancels the entire form" primary={true} onClick={this.resetDetails} text="Cancel" /> */}
              {/* <ActionButton
                data-automation-id="Finish"
                iconProps={{ iconName: 'ChromeBackMirrored' }}
                onClick={this.nextClick}
                className={styles.reverseDirection}
              >
                Next
              </ActionButton> */}
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
  private _onRenderRow = (props: IDetailsRowProps): JSX.Element => {
    const th = theme;
    let { item } = props;
    const { selectedItem } = this.state;
    item = item as IVendorComplain;
    if (item) {
      if (!selectedItem) {
        const { isCloned } = item;
        if (isCloned) {
          const exampleChildClass = mergeStyles({
            backgroundColor: `${th.palette.themeLight} !important`
          });
          return <DetailsRow {...props} className={exampleChildClass} />;
        }
      } else {
        if (JSON.stringify(item) != JSON.stringify(selectedItem)) {
          const { isCloned } = item;
          if (isCloned) {
            const exampleChildClass = mergeStyles({
              backgroundColor: `${th.palette.themeLight} !important`
            });
            return <DetailsRow {...props} className={exampleChildClass} />;
          }
        }
      }
    }
    return <DetailsRow {...props} />;
  }
  private _onRenderColumn = (item: IVendorComplain, index: number, column: IColumn) => {
    const self = this;
    let value = null;
    if (item && column) {
      const { key, isEditable, isCloned } = item;
      const { validationError, selectedItem } = this.state;

      let [vWarningText, vItemDescription, vProp65, vOnLabel, vFoodInd, vUPC, vGTIN, vItemCode] = [null, null, null, null, null, null, null, null];

      if (selectedItem && item.key == selectedItem.key) {
        const [vupc, vgtin, vitemcode] = [validationError.errors.filter(x => x.field == 'UPC'),
        validationError.errors.filter(x => x.field == 'gtin'), validationError.errors.filter(x => x.field == 'corporateItemCode')];

        if (!isCloned) {
          if (vupc && vupc.length > 0) {
            vUPC = vupc[0].errorMessage;
          }
          if (vgtin && vgtin.length > 0) {
            vGTIN = vgtin[0].errorMessage;
          }
          if (vitemcode && vitemcode.length > 0) {
            vItemCode = vitemcode[0].errorMessage;
          }
        } else {
          if (vupc && vupc.length > 0) {
            vUPC = vupc[0].errorMessage;
          }
        }

        const vwarningtext = validationError.errors.filter(x => x.field == 'warningText');
        if (vwarningtext && vwarningtext.length > 0) {
          vWarningText = vwarningtext[0].errorMessage;
        }
        const vitemdescription = validationError.errors.filter(x => x.field == 'itemDescription');
        if (vitemdescription && vitemdescription.length > 0) {
          vItemDescription = vitemdescription[0].errorMessage;
        }
        const vprop65 = validationError.errors.filter(x => x.field == 'isProp65');
        if (vprop65 && vprop65.length > 0) {
          vProp65 = vprop65[0].errorMessage;
        }
        const vonlabel = validationError.errors.filter(x => x.field == 'isOnLabel');
        if (vonlabel && vonlabel.length > 0) {
          vOnLabel = vonlabel[0].errorMessage;
        }
        const vfoodind = validationError.errors.filter(x => x.field == 'foodInd');
        if (vfoodind && vfoodind.length > 0) {
          vFoodInd = vfoodind[0].errorMessage;
        }
      }

      if (column.fieldName) {
        value = item[column.fieldName];
        switch (column.fieldName) {
          case 'upcpart1':
            return <TextField disabled={!isEditable} value={item!['upc']![column.fieldName]}
              onChanged={this.upcChange(column.fieldName, key)}></TextField>;
          case 'upcpart2':
            return <TextField disabled={!isEditable} value={item!['upc']![column.fieldName]}
              onChanged={this.upcChange(column.fieldName, key)}></TextField>;
          case 'upcpart3':
            return <TextField disabled={!isEditable} value={item!['upc']![column.fieldName]}
              onChanged={this.upcChange(column.fieldName, key)}></TextField>;
          case 'upcpart4':
            return <TextField errorMessage={vUPC} disabled={!isEditable} value={item!['upc']![column.fieldName]}
              onChanged={this.upcChange(column.fieldName, key)}></TextField>;
          case 'gtin':
            return <TextField errorMessage={vGTIN} disabled={isCloned ? true : (!isEditable)} value={value}
              onChanged={this.valuesChanged(column.fieldName, key)}></TextField>;
          case 'corporateItemCode':
            return <TextField errorMessage={vItemCode} disabled={isCloned ? true : (!isEditable)} value={value}
              onChanged={this.valuesChanged(column.fieldName, key)}></TextField>;
          case 'warningText':
            return <TextField multiline rows={4} errorMessage={vWarningText} readOnly={true} value={value} onClick={self.showModal(column.fieldName, key)}></TextField>;
          case 'itemDescription':
            return <TextField multiline rows={4} errorMessage={vItemDescription} readOnly={true} value={value} onClick={self.showModal(column.fieldName, key)}></TextField>;
          case 'isProp65':
            return <Dropdown
              errorMessage={vProp65}
              label=""
              disabled={isCloned ? true : (!isEditable)}
              selectedKey={value}
              onChanged={this.onDropdownChange(column.fieldName, key)}
              placeHolder=""
              options={[
                { key: 'Y', text: 'Y' },
                { key: 'N', text: 'N' },
              ]}
            />;
          case 'isOnLabel':
            return <Dropdown
              errorMessage={vOnLabel}
              label=""
              disabled={isCloned ? true : (!isEditable)}
              selectedKey={value}
              onChanged={this.onDropdownChange(column.fieldName, key)}
              placeHolder=""
              options={[
                { key: 'Y', text: 'Y' },
                { key: 'N', text: 'N' },
              ]}
            />;
          case 'foodInd':
            return <Dropdown
              errorMessage={vFoodInd}
              label=""
              disabled={isCloned ? true : (!isEditable)}
              selectedKey={value}
              onChanged={this.onDropdownChange(column.fieldName, key)}
              placeHolder=""
              options={[
                { key: 'Y', text: 'Y' },
                { key: 'N', text: 'N' },
              ]}
            />;
          case 'effFromDate':
            const firstDayOfWeek = DayOfWeek.Sunday;
            return <DatePicker
              value={value!}
              disabled={isCloned ? true : (!isEditable)}
              firstDayOfWeek={firstDayOfWeek}
              strings={DayPickerStrings}
              placeholder="Select a date"
              ariaLabel="Select a date"
              allowTextInput={true}
              onSelectDate={self.onSelectDate(key)}
              formatDate={_onFormatDate}
              parseDateFromString={this._onParseDateFromString(key)}
            ></DatePicker>;
          default:
            return <span>{value}</span>;
        }
      } else if (column.key == 'isDelete') {
        return <IconButton
          iconProps={{ iconName: 'BoxMultiplySolid' }} title="Delete" className={styles.redBg} ariaLabel="Delete" onClick={self.deleteItem(key)}></IconButton>;
      }
    }
  }
  private onSelectDate = (key: number) => (date: Date | null | undefined) => {
    let { items, selectedItem } = this.state;
    let selected: any = items.filter(x => x.key == key);
    if (selected && selected.length > 0) {
      selected = selected[0] as IVendorComplain;
      selected.effFromDate = date;
      if (selectedItem) {
        selectedItem.effFromDate = date;
      }
      items = this.propagateChangeToClonedRow(key, date, 'effFromDate', items);
      this.setState({
        items: items.slice(),
        selectedItem
      });
      const self = this;
      setTimeout(() => {
        self.validateSelectedItem();
        setTimeout(() => {
          self.setState({ items: self.state.items.slice() });
        });
      });
    }
  }
  private _onParseDateFromString = (key: number) => (value: string): Date => {
    const { items } = this.state;
    const selected = items.filter(x => x.key == key)[0];
    const date = selected.effFromDate || new Date();
    try {
      const values = (value || '').trim().split('/');

      const month = values.length > 0 ? Math.max(1, Math.min(12, parseInt(values[0], 10))) - 1 : date.getMonth();
      const day = values.length > 1 ? Math.max(1, Math.min(31, parseInt(values[1], 10))) : date.getDate();
      let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
      if (year < 100) {
        year += date.getFullYear() - (date.getFullYear() % 100);
      }
      return new Date(year, month, day);
    } catch (_) {
      return null;
    }
  }
  //#endregion

  //#region DetailList helpers
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
  //#endregion

  //#region Delete and rearrange
  private rearrangeIndices = (items: IVendorComplain[]): IVendorComplain[] => {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const { key: item_key } = item;
      item.key = index;
      if (!item.isCloned) {
        const filter = items.filter(x => x.clonedFrom == item_key);
        if (filter && filter.length > 0) {
          filter.forEach((f) => {
            f.clonedFrom = index;
          });
        }
      }
    }
    return items;
  }
  private deleteItem = (key: number) => () => {
    this.setState({
      deleteKey: key
    });
    this.props._showConfirmDialog({ type: DialogType.normal, title: 'Delete', subText: 'This will delete the row and all its associated copied rows. Are you sure you want to continue?' }, this.deleteCallback);
  }
  private deleteCallback = () => {
    const { deleteKey: key } = this.state;
    let { items } = this.state;
    items = items.filter((item) => item.key != key && item.clonedFrom != key) as IVendorComplain[];
    items = this.rearrangeIndices(items);
    items = this._sortItems(items, 'key');
    this.setState({
      items: items.slice(),
      deleteKey: null
    });
    const self = this;
    setTimeout(() => {
      self._resetSelectedItem();
      setTimeout(() => {
        self.setSelectedRow({ index: null });
      });
    });
  }
  //#endregion
}


