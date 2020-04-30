import { testConn } from "./testConn";

/**
 * This file will run before any test is run.
 *
 * Setup the following
 *  1. sets up the connection to the test db.
 */

// db connection
testConn(true).then(() => process.exit());
