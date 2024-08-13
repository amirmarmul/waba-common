import { Request, Response } from 'express';
import { Service } from '@/core/infrastructure/Container';
import { Controller } from '@/core/infrastructure/Controller';

@Service()
export default class DetailController extends Controller {

  registerRoutes(): void {
    this.router.get('/', this.show.bind(this));
  }

  async show(req: Request, res: Response) {
    return this.ok(res, {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version
    });
  }
}
