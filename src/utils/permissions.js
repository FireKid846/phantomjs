const config = require('../../config.json');

const isOwner = (userId) => userId === process.env.OWNER_ID;

const isMaintainer = (member) =>
  isOwner(member.id) ||
  member.roles.cache.has(config.roles.maintainer) ||
  member.roles.cache.has(config.roles.firekid);

const isTeam = (member) =>
  isMaintainer(member) || member.roles.cache.has(config.roles.contributor);

module.exports = { isOwner, isMaintainer, isTeam };
