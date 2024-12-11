/**
 * Interface representing a repository for database operations.
 */
export default interface DatabaseRepository {
  /**
   * Save an entity to the database.
   * @param entity - The entity to be saved.
   * @returns A promise that resolves to the saved entity.
   */
  save(entity: any): Promise<any>;

  /**
   * Retrieve an entity from the database by its ID.
   * @param id - The ID of the entity to be retrieved.
   * @returns A promise that resolves to the retrieved entity.
   */
  show(id: string): Promise<any>;

  /**
   * List entities from the database based on the provided request.
   * @param req - The request object containing query pagination parameters.
   * @returns A promise that resolves to the list of entities.
   */
  list(req: any): Promise<any>;

  /**
   * Update an entity in the database.
   * @param entity - The entity with updated values.
   * @returns A promise that resolves to the updated entity.
   */
  update(entity: any): Promise<any>;

  /**
   * Delete an entity from the database.
   * @param id - The ID of the entity to be deleted.
   * @returns A promise that resolves to the result of the deletion operation.
   */
  delete(id: string): Promise<any>;
}
