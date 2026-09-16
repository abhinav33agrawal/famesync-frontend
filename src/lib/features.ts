/* Front-of-house feature switches.
 *
 * These are build-time constants, not environment variables: they gate what
 * the marketing site and app *offer*, which is a code decision reviewed in a
 * PR, not something that should differ silently between deploys.
 */

/** Instagram sign-in and the profile "connect Instagram" card.
 *
 *  Off until the Meta app clears App Review. The backend side is finished --
 *  /api/auth/instagram/* all work, and the server answers 503 with
 *  "Instagram login is not configured" until INSTAGRAM_APP_ID and
 *  INSTAGRAM_APP_SECRET are set. The problem is that Instagram only lets
 *  accounts with a role on the Meta app complete the flow while it is in
 *  Development mode, so shipping the button would show every visitor a
 *  control that fails for all but a handful of testers.
 *
 *  To turn it back on: set this to true. Nothing else needs changing -- the
 *  components, routes and API client are all still wired up.
 */
export const INSTAGRAM_LOGIN_ENABLED: boolean = false;
