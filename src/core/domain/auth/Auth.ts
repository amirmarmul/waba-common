import TokenGuard from './TokenGuard';
import UserProvider from './UserProvider';

class Auth {
  private static _instance: Auth;
  private _provider: UserProvider;
  private _request: any;

  private constructor() {
    //
  }

  static getInstance() {
    if (!this._instance){
      this._instance = new Auth();
    }

    return this._instance;
  }

  static guard() {
    return Auth.getInstance()
      .tokenGuard();
  }

  setUserProvider(provider: UserProvider) {
    this._provider = provider;
    return this;
  }

  setRequest(request: any) {
    this._request = request;
    return this;
  }

  private tokenGuard() {
    return new TokenGuard(
      this._provider,
      this._request,
    );
  }
}

export default Auth;
