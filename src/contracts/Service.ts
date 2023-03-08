export interface Service {
  list(req: any): any | Promise<any>;
  store(req: any): any | Promise<any>;
  show(id: any): any | Promise<any>;
  update(id: any, req: any): any | Promise<any>;
  destroy(id: any, req: any): any | Promise<any>;
}

export default Service;
