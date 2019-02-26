import * as React from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from './AlbertsonVendorWarning.module.scss';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import Modal from 'office-ui-fabric-react/lib/Modal';
import AlbertsonContactInfo from './AlbertsonContactInfo';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

const SecurityGroup = () => (
  <Icon iconName="SecurityGroup" className={styles.vendorportalLinkIcon} />
);

export type DialogContentProps = {
  type: DialogType,
  title?: string;
  subText?: string;
};

export type LandingPageState = {
  showMainModal: boolean;
  showAlertDialog: boolean;
  showConfirmDialog: boolean;
  alertDialogContentProps?: DialogContentProps;
  confirmDialogContentProps?: DialogContentProps;
  onConfirmClick?: Function;
};

export default class AlbertsonLandingPage extends React.Component<any, LandingPageState>{
  constructor(props) {
    super(props);
    this.state = {
      showMainModal: false,
      showAlertDialog: false,
      showConfirmDialog: false
    };
  }
  private toggleMainModal = () => {
    const { showMainModal } = this.state;
    this.setState({
      showMainModal: !showMainModal
    });
  }
  private _showAlertDialog = (_contentProps: DialogContentProps) => {
    this.setState({
      showAlertDialog: true,
      alertDialogContentProps: _contentProps
    });
  }
  private _showConfirmDialog = (_contentProps: DialogContentProps, callback: Function) => {
    this.setState({
      showConfirmDialog: true,
      confirmDialogContentProps: _contentProps,
      onConfirmClick: callback
    });
  }
  private _closeAlertDialog = () => {
    this.setState({
      showAlertDialog: false,
      alertDialogContentProps: null
    });
  }
  private _cancelConfirmDialog = () => {
    this.setState({
      showConfirmDialog: false,
      confirmDialogContentProps: null,
      onConfirmClick: null
    });
  }
  private _acceptConfirmDialog = () => {
    if (this.state.onConfirmClick) {
      this.state.onConfirmClick();
    }
    this._cancelConfirmDialog();
  }
  public render() {
    const { context } = this.props;
    const { showMainModal, showAlertDialog, showConfirmDialog, alertDialogContentProps, confirmDialogContentProps } = this.state;
    return (
      <div className={styles.albertsonVendorWarning}>
        <div className={styles.vendorPortalLink}>
          <SecurityGroup />
          <div className={styles.linkText}>
            Proposition 65 Vendor portal: <span>contact &amp; Vendor</span>
          </div>
          <div>
            <ActionButton onClick={this.toggleMainModal} iconProps={{ iconName: 'NavigateBackMirrored' }} >CLICK HERE TO ADD ITEMS OR LOAD LETTER</ActionButton>
          </div>
        </div>
        <Modal
          isOpen={showMainModal}
          onDismiss={this.toggleMainModal}
          isBlocking={false}
          containerClassName="ms-modalExample-container fullwidthModal"
        >
          {showMainModal ? <AlbertsonContactInfo
            context={context}
            toggleMainModal={this.toggleMainModal}
            _showAlertDialog={this._showAlertDialog}
            _showConfirmDialog={this._showConfirmDialog}></AlbertsonContactInfo> : null}
        </Modal>
        <Dialog
          hidden={!showAlertDialog}
          onDismiss={this._closeAlertDialog}
          dialogContentProps={alertDialogContentProps}
          modalProps={{
            isBlocking: true,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <DialogFooter>
            <DefaultButton onClick={this._closeAlertDialog} text="Ok" />
          </DialogFooter>
        </Dialog>

        <Dialog
          hidden={!showConfirmDialog}
          onDismiss={this._cancelConfirmDialog}
          dialogContentProps={confirmDialogContentProps}
          modalProps={{
            isBlocking: true,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <DialogFooter>
            <PrimaryButton onClick={this._acceptConfirmDialog} text="Ok" />
            <DefaultButton onClick={this._cancelConfirmDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }
}