module.exports = [{
  name: 'covid-rdt-followup',
  icon: 'icon-healthcare',
  title: 'task.covid_followup.title',
  appliesTo: 'contacts',
  appliesToType: ['person'],
  appliesIf: function (c) {
    this.mostRecentRdt = Utils.getMostRecentReport(c.reports, 'covid_rdt');
    return this.mostRecentRdt && Utils.getField(this.mostRecentRdt, 'test_result') === 'positive';
  },
  resolvedIf: function (c, r, event) {
    const startTime = Utils.addDate(event.dueDate(c, r), -event.start);
    const endTime = Utils.addDate(event.dueDate(c, r), event.end + 1);
    
    const reportsAfterRdt = c.reports.filter(report => report.reported_date >= this.mostRecentRdt.reported_date);
    return Utils.isFormSubmittedInWindow(reportsAfterRdt, 'covid_rdt_followup', startTime, endTime);
  },
  events: [{
    start: 1,
    end: 3,
    dueDate: function() {
      return Utils.addDate(new Date(this.mostRecentRdt.reported_date), 1);
    },
  }], 
  actions: [{
    type: 'contacts',
    form: 'covid_rdt_followup',
    label: 'task.covid_followup.title',
  }],
}];
