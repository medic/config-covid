
module.exports = [
  // Covid Rdt Followup
  {
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
  },

  // Cha verification
  {
    name: 'cha-signal-verification',
    icon: 'icon-healthcare',
    title: 'Cha verification',
    appliesTo: 'contacts',
    appliesToType: undefined,
    appliesIf: function (c) {
      const isCha = user.parent && user.parent.type === 'health_center';
      this.mostRecent8 = Utils.getMostRecentReport(c.reports, '8');
      return isCha && this.mostRecent8 ;
    },
    resolvedIf: function (c, r, event) {
      const startTime = Utils.addDate(event.dueDate(c, r), -event.start);
      const endTime = Utils.addDate(event.dueDate(c, r), event.end + 1);

      const reportsAfter8 = c.reports.filter(report => report.reported_date >= this.mostRecent8.reported_date);
      return Utils.isFormSubmittedInWindow(reportsAfter8, 'cha_signal_verification', startTime, endTime);
    },
    events: [{
      start: 1,
      end: 3,
      dueDate: function() {
        return Utils.addDate(new Date(this.mostRecent8.reported_date), 1);
      },
    }],
    actions: [{
      type: 'report',
      form: 'cha_signal_verification',
      label: 'Cha verification',
      modifyContent: function (content,contact) {
        console.log(JSON.stringify(contact));
        const report = this.mostRecent8;
        content.id_signal = report.patient_id;
        //content.chw_id = contact._id;
        //content.patient_id = contact._id;
        contact.contact.name = 'event ' + ' ' +contact.contact.patient_id;

      },
    }],
  },

  // Scdsc investigation
  {
    name: 'scdsc-investigation',
    icon: 'icon-healthcare',
    title: 'Scdsc investigation',
    appliesTo: 'contacts',
    appliesToType: undefined,
    appliesIf: function (c) {
      const isScdsc = user.parent && user.parent.type === 'district_hospital';
      this.mostRecentChaVerification = Utils.getMostRecentReport(c.reports, 'cha_signal_verification');
      return isScdsc && this.mostRecentChaVerification ;
    },
    resolvedIf: function (c, r, event) {
      const startTime = Utils.addDate(event.dueDate(c, r), -event.start);
      const endTime = Utils.addDate(event.dueDate(c, r), event.end + 1);

      const reportsAfterChaVerification = c.reports.filter(report => report.reported_date >= this.mostRecentChaVerification.reported_date);
      return Utils.isFormSubmittedInWindow(reportsAfterChaVerification, 'scdsc_investigation', startTime, endTime);
    },
    events: [{
      start: 1,
      end: 3,
      dueDate: function() {
        return Utils.addDate(new Date(this.mostRecentChaVerification.reported_date), 1);
      },
    }],
    actions: [{
      type: 'report',
      form: 'scdsc_investigation',
      label: 'Scdsc investigation',
      modifyContent: function (content,contact) {
        const report = this.mostRecentChaVerification;
        content.id_signal = report.fields.patient_id;
        contact.contact.name = 'event ' + ' ' +contact.contact.patient_id;
      },
    }],
  },
];
