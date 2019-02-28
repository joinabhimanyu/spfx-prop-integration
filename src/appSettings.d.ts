declare interface IAppSettings {
  vendorInfoListName: string;
  vendorItemsListName: string;
  adminEmailAddress: string;
  loggingListName: string;
  applicationName: string;
}

declare module 'appSettings' {
  const appSettings: IAppSettings;
  export = appSettings;
}