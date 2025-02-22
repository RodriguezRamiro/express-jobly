"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Ensure the user is an admin. */
function ensureAdmin(req, res, next) {
  try {
      if (!res.locals.user || !res.locals.user.isAdmin) {
          throw new UnauthorizedError("Must be an admin");
      }
      return next();
  } catch (err) {
      return next(err);
  }
}

/** Middleware: Ensure the user is the same user or an admin. */
function ensureAdminOrSameUser(req, res, next) {
  try {
      const username = req.params.username; // Assume username is in the route params
      if (!res.locals.user || (!res.locals.user.isAdmin && res.locals.user.username !== username)) {
          throw new UnauthorizedError("Must be the user or an admin");
      }
      return next();
  } catch (err) {
      return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrSameUser,
};
