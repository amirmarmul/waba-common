export interface UseCase<Request, Response> {
  execute(req?: Request): Response;
}
