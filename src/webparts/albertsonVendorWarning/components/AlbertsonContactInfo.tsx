import * as React from 'react';
import { IVendorComplain, IContactInfo, IVendorInfo, Step, IValidationError, IContactModalData } from '../interfaces/AlbertsonDomainInterfaces';
import AlbertsonVendorWarning from './AlbertsonVendorWarning';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { debounce } from "@microsoft/sp-lodash-subset";
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Panel } from 'office-ui-fabric-react/lib/Panel';

export interface IVendorState {
  contactInfo: IContactInfo;
  vendInfo: IVendorInfo;
  complaintInfo: IVendorComplain[];
  currentStep: Step;
  contactUsInfo: IContactModalData;
  contactModalData: IContactModalData;
  showContactModal: boolean;
  showHelpModal: boolean;
  helpInfo: string;
}

export default class AlbertsonContactInfo extends React.Component<any, IVendorState>{
  private _debounceContactChange;
  private _debounceVendChange;
  private _debouceChangeContactModalData;
  constructor(props) {
    super(props);
    this.state = {
      contactInfo: {},
      vendInfo: {},
      complaintInfo: [],
      currentStep: Step.step1,
      contactUsInfo: {},
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
      `
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
    };
    this._debouceChangeContactModalData = debounce(this._debouceChangeContactModalData, 200);
    this._debounceContactChange = debounce(this._debounceContactChange, 200);
    this._debounceVendChange = debounce(this._debounceVendChange, 200);
  }
  private setItems = (items): void => {
    if (items) {
      this.setState({
        complaintInfo: items.slice()
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
  private closeHelpModal = () => {
    this.setState({
      showHelpModal: false
    });
  }
  private saveContactModalData = () => {
    const result: IValidationError = { validationMessege: '', hasError: false };
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
    const result = { validationMessege: null, hasError: false };
    const { currentStep } = this.state;
    if (currentStep == Step.step1) {
      const { contactInfo, vendInfo } = this.state;
      if (!contactInfo.firstname || !contactInfo.lastname || !contactInfo.email || !contactInfo.employer) {
        result.validationMessege = "Invalid contact information";
        result.hasError = true;
      } else if (!vendInfo.vendName || !vendInfo.vendNum) {
        result.validationMessege = "Invalid vender information";
        result.hasError = true;
      }
    }
    return result;
  }
  private onNextClick = () => {
    const result: IValidationError = this.validateOnNext();
    if (result.hasError) {
      alert(result.validationMessege);
    } else {
      this.changeStep(Step.step2);
    }
  }
  private submitDetails = () => {
    const { contactInfo, vendInfo, complaintInfo, contactUsInfo, helpInfo } = this.state;
    console.log(contactInfo);
    console.log(vendInfo);
    console.log(complaintInfo);
    console.log(contactUsInfo);
    console.log(helpInfo);
    this.resetDetails();
  }
  private previousClick = () => {
    this.changeStep(Step.step2);
  }
  private resetDetails = () => {
    // reset entire form
    this.setState({
      contactInfo: {},
      vendInfo: {},
      complaintInfo: [],
      currentStep: Step.step1
    });
    this.changeStep(Step.step1);
    console.log('reset');
  }
  public render() {
    const { contactInfo, vendInfo, complaintInfo, currentStep, showContactModal, showHelpModal, contactModalData, helpInfo } = this.state;
    let complaintDetails = null;
    let stepHeader = null;
    if (currentStep == Step.step1) {
      stepHeader = <h3>Contact and Vender</h3>;
      complaintDetails = <React.Fragment>
        <div className="floatLeft">
          <p>Please enter your contact information</p>
          <form>
            <div>
              <TextField label="Name *" value={contactInfo.firstname} onChanged={this.contactChange('firstname')} />
              <TextField value={contactInfo.lastname} onChanged={this.contactChange('lastname')}></TextField>
              <TextField label="Email *" value={contactInfo.email} onChanged={this.contactChange('email')} />
              <TextField label="Phone *" value={contactInfo.phone} onChanged={this.contactChange('phone')} />
            </div>
            <div>
              <p>Please enter the company you work for if different from the supplier</p>
              <TextField label="Company *" value={contactInfo.employer} onChanged={this.contactChange('employer')} />
            </div>
          </form>
        </div>
        <div className="floatRight">
          <p>Please enter information about the supplier you are entering data for</p>
          <form>
            <TextField label="Vend Num *" value={vendInfo.vendNum} onChanged={this.vendChange('vendNum')} />
            <TextField label="Vend Name *" value={vendInfo.vendName} onChanged={this.vendChange('vendName')}></TextField>
          </form>
        </div>
        <div className="floatRight">
          <DefaultButton secondaryText="navigates form to next page" onClick={this.onNextClick} text="Next" />
        </div>
      </React.Fragment>;
    } else if (currentStep == Step.step2) {
      stepHeader = <h3>Items</h3>;
      complaintDetails = <React.Fragment>
        <AlbertsonVendorWarning setItems={this.setItems} items={complaintInfo} changeStep={this.changeStep}></AlbertsonVendorWarning>
      </React.Fragment>;
    } else if (currentStep == Step.step3) {
      complaintDetails = <React.Fragment>
        <DefaultButton secondaryText="submits the entire details" onClick={this.submitDetails} text="Submit" />
        <DefaultButton secondaryText="previous page" onClick={this.previousClick} text="Previous" />
        <DefaultButton secondaryText="cancels the entire form" onClick={this.resetDetails} text="Cancel" />
      </React.Fragment>;
    }
    return (
      <div>
        <h3>Prop 65 Contract and Vendor</h3>
        <DefaultButton secondaryText="contact info" onClick={this.onContactClick} text="Contact Us" />
        <DefaultButton secondaryText="help info" onClick={this.openHelpInfo} text="Help" />
        {currentStep == Step.step2 ? (
          <div>
            <TextField label="Vend Name" value={vendInfo.vendName} readOnly />
            <TextField label="Vend Num" value={vendInfo.vendNum} readOnly></TextField>
          </div>
        ) : null}
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
    );
  }
}