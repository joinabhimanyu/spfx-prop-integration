import * as React from 'react';
import pnp, { sp, Web, ItemAddResult } from 'sp-pnp-js';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IAttachmentProps, IAttachment, Step } from '../interfaces/AlbertsonDomainInterfaces';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import styles from './AlbertsonVendorWarning.module.scss';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import Dialog, { DialogType } from 'office-ui-fabric-react/lib/Dialog';

export interface IAttachmentState {
  columns: IColumn[];
  files?: IAttachment[];
  isCompactMode: boolean;
  file?: File;
  showDetailList: boolean;
}

export default class AlbertsonLoadLetter extends React.Component<IAttachmentProps, IAttachmentState>{
  private _fileRef;
  constructor(props) {
    super(props);
    const _columns: IColumn[] = [
      {
        key: 'icon',
        name: '',
        fieldName: '',
        minWidth: 20,
        maxWidth: 20,
        isResizable: true,
        data: 'string',
        isPadded: false,
      },
      {
        key: 'name',
        name: '',
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 120,
        isResizable: true,
        data: 'string',
        isPadded: true
      }
    ];
    this.state = {
      columns: _columns,
      isCompactMode: false,
      files: [],
      showDetailList: true
    };
  }
  public componentDidMount() {
    const { files } = this.props;
    this.setState({
      files: files.slice()
    });
  }
  private validateFileTypes = (file: File): boolean => {
    if (file.type == 'application/pdf') {
      return true;
    }
    return false;
  }
  private generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  private sendMail = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      pnp.sp.web.getFolderByServerRelativeUrl("Shared Documents").get().then(async (resp) => {
        const p1 = await pnp.sp.site.get();
        const parent1 = p1.Url.split("/sites")[0];
        const url = resp.ServerRelativeUrl;
        setTimeout(() => {
          resolve({ error: null });
        }, 10);
      });
    });
  }
  private uploadLetter = (file: any, dateTime: string) => {
    const payload = { Title: this.generateGUID() };
    // const { data, name } = buffer;
    const files = [file];
    let uploadedItem = null;
    let serverRelativeUrl = null;
    let SharedDocumentsUrl = null;
    let FileUrl = null;
    return pnp.sp.web.getFolderByServerRelativeUrl('Shared Documents')
      .files.add(files[0].name, files[0], true)
      .then(({ file: filei }) => {
        return filei.getItem();
      })
      .then(item => {
        uploadedItem = item;
        return pnp.sp.web.getFolderByServerRelativeUrl("Shared Documents").files.getByName(files[0].name).get();
      })
      .then(item => {
        serverRelativeUrl = item.ServerRelativeUrl || '';
        return uploadedItem.update(payload);
      })
      .then(_ => this.sendMail())
      .then(r => !r.error ? ({ serverRelativeUrl: serverRelativeUrl, error: null }) : ({ serverRelativeUrl: null, error: r.error }))
      .catch(error => ({ serverRelativeUrl: null, error: error }));
  }
  private loadLetter = async () => {
    const { files, file } = this.state;
    const dateTime = new Date().toLocaleDateString();
    if (file) {
      const filter = files.filter(x => x.name == file.name);
      this.props._toggleSpinner();
      const result = await this.uploadLetter(file, dateTime);
      if (!result.error) {
        let maxKey = 0;
        if (files.length > 0) {
          files.map((f) => {
            if (f.key > maxKey) {
              maxKey = f.key;
            }
          });
          maxKey += 1;
        }
        if (filter.length == 0) {
          files.push({
            key: maxKey,
            name: file.name,
            uploadTimeStamp: dateTime,
            serverRelativeUrl: result.serverRelativeUrl
          });
        } else {
          filter[0].name = file.name;
          filter[0].uploadTimeStamp = dateTime;
          filter[0].serverRelativeUrl = result.serverRelativeUrl;
        }
        this._fileRef.reset();
        this.setState({
          files,
          file: null,
          showDetailList: false
        });
        const self = this;
        setTimeout(() => {
          self.setState({
            showDetailList: true
          });
          this.props._toggleSpinner();
          this.props._showAlertDialog({ type: DialogType.normal, title: 'Upload letter', subText: 'File uploaded successfully' });
        });
      } else {
        this.props._toggleSpinner();
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Error', subText: result.error });
      }
    }
  }
  private _changeFileSelection = (e: any) => {
    if (e.currentTarget && e.currentTarget.files && e.currentTarget.files.length > 0) {
      const pFile = e.currentTarget.files[0];
      if (this.validateFileTypes(pFile)) {
        this.setState({
          file: pFile
        });
      } else {
        this.props._showAlertDialog({ type: DialogType.normal, title: 'Invalid', subText: 'Invalid file' });
      }
    } else {
      this.props._showAlertDialog({ type: DialogType.normal, title: 'No file', subText: 'No file selected' });
    }
  }
  private _doneClick = () => {
    const { files } = this.state;
    if (this.props.setFiles && typeof this.props.setFiles == 'function') {
      this.props.setFiles(files);
    }
    if (this.props.changeStep) {
      this.props.changeStep(Step.step1);
    }

  }
  private getFileBuffer(file: any): Promise<any> {

    return new Promise((resolve, reject) => {
      let reader: any = new FileReader();
      reader.onload = (e: any) => {
        resolve({ data: e.target.result, name: file.name, err: null });
      };
      reader.onerror = (e: any) => {
        resolve({ data: null, name: null, err: e.toString() });
      };
      reader.readAsArrayBuffer(file);
    });
  }
  public render() {
    const { columns, isCompactMode, files, file, showDetailList } = this.state;
    return (

      <div className={[styles.dFlex, styles.dColumn, styles.flexGrowOne].join(' ')}>
        <div className={[styles.dFlex, styles.flexGrowOne, styles.dColumn].join(' ')}>
          {/* <TextField label="Choose a file: " placeholder="File Name" className={styles.marginBottom15} readOnly={true} value={file ? file!.name : ''} /> */}
          <div className={styles.dFlex}>
            <form ref={(evt) => this._fileRef = evt}>
              <input type="file" id={`addAttachment`}
                accept="application/pdf"
                onChange={this._changeFileSelection}
                className={[styles.spaceRight, styles.height30].join(' ')} />
              <DefaultButton onClick={this.loadLetter} text="Load" />

            </form>
          </div>
          {showDetailList ? (
            files && files.length > 0 ? (
              <div className={[styles.dFlex, styles.flexGrowOne, styles.dColumn].join(' ')}>
                <h3>Documents loaded: </h3>
                <div className={styles.vendorWarningBodyGrid}>
                  <DetailsList
                    items={files}
                    columns={columns}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionPreservedOnEmptyClick={false}
                    selectionMode={SelectionMode.none}
                    compact={isCompactMode}
                    isHeaderVisible={false}
                    onRenderItemColumn={this._onRenderColumn}
                  />
                </div>
              </div>
            ) : (
                <h3>No documents loaded</h3>
              )
          ) : (
              null
            )}
        </div>
        <div className={[styles.vendorWarningFooter, styles.minusMarginForFooterReset].join(' ')}>

          <div className={[styles.dFlex, styles.justifyContentBetween, styles.footerPaddingAround].join(' ')}>
            <div></div>
            <div>
              <DefaultButton onClick={this._doneClick} text="Done" />
            </div>
          </div>
        </div>
      </div>

    );
  }
  private _onRenderColumn = (item: IAttachment, index: number, column: IColumn) => {
    let value = null;
    const { vendName } = this.props;
    if (item && column) {
      if (column.fieldName) {
        value = item[column.fieldName];
        switch (column.fieldName) {
          case 'name':
            const label = ` has been successfully uploaded for ${vendName} at ${item.uploadTimeStamp}`;
            return (
              <div><a href={item.serverRelativeUrl} target="blank">{value}</a><span>{label}</span></div>
            );
          default:
            break;
        }
      } else if (column.key) {
        if (column.key == 'icon') {
          return (
            <Icon iconName="PageSolid" className="ms-IconExample" />
          );
        }
      }
    }
  }
  // private _onItemInvoked = (item: IAttachment): void => {
  //   console.log(item);
  // }
}