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
    dueDate: function () {
      return Utils.addDate(new Date(this.mostRecentRdt.reported_date), 1);
    },
  }],
  actions: [{
    type: 'contacts',
    form: 'covid_rdt_followup',
    label: 'task.covid_followup.title',
  }],
},

{
  name: 'trace_follow_up',
  icon: 'icon-healthcare',
  title: 'task.trace_follow_up.title',
  appliesTo: 'contacts',
  appliesToType: ['person'],
  appliesIf: function (contact) {
    return user.role === 'tracer' && !!contact.contact.patient_zero;
  },
  resolvedIf: function (contact) {
    this.mostRecentTraceFollowUp = Utils.getMostRecentReport(contact.reports, 'covid_trace_follow_up');
    return this.mostRecentTraceFollowUp &&
      ['contacted', 'stop'].includes(Utils.getField(this.mostRecentTraceFollowUp, 'trace.result'));
  },
  events: [{
    days: 0,
    start: 0,
    end: 30
  }],
  actions: [{
    type: 'report',
    form: 'covid_trace_follow_up',
    label: 'task.trace_follow_up.title',
  }],
}
];
