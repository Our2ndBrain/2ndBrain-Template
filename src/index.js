/**
 * 2ndBrain CLI - Main Entry
 */

const init = require('./commands/init');
const update = require('./commands/update');
const remove = require('./commands/remove');
const member = require('./commands/member');
const completion = require('./commands/completion');

module.exports = {
  init,
  update,
  remove,
  member,
  completion,
};