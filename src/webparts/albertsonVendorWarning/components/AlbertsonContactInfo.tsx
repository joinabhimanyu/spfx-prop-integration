import * as React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import pnp, { sp, Web, ItemAddResult, EmailProperties } from 'sp-pnp-js';
import {
  IVendorComplain, IContactInfo, IVendorInfo, Step, IValidationError, UserGroup, IContactModalData, IAttachment,
  IUserManager, UserRole, ISite, VendorOptions, IUPC
} from '../interfaces/AlbertsonDomainInterfaces';
import AlbertsonVendorWarning from './AlbertsonVendorWarning';
import AlbertsonLoadLetter from './AlbertsonLoadLetter';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { debounce } from "@microsoft/sp-lodash-subset";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import styles from './AlbertsonVendorWarning.module.scss';
import { ActionButton, IButtonProps, IconButton } from 'office-ui-fabric-react/lib/Button';
import { _contactInfoValidationBlob, _venderInfoValidationBlob, IValidationBlob } from './AlbertsonConstants';
import InputMask from 'react-input-mask';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DialogType } from 'office-ui-fabric-react/lib/Dialog';
import * as appSettings from 'appSettings';
import { sendMail, _onFormatDate, logError } from '../utils/commonUtility';
import { Logger, ConsoleListener, LogLevel, FunctionListener, LogEntry, LogListener } from "sp-pnp-js/lib/utils/logging";
import LoggingService, { ILogItem, ILogData } from '../utils/LoggingService';

export interface IVendorState {
  contactInfo: IContactInfo;
  vendInfo: IVendorInfo;
  complaintInfo: IVendorComplain[];
  files?: IAttachment[];
  currentStep: Step;
  contactModalData: IContactModalData;
  showContactModal: boolean;
  showHelpModal: boolean;
  helpInfo: string;
  validationError?: IValidationError;
  user?: IUserManager;
  subsites?: ISite[];
  initialVendors?: VendorOptions[];
  showSpinner?: boolean;
}

const initialState: IVendorState = {
  contactInfo: {},
  vendInfo: {},
  complaintInfo: [],
  files: [],
  currentStep: Step.step1,
  contactModalData: {},
  showContactModal: false,
  showHelpModal: false,
  helpInfo: `
       It is a long established fact that a reader will be distracted by the readable content of 
        a page when looking at its layout. The point of using Lorem Ipsum is that it has a 
        more-or-less normal distribution of letters, as opposed to using 'Content here, content 
        here', making it look like readable English. Many desktop publishing packages and web page 
        editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will 
        uncover many web sites still in their infancy. Various versions have evolved over the years, 
        sometimes by accident, sometimes on purpose (injected humour and the like).
      `,
  validationError: { hasError: true, errors: [] },
  showSpinner: false
};

export default class AlbertsonContactInfo extends React.Component<any, IVendorState>{
  private _debounceContactChange;
  private _debounceVendChange;
  private _debouceChangeContactModalData;
  private _nextNavigationSource?: string;
  private _web: Web;
  constructor(props) {
    super(props);
    this.state = {
      ...initialState
    };
    this._debouceChangeContactModalData = (fieldName: string, text: string) => {
      this.setState({
        contactModalData: {
          ...this.state.contactModalData,
          [fieldName]: text
        }
      });
    };
    this._debounceContactChange = (fieldName: string, text: string) => {
      const { contactInfo } = this.state;
      if (fieldName) {
        this.setState({
          // ...this.state,
          contactInfo: {
            ...contactInfo,
            [fieldName]: text
          }
        });
      }
      const self = this;
      setTimeout(() => {
        const result: IValidationError = self.validateOnNext();
        self.setState({
          validationError: result
        });
      }, 10);
    };
    this._debounceVendChange = (fieldName: string, text: string) => {
      const { vendInfo } = this.state;
      if (fieldName) {
        this.setState({
          vendInfo: {
            ...vendInfo,
            [fieldName]: text
          }
        });
      }
      const self = this;
      setTimeout(() => {
        const result: IValidationError = self.validateOnNext();
        self.setState({
          validationError: result
        });
      }, 10);
    };
    this._debouceChangeContactModalData = debounce(this._debouceChangeContactModalData, 500);
    this._debounceContactChange = debounce(this._debounceContactChange, 500);
    this._debounceVendChange = debounce(this._debounceVendChange, 500);
  }
  private fetchVendorMaster = (inputValue?: string) => {
    return new Promise((resolve, reject) => {
      const constructVendors = (vendors: any) => {
        const v: any = vendors.map((item) => ({
          value: item.Id + "",
          label: item.Title + ""
        }));
        const vendInfo: IVendorInfo = { vendName: '', vendNum: '' };
        const { subsites } = this.state;
        if (subsites && subsites.length > 0) {
          const s = subsites.filter(x => x.IsCurrentSubSite);
          const selectedVendor = vendors.filter(x => x.SiteRelativeUrl == s[0].ServerRelativeUrl);
          if (selectedVendor && selectedVendor.length > 0) {
            // vendInfo.vendName = selectedVendor[0].Title + "";
            // vendInfo.vendNum = selectedVendor[0].Id + "";
          }
        }
        this.setState({
          vendInfo
        });
        resolve(v);
      };
      pnp.setup({
        sp: {
          headers: {
            "Accept": "application/json; odata=verbose"
          }
        }
      });
      if (inputValue) {
        this._web.lists.getByTitle("VendorMaster").items.select("Id,Title,SiteRelativeUrl").filter(`substringof('${inputValue}',Title)`).get().then((items) => {
          constructVendors(items);
        });
      } else {
        this._web.lists.getByTitle("VendorMaster").items.select("Id,Title,SiteRelativeUrl").get().then((items) => {
          constructVendors(items);
        });
      }
    });
  }
  private handleVendorChange = (selectedOption) => {
    const vendInfo: IVendorInfo = { vendName: '', vendNum: '' };
    if (selectedOption) {
      const { value, label } = selectedOption;
      vendInfo.vendName = label + "";
      vendInfo.vendNum = value + "";
    }
    this.setState({
      vendInfo
    });
    const self = this;
    setTimeout(() => {
      const result: IValidationError = self.validateOnNext();
      self.setState({
        validationError: result
      });
    }, 10);
  }
  private _getCurrentSiteCollection = () => {
    return new Promise((res, rej) => {
      const result = [];
      const recCheckWeb = (webUrl: string) => {
        return new Promise((resolve, reject) => {
          const _web = new Web(webUrl);
          const _batch = _web.createBatch();
          const req = _web.select("Title,Url,Webs").expand("Webs");
          req.inBatch(_batch).get().then(w => {
            if (w.Webs && w.Webs.length > 0) {
              w.Webs.forEach((subsite) => {
                result.push({
                  Id: subsite.Id,
                  MasterUrl: subsite.MasterUrl,
                  CustomMasterUrl: subsite.CustomMasterUrl,
                  ServerRelativeUrl: subsite.ServerRelativeUrl,
                  Title: subsite.Title,
                  Description: subsite.Description,
                  Url: subsite.Url,
                  IsCurrentSubSite: false
                });
                recCheckWeb(subsite.Url).then(_ => {
                  resolve();
                });
              });
            }
          });
          _batch.execute().then(_ => {
            resolve();
          });
        });
      };
      this._web.get().then((w) => {
        recCheckWeb(w.Url).then(_ => {
          const subsites: ISite[] = result.slice();
          this._getCurrentSubSite().then((c) => {
            const filter = subsites.filter(x => x.Id == c.Id);
            if (filter && filter.length > 0) {
              filter[0].IsCurrentSubSite = true;
              res(subsites);
            }
          });
        });
      });
    });
  }
  private _getCurrentSubSite = async () => {
    return await pnp.sp.web.select("Id").get();
  }
  private fetchUserDetails = async () => {
    pnp.setup({
      sp: {
        headers: {
          "Accept": "application/json; odata=verbose"
        }
      }
    });
    const user_resp = await this._web.currentUser.get();
    const { Id, Email, IsEmailAuthenticationGuestUser, IsShareByEmailGuestUser,
      IsSiteAdmin, Title, LoginName, PrincipalType } = user_resp;
    const groups = await this._web.siteUsers.getById(Id).groups.get();
    const UserGroups: UserGroup[] = groups.map(g => ({
      Description: g.Description || '',
      Id: g.Id,
      LoginName: g.LoginName,
      OnlyAllowMembersViewMembership: g.OnlyAllowMembersViewMembership,
      OwnerTitle: g.OwnerTitle,
      PrincipalType: g.PrincipalType,
      Title: g.Title
    }));
    // this._web.siteGroups.getById(site_g.Id).users.getByEmail(Email).get();
    const Role: UserRole = IsSiteAdmin ? UserRole.Admin : UserRole.Vendor;
    const user: IUserManager = {
      Id,
      Email,
      IsEmailAuthenticationGuestUser,
      IsShareByEmailGuestUser,
      IsSiteAdmin,
      Title,
      LoginName,
      PrincipalType,
      Role,
      UserGroups
    };
    return user;
  }
  private fetchDocumentLibrary = () => {
    const result = [];
    let getFiles = (folderUrl) => {
      return new Promise((resolve, reject) => {
        pnp.sp.web.getFolderByServerRelativeUrl(folderUrl)
          .expand("Folders, Files").get().then(r => {
            const prs = r.Folders.results.map(item => {
              return getFiles(item.ServerRelativeUrl);
            });
            Promise.all(prs).then(_ => {
              r.Files.results.forEach(item => {
                result.push(item);
              });
              resolve();
            });
          });
      });
    };
    return getFiles("Shared Documents").then(_ => {
      const f = result.filter(x => x.CustomizedPageStatus == 0).map((x, i) => ({
        key: i,
        name: x.Name || '',
        uploadTimeStamp: x.TimeCreated,
        serverRelativeUrl: x.ServerRelativeUrl
      }));
      return f;
    });
  }
  private fetchItems = () => {
    return pnp.sp.web.lists.getByTitle(appSettings.vendorItemsListName).items.select("UpcOne", "UpcTwo", "UpcThree", "UpcFour", "Gtin", "ItemCode"
      , "WarningText", "ItemDescription", "Prop65", "OnLabel", "FoodInd", "EffFromDate").get().then(resp => {
        const items = resp.map((item, index) => ({
          key: index,
          upc: { upcpart1: item.UpcOne, upcpart2: item.UpcTwo, upcpart3: item.UpcThree, upcpart4: item.UpcFour },
          gtin: item.Gtin,
          corporateItemCode: item.ItemCode,
          warningText: item.WarningText,
          itemDescription: item.ItemDescription,
          isProp65: item.Prop65 ? 'Y' : 'N',
          isOnLabel: item.OnLabel ? 'Y' : 'N',
          foodInd: item.FoodInd ? 'Y' : 'N',
          effFromDate: item.EffFromDate,
          isEditable: false,
          isCloned: false,
          clonedFrom: null
        }));
        return items;
      });
  }
  private fetchVendorInformation = () => {
    return pnp.sp.web.lists.getByTitle(appSettings.vendorInfoListName).items.select("FirstName", "LastName", "Email", "Phone"
      , "Employer", "VendorNumber", "VendorName").get().then(resp => {
        const items = resp.map(item => ({
          firstname: item.FirstName,
          lastname: item.LastName,
          email: item.Email,
          phone: item.Phone,
          employer: item.Employer,
          vendNum: item.VendorNumber,
          vendName: item.VendorName
        }));
        return items;
      });
  }
  private _toggleSpinner = () => {
    const { showSpinner } = this.state;
    this.setState({
      showSpinner: !showSpinner
    });
  }
  private initDataOnLoad = () => {
    let subsites = [];
    let vendors = [];
    let userD = null;
    let docsD = null;
    let itemsD = null;
    let contactInfo = null;
    this._toggleSpinner();
    return this._getCurrentSiteCollection()
      .then((sresult: any) => {
        subsites = sresult;
        return this.fetchVendorMaster();
      }).then((v: any) => {
        vendors = v.slice();
        return Promise.resolve();
      })
      .then(_ => {
        return this.fetchUserDetails();
      }).then(user => {
        userD = user;
        return this.fetchDocumentLibrary();
      })
      .then(docs => {
        docsD = docs;
        return this.fetchItems();
      })
      .then(items => {
        itemsD = items;
        return this.fetchVendorInformation();
      })
      .then(vend => {
        contactInfo = vend;
        this._toggleSpinner();
        return ({ vendors, userD, docsD, itemsD, contactInfo, err: null });
      }).catch((error) => {
        this._toggleSpinner();
        return ({ vendors: null, userD: null, docsD: null, itemsD: null, contactInfo: null, err: error });
      });
  }
  public async componentDidMount() {
    const url = this.props!.context!.pageContext!.site!.absoluteUrl || '';
    const web = new Web(url);
    this._web = web;
    Logger.activeLogLevel = LogLevel.Verbose;
    const user = await this.fetchUserDetails();
    let advancedLogging = new LoggingService(appSettings.applicationName, user.Id);
    Logger.subscribe(advancedLogging);
    Logger.subscribe(new ConsoleListener());
    const result: IValidationError = this.validateOnNext();
    this.setState({
      validationError: result,
      user: user
    });
  }
  private setItems = (items): void => {
    if (items) {
      this.setState({
        complaintInfo: items.slice()
      });
    }
  }
  private setFiles = (files): void => {
    if (files) {
      this.setState({
        files: files.slice()
      });
    }
  }
  private onContactClick = (event: any) => {
    let { contactModalData } = this.state;
    contactModalData = {};
    this.setState({
      contactModalData: contactModalData,
      showContactModal: true
    });
  }
  private openHelpInfo = (event: any) => {
    this.setState({
      showHelpModal: true
    });
  }
  private closeContactModal = () => {
    this.setState({
      showContactModal: false
    });
  }
  private closeHelpModal = () => {
    this.setState({
      showHelpModal: false
    });
  }
  private saveContactModalData = async () => {
    const result = { validationMessege: '', hasError: false };
    const { contactModalData } = this.state;
    if (!contactModalData.subject || !contactModalData.body) {
      result.validationMessege = "Invalid contact info";
      result.hasError = true;
    }
    if (result.hasError) {
      this.props._showAlertDialog({ type: DialogType.normal, title: 'Validation', subText: result.validationMessege });
    } else {
      const { subject, body } = contactModalData;
      const mailr = await sendMail(subject, body);
      if (mailr) {
        this.setState({
          showContactModal: false
        });
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Mail', subText: 'Mail sent successfully' });
      }
    }
  }
  private changeStep = (step): void => {
    this.setState({
      currentStep: step
    });
  }
  private changeContactModalData = (fieldName: string) => (text: string) => {
    this._debouceChangeContactModalData(fieldName, text);
  }
  private contactChange = (fieldname: any) => (text: string) => {
    this._debounceContactChange(fieldname, text);
  }
  private vendChange = (fieldname: any) => (text: string) => {
    this._debounceVendChange(fieldname, text);
  }
  private validateOnNext(): IValidationError {
    const result: IValidationError = { errors: [], hasError: false };
    const { currentStep } = this.state;
    if (currentStep == Step.step1) {
      const { contactInfo, vendInfo } = this.state;
      const [firstname, lastname, email, phone, employer] = [
        _contactInfoValidationBlob.filter(x => x.field == 'firstname')[0],
        _contactInfoValidationBlob.filter(x => x.field == 'lastname')[0],
        _contactInfoValidationBlob.filter(x => x.field == 'email')[0],
        _contactInfoValidationBlob.filter(x => x.field == 'phone')[0],
        _contactInfoValidationBlob.filter(x => x.field == 'employer')[0]
      ];
      const [vendName, vendNum] = [_venderInfoValidationBlob.filter(x => x.field == 'vendName')[0],
      _venderInfoValidationBlob.filter(x => x.field == 'vendNum')[0]];
      (firstname.required && !contactInfo.firstname) ? (function () {
        result.errors.push({
          field: 'firstname',
          errorMessage: 'Firstname is required'
        });
        result.hasError = true;
      }()) : (function () {
        if (!firstname.pattern.test(contactInfo!.firstname)) {
          result.errors.push({
            field: 'firstname',
            errorMessage: 'Invalid Firstname'
          });
          result.hasError = true;
        }
      }());
      (lastname.required && !contactInfo.lastname) ? (function () {
        result.errors.push({
          field: 'lastname',
          errorMessage: 'Lastname is required'
        });
        result.hasError = true;
      }()) : (function () {
        if (!lastname.pattern.test(contactInfo!.lastname)) {
          result.errors.push({
            field: 'lastname',
            errorMessage: 'Invalid Lastname'
          });
          result.hasError = true;
        }
      }());
      (email.required && !contactInfo.email) ? (function () {
        result.errors.push({
          field: 'email',
          errorMessage: 'Email is required'
        });
        result.hasError = true;
      }()) : (function () {
        if (!email.pattern.test(contactInfo!.email)) {
          result.errors.push({
            field: 'email',
            errorMessage: 'Invalid Email'
          });
          result.hasError = true;
        }
      }());
      (phone.required && !contactInfo.phone) ? (function () {
        result.errors.push({
          field: 'phone',
          errorMessage: 'Phone is required'
        });
        result.hasError = true;
      }()) : (function () {
        if (!phone.pattern.test(contactInfo!.phone)) {
          result.errors.push({
            field: 'phone',
            errorMessage: 'Invalid Phone'
          });
          result.hasError = true;
        }
      }());
      (employer.required && !contactInfo.employer) ? (function () {
        result.errors.push({
          field: 'employer',
          errorMessage: 'Company is required'
        });
        result.hasError = true;
      }()) : (function () {
        if (!employer.pattern.test(contactInfo!.employer)) {
          result.errors.push({
            field: 'employer',
            errorMessage: 'Invalid Company'
          });
          result.hasError = true;
        }
      }());
      if (vendName.required && !vendInfo.vendName && vendNum.required && !vendInfo.vendNum) {
        result.errors.push({
          field: 'vendor',
          errorMessage: 'Vendor is required'
        });
        result.hasError = true;
      } else {
        if (vendInfo.vendName) {
          if (!vendName.pattern.test(vendInfo.vendName)) {
            result.errors.push({
              field: 'vendor',
              errorMessage: 'Invalid Vendor'
            });
            result.hasError = true;
          }
        } else if (vendInfo.vendNum) {
          if (!vendNum.pattern.test(vendInfo.vendNum)) {
            result.errors.push({
              field: 'vendor',
              errorMessage: 'Invalid Vendor'
            });
            result.hasError = true;
          }
        }
      }
    }
    return result;
  }
  private onNextClick = (navSource: string) => () => {
    navSource ? this._nextNavigationSource = navSource : this._nextNavigationSource = null;
    this.changeStep(Step.step2);
  }
  private resetDetails = () => {
    this.props._showConfirmDialog({ type: DialogType.normal, title: 'Reset', subText: 'This will reset all changes. Do you want to continue?' }, this.resetCallback);
  }
  private resetCallback = () => {
    this.setState({
      ...initialState
    });
    this.changeStep(Step.step1);
    const self = this;
    setTimeout(() => {
      const result: IValidationError = self.validateOnNext();
      self.setState({
        validationError: result,
      });
    });
  }
  private submitDetails = () => {
    this.props._showConfirmDialog({ type: DialogType.normal, title: 'Save', subText: 'Do you want to save the details?' }, this.submitCallback);
  }
  private submitCallback = () => {
    try {
      const { contactInfo, vendInfo, complaintInfo } = this.state;
      this._toggleSpinner();
      this.submitVendorInformation(contactInfo, vendInfo).then(_ => {
        return this.submitItems(complaintInfo);
      }).then(_ => {
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Save', subText: 'Data saved successfully' });
        this._toggleSpinner();
        this.props.toggleMainModal();
      }).catch((error) => {
        logError(error, LogLevel.Error, "submitDetails");
        this._toggleSpinner();
      });
    } catch (error) {
      logError(error, LogLevel.Error, "submitDetails");
      this._toggleSpinner();
    }
  }

  private generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  private submitVendorInformation = (contactInfo: IContactInfo, vendInfo: IVendorInfo) => {
    const data = {
      FirstName: contactInfo.firstname,
      LastName: contactInfo.lastname,
      Email: contactInfo.email,
      Phone: contactInfo.phone,
      Employer: contactInfo.employer,
      VendorNumber: vendInfo.vendNum,
      VendorName: vendInfo.vendName
    };
    return pnp.sp.web.lists.getByTitle(appSettings.vendorInfoListName).items.add({ ...data, Title: this.generateGUID() })
      .then((iam: ItemAddResult) => iam);
  }
  private submitItems = (complaintInfo: IVendorComplain[]) => {
    return new Promise((resolve, reject) => {
      const data = complaintInfo.map(item => ({
        UpcOne: item.upc.upcpart1,
        UpcTwo: item.upc.upcpart2,
        UpcThree: item.upc.upcpart3,
        UpcFour: item.upc.upcpart4,
        Gtin: item.gtin,
        ItemCode: item.corporateItemCode,
        WarningText: item.warningText,
        ItemDescription: item.itemDescription,
        Prop65: item.isProp65 == 'Y' ? true : false,
        OnLabel: item.isOnLabel == 'Y' ? true : false,
        FoodInd: item.foodInd == 'Y' ? true : false,
        EffFromDate: item.effFromDate ? _onFormatDate(item.effFromDate) : null
      }));
      const list = pnp.sp.web.lists.getByTitle(appSettings.vendorItemsListName);
      list.getListItemEntityTypeFullName()
        .then(entityTypeFullName => {
          // const batch = pnp.sp.web.createBatch();
          const prs = data.map(item => list.items.add({ ...item, Title: this.generateGUID() }, entityTypeFullName));
          Promise.all(prs)
            .then(() => { resolve(); })
            .catch((err) => { reject(err); });
        }).catch((err) => { reject(err); });
    });
  }
  private previousClick = () => {
    this.changeStep(Step.step2);
  }
  public render() {
    const { contactInfo, vendInfo, complaintInfo, currentStep, showContactModal, showHelpModal, contactModalData, helpInfo,
      files, validationError, initialVendors, user, showSpinner } = this.state;
    let selectedOption = {
      value: vendInfo.vendNum ? vendInfo.vendNum + "" : "",
      label: vendInfo.vendName ? vendInfo.vendName + "" : ""
    };
    let [vFirstname, vLastname, vEmail, vPhone, vEmployer, vVendor] = [null, null, null, null, null, null];
    const vfilterfirst = validationError.errors.filter(x => x.field == 'firstname');
    if (vfilterfirst && vfilterfirst.length > 0) {
      vFirstname = vfilterfirst[0].errorMessage;
    }
    const vfiltersecond = validationError.errors.filter(x => x.field == 'lastname');
    if (vfiltersecond && vfiltersecond.length > 0) {
      vLastname = vfiltersecond[0].errorMessage;
    }
    const vemail = validationError.errors.filter(x => x.field == 'email');
    if (vemail && vemail.length > 0) {
      vEmail = vemail[0].errorMessage;
    }
    const vphone = validationError.errors.filter(x => x.field == 'phone');
    if (vphone && vphone.length > 0) {
      vPhone = vphone[0].errorMessage;
    }
    const vemployer = validationError.errors.filter(x => x.field == 'employer');
    if (vemployer && vemployer.length > 0) {
      vEmployer = vemployer[0].errorMessage;
    }
    const vvend = validationError.errors.filter(x => x.field == 'vendor');
    if (vvend && vvend.length > 0) {
      vVendor = vvend[0].errorMessage;
    }
    const emailFormatChars = {
      'p': /^([A-Za-z]+)$/,
      's': '[A-Za-z]'
    };
    let complaintDetails = null;
    if (currentStep == Step.step1) {
      complaintDetails = <div className={[styles.dFlex, styles.dColumn, styles.flexGrowOne].join(' ')}>
        <div className={[styles.vendorWarningBody, 'ms-bgColor-neutralLight'].join(' ')}>

          <div className={[styles.bodyContentHolder, styles.bodyContentHolderMaxWidth].join(' ')}>
            <div className={styles.fullWidthDiv}>
              <div className={[styles.paddingAround, 'ms-bgColor-themeLight ms-bgColor-themeLight--hover ms-borderColor-themePrimary ms-borderColor-themePrimary--hover'].join(' ')}>
                <div className={[styles.title, styles.spaceBottom, 'ms-font-xl'].join(' ')}>Please enter your contact information</div>
                <form>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Name</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <div className={styles.row}>
                        <div className={styles.halfWidthDiv}>
                          <TextField value={contactInfo.firstname} onChanged={this.contactChange('firstname')} errorMessage={vFirstname} />
                          <span className={'ms-fontColor-neutralDark'}>First Name</span>
                        </div>
                        <div className={styles.halfWidthDiv}>
                          <TextField value={contactInfo.lastname} onChanged={this.contactChange('lastname')} errorMessage={vLastname} />
                          <span className={'ms-fontColor-neutralDark'}>Last Name</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Email</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <InputMask
                        // mask="p@sss.com"
                        //   formatChars={emailFormatChars}
                        defaultValue={contactInfo.email}
                        maskChar={null}
                        value={contactInfo.email}
                        onChanged={this.contactChange('email')}
                        errorMessage={vEmail}>
                        {(inputProps) => <TextField {...inputProps} />}
                      </InputMask>
                      {/* <TextField value={contactInfo.email} onChanged={this.contactChange('email')} errorMessage={vEmail} /> */}
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Phone</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <InputMask mask="9999999999"
                        maskChar={null}
                        defaultValue={contactInfo.phone}
                        value={contactInfo.phone}
                        onChanged={this.contactChange('phone')}
                        errorMessage={vPhone}>
                        {(inputProps) => <TextField {...inputProps} />}
                      </InputMask>
                      {/* <TextField value={contactInfo.phone} onChanged={this.contactChange('phone')} errorMessage={vPhone} /> */}
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={[styles.title, styles.spaceBottom, styles.fullWidthDiv, 'ms-font-l'].join(' ')}>Please enter the company you work for if different from the supplier</div>
                    <div>
                      <div className={styles.oneThirdWidthDiv}>
                        <Label required={true}>Company</Label>
                      </div>
                      <div className={styles.twoThirdWidthDiv}>
                        <TextField value={contactInfo.employer} onChanged={this.contactChange('employer')} errorMessage={vEmployer} />
                      </div>
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={[styles.title, styles.spaceBottom, styles.fullWidthDiv, 'ms-font-l'].join(' ')}>Please enter information about the supplier you are entering data for</div>
                    <div>
                      <div className={styles.oneThirdWidthDiv}>
                        <Label required={true}>Vendor Number</Label>
                      </div>
                      <div className={styles.twoThirdWidthDiv}>
                        <TextField value={vendInfo.vendNum} onChanged={this.vendChange('vendNum')} errorMessage={vVendor} />
                      </div>
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Vendor Name</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <TextField value={vendInfo.vendName} onChanged={this.vendChange('vendName')} errorMessage={vVendor}></TextField>
                      {/* <AsyncSelect
                        isDisabled={false}
                        isClearable={true}
                        isSearchable={true}
                        name="vendorName"
                        cacheOptions
                        value={selectedOption}
                        defaultOptions={initialVendors}
                        loadOptions={this.fetchVendorMaster}
                        onChange={this.handleVendorChange}
                      /> */}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>

        <div className={styles.vendorWarningFooter}>
          <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
            <div></div>
            <div>
              <ActionButton
                ariaLabel="Load Letters"
                iconProps={{ iconName: 'Upload' }}
                onClick={this.onNextClick('loadLetter')}
                className={styles.spaceRight}
                primary={true}
                disabled={validationError!.hasError}
              >
                Load Letters
        </ActionButton>
              <ActionButton
                ariaLabel="Upload Prop 65 Item Data"
                iconProps={{ iconName: 'Add' }}
                onClick={this.onNextClick('enterItems')}
                primary={true}
                disabled={validationError!.hasError}
              >
                Upload Prop 65 Item Data
        </ActionButton>
              {/* <DefaultButton ariaLabel="Load Letter" disabled={validationError!.hasError} className={styles.spaceRight} primary={true} text="Load Letters" onClick={this.onNextClick('loadLetter')} /> */}
              {/* <DefaultButton ariaLabel="Upload Prop 65 Item Data" disabled={validationError!.hasError} onClick={this.onNextClick('enterItems')} primary={true} text="Upload Prop 65 Item Data" /> */}
            </div>
          </div>

        </div>
      </div>;
    } else if (currentStep == Step.step2) {
      complaintDetails = <div className={[styles.vendorWarningBody, styles.dFlex].join(' ')}>

        <div className={[styles.bodyContentHolder, styles.bodyContentHolderPadding].join(' ')}>

          <div className={[styles.row, styles.spaceBottom].join(' ')}>
            <div className={styles.oneSixthWidthDiv}>
              <Label>Vendor Name</Label>
            </div>
            <div className={styles.oneThirdWidthDiv}>
              <TextField value={vendInfo.vendName} disabled={true} />
            </div>
            <div className={styles.oneSixthWidthDiv}>
              <Label>Vendor Number</Label>
            </div>
            <div className={styles.oneThirdWidthDiv}>
              <TextField value={vendInfo.vendNum} disabled={true}></TextField>
            </div>
          </div>
          <div className={[styles.row, styles.dFlex, styles.flexGrowOne, styles.dColumn].join(' ')}>
            {this._nextNavigationSource == 'enterItems' ? (
              <AlbertsonVendorWarning setItems={this.setItems}
                items={complaintInfo} changeStep={this.changeStep}
                submitDetails={this.submitDetails}
                resetDetails={this.resetDetails}
                _showAlertDialog={this.props._showAlertDialog}
                _showConfirmDialog={this.props._showConfirmDialog}></AlbertsonVendorWarning>
            ) : (
                this._nextNavigationSource == 'loadLetter' ? (
                  <AlbertsonLoadLetter userid={user.Email}
                    name={`${contactInfo.firstname} ${contactInfo.lastname}`}
                    email={contactInfo.email}
                    phone={contactInfo.phone}
                    company={contactInfo.employer}
                    vendNum={vendInfo.vendNum}
                    vendName={vendInfo.vendName}
                    files={files}
                    setFiles={this.setFiles}
                    _toggleSpinner={this._toggleSpinner}
                    changeStep={this.changeStep}
                    _showAlertDialog={this.props._showAlertDialog}
                    _showConfirmDialog={this.props._showConfirmDialog}></AlbertsonLoadLetter>
                ) : null
              )}
          </div>
        </div>

      </div>;
    }
    // else if (currentStep == Step.step3) {
    //   complaintDetails = <div>
    //     <div className={[styles.vendorWarningBody].join(' ')}>
    //       <div className={styles.bodyContentHolder}></div>
    //     </div>

    //     <div className={styles.vendorWarningFooter}>
    //       <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
    //         <div><DefaultButton ariaLabel="submits the entire details" primary={true} onClick={this.submitDetails} text="Submit" /></div>
    //         <div>
    //           <ActionButton
    //             data-automation-id="test"
    //             iconProps={{ iconName: 'ChromeBack' }}
    //             onClick={this.previousClick}
    //             className={styles.spaceRight}
    //           >
    //             Previous
    //           </ActionButton>
    //           <DefaultButton ariaLabel="cancels the entire form" primary={true} onClick={this.resetDetails} text="Cancel" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>;
    // }
    const logo = `${this.props!.context!.pageContext!.site!.absoluteUrl}/siteassets/logo.png`;
    // ../../../../assets/images/logo.png
    let screenHeader = null;
    if (currentStep == Step.step1) {
      screenHeader = <div>
        <span className={'ms-font-xxl ms-fontWeight-regular ms-fontColor-themePrimary'}>Proposition 65 Vendor Portal : </span>
        <span className={'ms-font-xl ms-fontWeight-semibold'}>Contact &amp; Vendor</span>
      </div>;
    } else if (currentStep == Step.step2) {
      if (this._nextNavigationSource == 'enterItems') {
        screenHeader = <div>
          <span className={'ms-font-xxl ms-fontWeight-regular ms-fontColor-themePrimary'}>Proposition 65 Vendor Portal : </span>
          <span className={'ms-font-xl ms-fontWeight-semibold'}>Items</span>
        </div>;
      } else if (this._nextNavigationSource == 'loadLetter') {
        screenHeader = <div>
          <span className={'ms-font-xxl ms-fontWeight-regular ms-fontColor-themePrimary'}>Proposition 65 Letters : </span>
          <span className={'ms-font-xl ms-fontWeight-semibold'}>Upload</span>
        </div>;
      }
    }
    Logger.write(`Initialized ${appSettings.applicationName}: ${this.props.context.pageContext.web.absoluteUrl}`, LogLevel.Info);
    return (

      <div className={styles.albertsonVendorWarning}>
        <div className={[styles.dFlex, styles.justifyContentBetween, styles.vendorWarningHeader].join(' ')}>
          <div className={styles.logo}><img src={logo} /></div>
          {screenHeader}
          <div className={styles.actionItems}>
            <IconButton iconProps={{ iconName: 'Phone' }} className={[styles.vendorButton, styles.spaceRight].join(' ')} onClick={this.onContactClick} title="Contact Info" ariaLabel="Contact Info" />
            <IconButton iconProps={{ iconName: 'Unknown' }} className={[styles.vendorButton, styles.spaceRight].join(' ')} onClick={this.openHelpInfo} title="Help Info" ariaLabel="Help" />
            <IconButton iconProps={{ iconName: 'ErrorBadge' }} className={styles.vendorButton} title="Close" onClick={this.props.toggleMainModal} ariaLabel="Close" />
          </div>
        </div>

        <Modal
          titleAriaId="titleId"
          subtitleAriaId="subtitleId"
          isOpen={showContactModal}
          onDismiss={this.closeContactModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container"
        >
          <div className="ms-modalExample-header">
            <span id="titleId">Contact Us</span>
          </div>
          <div id="subtitleId" className="ms-modalExample-body">
            <TextField label="Subject *" value={contactModalData.subject} multiline={false} onChanged={this.changeContactModalData('subject')} />
            <TextField label="Body *" value={contactModalData.body} multiline={true} onChanged={this.changeContactModalData('body')} />
          </div>
          <div className="ms-modalExample-footer">
            <DefaultButton onClick={this.saveContactModalData} text="Ok" />
            <DefaultButton onClick={this.closeContactModal} text="Cancel" />
          </div>
        </Modal>
        <Modal
          titleAriaId="titleId"
          subtitleAriaId="subtitleId"
          isOpen={showHelpModal}
          onDismiss={this.closeHelpModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container"
        >
          <div className="ms-modalExample-header">
            <span id="titleId">Help</span>
          </div>
          <div id="subtitleId" className="ms-modalExample-body">
            <div>{helpInfo}</div>
          </div>
          <div className="ms-modalExample-footer">
            <DefaultButton onClick={this.closeHelpModal} text="Cancel" />
          </div>
        </Modal>
        {complaintDetails}
        {showSpinner ? <div className={styles.whiteOverlay}><Spinner size={SpinnerSize.large} /></div> : null}
      </div>
    );
  }
}