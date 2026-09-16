/* Front-of-house feature switches.
 *
 * These are build-time constants, not environment variables: they gate what
 * the marketing site and app *offer*, which is a code decision reviewed in a
 * PR, not something that should differ silently between deploys.
 */

/** Instagram sign-in and the profile "connect Instagram" card.
 *
 *  ON since 2026-09-17, for Meta App Review. Reviewers test against the live
 *  site, so the button has to be reachable at famesync.com/auth or the
 *  submission is rejected as "unable to reproduce the login flow".
 *
 *  Caveat while review is pending: instagram_business_basic and
 *  instagram_business_manage_insights only have *standard* access, which
 *  covers accounts holding a role on the Meta app. Everyone else gets an
 *  error from Instagram at the consent step. That resolves the moment
 *  advanced access is granted; until then the button is knowingly live and
 *  knowingly limited.
 *
 *  Set back to false to pull it, if review drags on and the dead button
 *  starts costing more than it is worth.
 */
export const INSTAGRAM_LOGIN_ENABLED: boolean = true;
