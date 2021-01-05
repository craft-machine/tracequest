export default interface Hook {
  method: string;
  event: string;
  getMeta?(args: IArguments, scope: any): any;
}