
module.exports = [
  /****
   Use case :  RDT screening
   1. Followup after positive RDT
   ****/

  // 1. Positive Rdt follow-up
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

  /****
   Use case :  C-EBS
   1. Supervisor Verification after signal 8
   2. Investigation of Sub - district after Verified signal 8
   ****/

  // 1. Cha verification
  {
    name: 'cha-signal-verification',
    icon: 'icon-healthcare',
    title: 'task.cha_verification.title',
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
        contact.contact.name = 'Signal ID: ' + ' ' +contact.contact.patient_id;

      },
    }],
  },

  // 2. Scdsc investigation
  {
    name: 'scdsc-investigation',
    icon: 'icon-healthcare',
    title: 'task.scdsc_investigation.title',
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
        contact.contact.name = 'Signal ID: ' + ' ' +contact.contact.patient_id;
      },
    }],
  },

  /****
   Use case :  Contact Tracing
   1. Followup with a contact after tracer assignement
   1. Checking the contact after they reported a symptom
   1. Taking over a contact after they are confirmed as symptomatic
   ****/

  // 1. Trace Follow-up
  {
    name: 'trace_follow_up',
    icon: 'icon-healthcare',
    title: 'task.trace_follow_up.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
      return  !!contact.contact.covid_patient && user.role === 'tracer' ;
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
  },

  // 2. Symptoms check
  {
    name: 'symptoms_check',
    icon: 'icon-healthcare',
    title: 'task.symptoms_check.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
      this.mostRecentQuarantine_follow_up= Utils.getMostRecentReport(contact.reports, 'QUARANTINE_FOLLOW_UP');
      return !!this.mostRecentQuarantine_follow_up && (Utils.getField(this.mostRecentQuarantine_follow_up, 'symptoms_check') === true || Utils.getField(this.mostRecentQuarantine_follow_up, 'symptoms_check')==='1');
    },
    resolvedIf: function (contact) {
      this.mostRecentSymCheck = Utils.getMostRecentReport(contact.reports, 'symptoms_check');
      return !!this.mostRecentSymCheck && Utils.getField(this.mostRecentSymCheck, 'symptom_check.symptom') === 'yes';
    },
    events: [{
      days: 0,
      start: 0,
      end: 3
    }],
    actions: [{
      type: 'report',
      form: 'symptoms_check',
      label: 'task.symptoms_check.title',
    }],
  },

  // 3. Symptomatic contact follow up
  {
    name: 'symptomatic_contact_follow_up',
    icon: 'icon-healthcare',
    title: 'task.symptomatic_contact_follow_up.title',
    appliesTo: 'contacts',
    appliesToType: undefined,
    appliesIf: function (contact) {
      this.mostRecentSymptomsCheck = Utils.getMostRecentReport(contact.reports, 'symptoms_check');
      return !!this.mostRecentSymptomsCheck && Utils.getField(this.mostRecentSymptomsCheck, 'symptom_check.symptom') === 'yes' && user.role === 'data_entry';
    },
    resolvedIf: function (c, r, event) {
      const startTime = Utils.addDate(event.dueDate(c, r), -event.start);
      const endTime = Utils.addDate(event.dueDate(c, r), event.end + 1);

      const reportsAfterQuarantineFollowUp = c.reports.filter(report => report.reported_date >= this.mostRecentSymptomsCheck.reported_date);
      return Utils.isFormSubmittedInWindow(reportsAfterQuarantineFollowUp, 'symptomatic_contact_follow_up', startTime, endTime);
    },
    events: [{
      start: 1,
      end: 3,
      dueDate: function() {
        return Utils.addDate(new Date(this.mostRecentSymptomsCheck.reported_date), 1);
      },
    }],
    actions: [{
      type: 'report',
      form: 'symptomatic_contact_follow_up',
      label: 'task.symptomatic_contact_follow_up.title',
    }],
  }
];
