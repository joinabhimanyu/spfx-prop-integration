import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IAttachmentProps, IAttachment, Step } from '../interfaces/AlbertsonDomainInterfaces';
import { DefaultButton } from 'office-ui-fabric-react/lib/components/Button';

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
  private async uploadFile(buffer: any, dateTime: string): Promise<any> {
    // call api for file upload
    try {
      const { userid, name, email, phone, company, vendNum, vendName } = this.props;
      return Promise.resolve({ serverRelativeUrl: 'http://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', err: null });
    } catch (error) {
      return Promise.resolve({ serverRelativeUrl: '', err: error });
    }
  }
  private loadLetter = async () => {
    const { files, file } = this.state;
    const { vendName } = this.props;
    const dateTime = new Date().toLocaleDateString();
    if (file) {
      const buffer = await this.getFileBuffer(file);
      if (!buffer.err) {
        const result = await this.uploadFile(buffer.data, dateTime);
        if (!result.err) {
          let maxKey = 0;
          if (files.length > 0) {
            files.map((f) => {
              if (f.key > maxKey) {
                maxKey = f.key;
              }
            });
            maxKey += 1;
          }
          files.push({
            key: maxKey,
            name: buffer.name,
            uploadTimeStamp: dateTime,
            serverRelativeUrl: result.serverRelativeUrl
          });
          this._fileRef.value = '';
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
          });
        }
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
        alert('invalid file');
      }
    } else {
      alert('no file selected');
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
      <div>
        <TextField label="Choose a file: " placeholder="File Name" value={file ? file!.name : ''} />
        <input type="file" id={`addAttachment`}
          ref={(evt) => this._fileRef = evt}
          accept="application/pdf"
          onChange={this._changeFileSelection} />
        <DefaultButton onClick={this.loadLetter} text="Load" />
        {showDetailList ? (
          files && files.length > 0 ? (
            <div>
              <h3>Documents loaded: </h3>
              <DetailsList
                items={files}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionPreservedOnEmptyClick={false}
                selectionMode={SelectionMode.none}
                compact={isCompactMode}
                isHeaderVisible={true}
                // onItemInvoked={this._onItemInvoked}
                onRenderItemColumn={this._onRenderColumn}
              />
            </div>
          ) : (
              <h3>No documents loaded</h3>
            )
        ) : (
            null
          )}
        <DefaultButton onClick={this._doneClick} text="Done" />
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
            const label = ` has been successfully uploaded for ${vendName}`;
            return (
              <div><a href={item.serverRelativeUrl} target="blank">{value}</a><span>{label}</span></div>
            );
          default:
            break;
        }
      }
    }
  }
  // private _onItemInvoked = (item: IAttachment): void => {
  //   console.log(item);
  // }
}