import WrongCredentialsError from '@/core/errors/WrongCredentialsError';
import Authenticable from './Authenticable';
import Guard from './Guard';
import UserProvider from './UserProvider';

export class TokenGuard implements Guard {
  /**
   * The request instance.
   */
  private _req: any;

  /**
   * The user provider implementation.
   */
  private _provider: UserProvider;

  /**
   * The currently authenticated user.
   */
  private _user: Authenticable;

  /**
   * Create a new authtentication guard.
   */
  constructor(provider: UserProvider, req: any) {
    this._provider = provider;
    this._req = req;
  }

  /**
   * Determine if the current user is authenticated. If not, throw an error.
   */
  async authenticate() {
    const user = await this.user();
    if (user) {
      return user;
    }

    throw new WrongCredentialsError();
  }

  async check() {
    return !!(await this.user());
  }

  async guest() {
    return !(await this.check);
  }

  async setUser(user: Authenticable) {
    this._user = user;
  }

  async setRequest(req: any) {
    this._req = req;
  }

  async user() {
    if (this._user) {
      return this._user;
    }

    let user = null;
    let token = this.getTokenFromRequest();

    if (token) {
      user = await this._provider.getByToken(token);
    }

    return this._user = user!;
  }

  private getTokenFromRequest() {
    let token = this._req.query['api_token'];

    if (!token) {
      token = this._req.body['api_token'];
    }

    if (!token && this._req.header('API-Token')) {
      token = this._req.header('API-Token');
    }

    if (!token && this._req.header('Authorization')) {
      const authorization = this._req.header('Authorization');
      let [_, bearerToken] = authorization.split(' ');
      token = bearerToken;
    }

    return token;
  }
}

export default TokenGuard;
