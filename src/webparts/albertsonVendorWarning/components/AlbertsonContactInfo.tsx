import * as React from 'react';
import { IVendorComplain, IContactInfo, IVendorInfo, Step, IValidationError, IValidationFields, IContactModalData, IAttachment } from '../interfaces/AlbertsonDomainInterfaces';
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

export interface IVendorState {
  contactInfo: IContactInfo;
  vendInfo: IVendorInfo;
  complaintInfo: IVendorComplain[];
  files?: IAttachment[];
  currentStep: Step;
  contactUsInfo: IContactModalData;
  contactModalData: IContactModalData;
  showContactModal: boolean;
  showMainModal: boolean;
  showHelpModal: boolean;
  helpInfo: string;
  validationError?: IValidationError;
}

const initialState: IVendorState = {
  contactInfo: {},
  vendInfo: {},
  complaintInfo: [],
  files: [],
  currentStep: Step.step1,
  contactUsInfo: {},
  contactModalData: {},
  showContactModal: false,
  showMainModal: true,
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
  validationError: { hasError: true }
};

export default class AlbertsonContactInfo extends React.Component<any, IVendorState>{
  private _debounceContactChange;
  private _debounceVendChange;
  private _debouceChangeContactModalData;
  private _nextNavigationSource?: string;
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
          // ...this.state,
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
  public componentDidMount(): void {
    const result: IValidationError = this.validateOnNext();
    this.setState({
      validationError: result
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
    let { contactModalData, contactUsInfo } = this.state;
    const { subject, body } = contactUsInfo;
    contactModalData = {};
    if (subject && body) {
      contactModalData.subject = subject;
      contactModalData.body = body;
    }
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

  private closeMainModal = () => {
    this.setState({
      showMainModal: false
    });
  }
  private closeHelpModal = () => {
    this.setState({
      showHelpModal: false
    });
  }
  private saveContactModalData = () => {
    const result = { validationMessege: '', hasError: false };
    const { contactModalData } = this.state;
    if (!contactModalData.subject || !contactModalData.body) {
      result.validationMessege = "Invalid contact info";
      result.hasError = true;
    }
    if (result.hasError) {
      alert(result.validationMessege);
    } else {
      this.setState({
        contactUsInfo: {
          subject: contactModalData.subject,
          body: contactModalData.body
        },
        showContactModal: false
      });
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
      !contactInfo.firstname ? (function () {
        result.errors.push({
          field: 'firstname',
          errorMessage: 'Firstname cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !contactInfo.lastname ? (function () {
        result.errors.push({
          field: 'lastname',
          errorMessage: 'Lastname cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !contactInfo.email ? (function () {
        result.errors.push({
          field: 'email',
          errorMessage: 'Email cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !contactInfo.phone ? (function () {
        result.errors.push({
          field: 'phone',
          errorMessage: 'Phone cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !contactInfo.employer ? (function () {
        result.errors.push({
          field: 'employer',
          errorMessage: 'Company cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !vendInfo.vendName ? (function () {
        result.errors.push({
          field: 'vendName',
          errorMessage: 'Supplier name cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
      !vendInfo.vendNum ? (function () {
        result.errors.push({
          field: 'vendNum',
          errorMessage: 'Supplier number cannot be blank'
        });
        result.hasError = true;
      }()) : (function () {
      }());
    }
    return result;
  }
  private onNextClick = (navSource: string) => () => {
    navSource ? this._nextNavigationSource = navSource : this._nextNavigationSource = null;
    this.changeStep(Step.step2);
  }
  private submitDetails = () => {
    const { contactInfo, vendInfo, complaintInfo, files, contactUsInfo, helpInfo } = this.state;
    console.log(contactInfo);
    console.log(vendInfo);
    console.log(complaintInfo);
    console.log(files);
    console.log(contactUsInfo);
    console.log(helpInfo);
    this.resetDetails();
  }
  private previousClick = () => {
    this.changeStep(Step.step2);
  }
  private resetDetails = () => {
    this.setState({
      ...initialState
    });
    this.changeStep(Step.step1);
  }
  public render() {
    const { contactInfo, vendInfo, complaintInfo, currentStep, showContactModal, showHelpModal, contactModalData, helpInfo, showMainModal,
      files, validationError } = this.state;
    let complaintDetails = null;
    let stepHeader = null;
    if (currentStep == Step.step1) {
      stepHeader = <h3>Contact and Vender</h3>;
      complaintDetails = <div>
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
                          <TextField value={contactInfo.firstname} onChanged={this.contactChange('firstname')} />
                          <span className={'ms-fontColor-neutralDark'}>First Name</span>
                        </div>
                        <div className={styles.halfWidthDiv}>
                          <TextField value={contactInfo.lastname} onChanged={this.contactChange('lastname')} />
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
                      <TextField value={contactInfo.email} onChanged={this.contactChange('email')} />
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Phone</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <TextField value={contactInfo.phone} onChanged={this.contactChange('phone')} />
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={[styles.title, styles.spaceBottom, styles.fullWidthDiv, 'ms-font-l'].join(' ')}>Please enter the company you work for if different from the supplier</div>
                    <div>
                      <div className={styles.oneThirdWidthDiv}>
                        <Label required={true}>Company</Label>
                      </div>
                      <div className={styles.twoThirdWidthDiv}>
                        <TextField value={contactInfo.employer} onChanged={this.contactChange('employer')} />
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
                        <TextField value={vendInfo.vendNum} onChanged={this.vendChange('vendNum')} />
                      </div>
                    </div>
                  </div>
                  <div className={[styles.row, styles.spaceBottom].join(' ')}>
                    <div className={styles.oneThirdWidthDiv}>
                      <Label required={true}>Vendor Name</Label>
                    </div>
                    <div className={styles.twoThirdWidthDiv}>
                      <TextField value={vendInfo.vendName} onChanged={this.vendChange('vendName')}></TextField>
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
              <DefaultButton ariaLabel="Load Letter" disabled={validationError!.hasError} className={styles.spaceRight} primary={true} text="Upload Proposition 65 Letters" onClick={this.onNextClick('loadLetter')} />
              <DefaultButton ariaLabel="Enter Prop 65 Item Data" disabled={validationError!.hasError} onClick={this.onNextClick('enterItems')} primary={true} text="Enter Items" />
            </div>
          </div>

        </div>
      </div>;
    } else if (currentStep == Step.step2) {
      stepHeader = <h3>Items</h3>;
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
              <AlbertsonVendorWarning setItems={this.setItems} items={complaintInfo} changeStep={this.changeStep}></AlbertsonVendorWarning>
            ) : (
                this._nextNavigationSource == 'loadLetter' ? (
                  <AlbertsonLoadLetter userid={'0'}
                    name={`${contactInfo.firstname} ${contactInfo.lastname}`}
                    email={contactInfo.email}
                    phone={contactInfo.phone}
                    company={contactInfo.employer}
                    vendNum={vendInfo.vendNum}
                    vendName={vendInfo.vendName}
                    files={files}
                    setFiles={this.setFiles}
                    changeStep={this.changeStep}></AlbertsonLoadLetter>
                ) : null
              )}
          </div>
        </div>
      </div>;
    } else if (currentStep == Step.step3) {
      complaintDetails = <div>
        <div className={[styles.vendorWarningBody].join(' ')}>
          <div className={styles.bodyContentHolder}></div>
        </div>

        <div className={styles.vendorWarningFooter}>
          <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
            <div><DefaultButton ariaLabel="submits the entire details" primary={true} onClick={this.submitDetails} text="Submit" /></div>
            <div>
              <ActionButton
                data-automation-id="test"
                iconProps={{ iconName: 'ChromeBack' }}
                onClick={this.previousClick}
                className={styles.spaceRight}
              >
                Previous
        </ActionButton>
              <DefaultButton ariaLabel="cancels the entire form" primary={true} onClick={this.resetDetails} text="Cancel" />
            </div>
          </div>
        </div>
      </div>;
    }
    return (
      <Modal
        isOpen={showMainModal}
        onDismiss={this.closeMainModal}
        isBlocking={false}
        containerClassName="ms-modalExample-container fullwidthModal"
      >
        <div className={styles.albertsonVendorWarning}>
          <div className={[styles.dFlex, styles.justifyContentBetween, styles.vendorWarningHeader].join(' ')}>
            <div className={styles.logo}><img src="../../../../assets/images/logo.png" /></div>
            <div>
              <span className={'ms-font-xxl ms-fontWeight-regular ms-fontColor-themePrimary'}>Proposition 65 Vendor Portal : </span>
              <span className={'ms-font-xl ms-fontWeight-semibold'}>Contact &amp; Vendor</span>
            </div>
            <div className={styles.actionItems}>
              <IconButton iconProps={{ iconName: 'Phone' }} className={[styles.vendorButton, styles.spaceRight].join(' ')} onClick={this.onContactClick} title="Contact Info" ariaLabel="Contact Info" />
              <IconButton iconProps={{ iconName: 'Unknown' }} className={[styles.vendorButton, styles.spaceRight].join(' ')} onClick={this.openHelpInfo} title="Help Info" ariaLabel="Help" />
              <IconButton iconProps={{ iconName: 'ErrorBadge' }} className={styles.vendorButton} title="Close" onClick={this.closeMainModal} ariaLabel="Close" />
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
            <div id="subtitleId" className="ms-modalExample-body" style={{ height: '300px', width: '300px', overflow: 'auto' }}>
              <div>{helpInfo}</div>
              <DefaultButton onClick={this.closeHelpModal} text="Cancel" />
            </div>
          </Modal>
          {complaintDetails}
        </div>
      </Modal>
    );
  }
}