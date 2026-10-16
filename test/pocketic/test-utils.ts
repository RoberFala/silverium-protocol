/** Register through the same public API as sign-in, without assigning or weakening roles.
 * Use only when the app's generated declarations expose _initialize_access_control.
 * Give each identity its own actor when tests may run concurrently.
 */
export async function registerCaller<
  Identity,
  Service extends {
    setIdentity(identity: Identity): void;
    _initialize_access_control(): Promise<unknown>;
  },
>(actor: Service, identity: Identity): Promise<Service> {
  actor.setIdentity(identity);
  await actor._initialize_access_control();
  return actor;
}
