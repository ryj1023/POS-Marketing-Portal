function createImportReport(summary) {
  return {
    processedCount: summary.processedCount,
    rejectedCount: summary.rejectedCount,
    duplicateCount: summary.duplicateCount,
    importedDateRange: summary.importedDateRange,
    rowErrors: summary.rowErrors
  };
}

module.exports = {
  createImportReport
};
