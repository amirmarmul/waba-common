import Authenticable from './Authenticable';

interface Guard {
  /**
   * Determine if the current user is authenticated.
   */
  check(): Promise<boolean>;

  /**
   * Determine if the current user is a guest.
   */
  guest(): Promise<boolean>;

  /**
   * Set the current user.
   */
  setUser(user: Authenticable): Promise<void>;

  /**
   * Get the currently authenticated user.
   */
  user(): Promise<Authenticable|null>;
}

export default Guard;
