export interface IProductModule {
  name: string;
  key: string;
  description: string;
}
export interface IProduct {
  _id: string;
  name: string;
  short_name: string;
  does_have_license: boolean;
  description: string;
  modules: IProductModule[];
  reports: IProductModule[];
}
