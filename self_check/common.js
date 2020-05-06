/**
 * @module Common
 * Shared code used in tasks/targets and contact-summaries
 */


const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
  .reduce((prev, fieldName) => {
    if (prev === undefined) { return undefined; }
    return prev[fieldName];
  }, report);


module.exports = {
  getField
};
