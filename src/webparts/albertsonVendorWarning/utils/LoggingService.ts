import { LogLevel, LogListener, LogEntry } from "sp-pnp-js/lib/utils/logging";
import pnp from 'sp-pnp-js';
import * as appSettings from 'appSettings';

export interface ILogData {
  FileName: string;
  MethodName: string;
  StackTrace: string;
}

export class LogData implements ILogData {
  constructor(
    public FileName: string = "",
    public MethodName: string = "",
    public StackTrace: string = ""
  ) { }
}

export interface ILogItem {
  ApplicationName: string;
  CodeFileName: string;
  MethodName: string;
  LoggedOn: Date;
  LoggedById: number;
  ErrorMessage: string;
  StackTrace: string;
}

export class LogItem implements ILogItem {
  constructor(
    public ApplicationName: string = "",
    public CodeFileName: string = "",
    public MethodName: string = "",
    public LoggedOn: Date = new Date(),
    public LoggedById: number = 0,
    public ErrorMessage: string = "",
    public StackTrace: string = ""
  ) { }
}

export default class LoggingService implements LogListener {
  private _applicationName: string;
  private _userId: number;
  private _writeLogFailed: boolean;

  constructor(applicationName: string, userId: number) {
    //Initialize
    try {
      this._writeLogFailed = false;
      this._applicationName = applicationName;
      this._userId = userId;
    } catch (err) {
      console.error(`Error initializing AdvancedLoggingService - ${err}`);
    }
  }

  public log(entry: LogEntry): void {
    try {
      //If the entry is an error then log it to my Application Log table.  All other logging is handled by the console listener
      if (entry.level == LogLevel.Error) {
        if (!this._writeLogFailed) {
          let stackArray = null;
          if (entry.data.StackTrace && entry.data.StackTrace.length > 0)
            stackArray = JSON.stringify(entry.data.StackTrace.split('\n').map((line) => { return line.trim(); }));
          let newLogItem: LogItem = new LogItem(this._applicationName, entry.data.FileName, entry.data.MethodName, new Date(), this._userId, entry.message, stackArray);
          pnp.sp.web.lists.getByTitle(appSettings.loggingListName).items.add({ ...newLogItem }).then(_ => {
            console.log('logged');
          }).catch(error => console.error(error));
        }
      }
    } catch (err) {
      //Assume writing to SharePoint list failed and stop continuous writing
      this._writeLogFailed = true;
      console.error(`Error logging error to SharePoint list ${appSettings.loggingListName} - ${err}`);
    }
    return;
  }

}