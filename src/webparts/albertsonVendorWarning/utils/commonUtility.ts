import * as appSettings from 'appSettings';
import pnp, { sp, Web, ItemAddResult, EmailProperties, LogLevel, LogEntry, Logger } from 'sp-pnp-js';
import { ILogData } from './LoggingService';

export const sendMail = (subject: string, body: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const emailProps: EmailProperties = {
        To: [appSettings.adminEmailAddress],
        Subject: subject,
        Body: body,
      };
      pnp.sp.utility.getCurrentUserEmailAddresses().then((fromAddress: any) => {
        emailProps.From = fromAddress.GetCurrentUserEmailAddresses;
        pnp.sp.utility.sendEmail(emailProps).then(_ => {
          resolve(true);
        }).catch(err => {
          logError(err, LogLevel.Error, "sendMail");
          reject(err);
        });
      }).catch(err => {
        logError(err, LogLevel.Error, "sendMail");
        reject(err);
      });
    } catch (err) {
      logError(err, LogLevel.Error, "sendMail");
      reject(err);
    }
  });
};

export const _onFormatDate = (date: Date): string => {
  if (date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getFullYear() % 100);
  } else {
    return '';
  }
};

export const logError = (error, level: LogLevel, methodName: string) => {
  const { message, name, description, number, fileName, lineNumber, stack } = error;
  let data: ILogData = { FileName: fileName, MethodName: methodName, StackTrace: stack };
  let logEntry: LogEntry = { message: message, level: level, data: data };
  Logger.log(logEntry);
};