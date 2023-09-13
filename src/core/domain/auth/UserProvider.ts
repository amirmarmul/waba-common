import Authenticable from './Authenticable';

export interface UserProvider {
  /**
   * Get user by their unique identifier.
   */
  getById(id: any): Promise<Authenticable | null>;

  /**
   * Get user by their api token.
   */
  getByToken(token: string): Promise<Authenticable | null>;

  /**
   * Get user by the given credentials.
   */
  getByCredentials(credentials: object): Promise<Authenticable | null>;
}

export default UserProvider;
