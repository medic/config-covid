const isCovidEducationValid = (report) => {
    if (report) {
      const results = Utils.getField(report, 'learning_quiz');
      return results.hand_washing_q ===  'both_soap_and_water_or_hand_saniter' 
        && results.hand_washing_q2 === 'at_least_20_seconds'
        && results.sneezing_coughing_q === 'cough_into_your_elbow_or_tissue'
        && results.household_q === 'a_disinfectant'
        && results.social_distancing_q === 'at_least_2_meters';
    }
    return false;
};

const isCovidCareValid = (report) => (report && Utils.getField(report, 'results').correct === 'true');


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

{
  name: 'trace_follow_up',
  icon: 'icon-healthcare',
  title: 'task.trace_follow_up.title',
  appliesTo: 'contacts',
  appliesToType: ['person'],
  appliesIf: function (contact) {
    return  !!contact.contact.patient_zero; //&& user.role === 'tracer' ;
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
  // Cha verification
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

  // Scdsc investigation
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

  // Symptomatic contact follow up
  {
    name: 'symptomatic_contact_follow_up',
    icon: 'icon-healthcare',
    title: 'task.symptomatic_contact_follow_up.title',
    appliesTo: 'contacts',
    appliesToType: undefined,
    appliesIf: function (contact) {
      this.mostRecentSymptomsCheck = Utils.getMostRecentReport(contact.reports, 'symptoms_check');
      return !!this.mostRecentSymptomsCheck && Utils.getField(this.mostRecentSymptomsCheck, 'symptoms_followup_call.symptoms_check') === true; //&& user.role === 'tracer';
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
  },
   //Symptoms check
  {
    name: 'symptoms_check',
    icon: 'icon-healthcare',
    title: 'task.symptoms_check.title',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
        this.mostRecentQuarantine_follow_up= Utils.getMostRecentReport(contact.reports, 'QUARANTINE_FOLLOW_UP');
        return !!this.mostRecentQuarantine_follow_up && (Utils.getField(this.mostRecentQuarantine_follow_up, 'symptoms_check') === true || Utils.getField(this.mostRecentQuarantine_follow_up, 'symptoms_check')==='2');
      },
    resolvedIf: function (contact) {
      this.mostRecentSymCheck = Utils.getMostRecentReport(contact.reports, 'symptoms_check');
      return !!this.mostRecentSymCheck && Utils.getField(this.mostRecentSymCheck, 'symptom_check.symptom') === 'yes';
      },
    events: [{
      dueDate: function() {
        return Utils.addDate(new Date(this.mostRecentQuarantine_follow_up.reported_date), 1);
      },
      start: 1,
      end: 3
    }],
    actions: [{
      type: 'report',
      form: 'symptoms_check',
      label: 'task.symptoms_check.title',
    }],
  },
  {
    name: 'covid_education_module_1',
    icon: 'icon-healthcare',
    title: 'COVID Modules: Education (1/3)',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
        return contact.contact.role === 'chw';
    },
    resolvedIf: function (contact) {
        const mostRecentCovidEducation = Utils.getMostRecentReport(contact.reports, 'covid_education');
        return mostRecentCovidEducation && isCovidEducationValid(mostRecentCovidEducation);
    },
    events: [{
      days: 1,
      start: 0,
      end: 100
    }],
    actions: [{
      type: 'report',
      form: 'covid_education',
      label: 'COVID Modules: Education (1/3)',
    }],
  },
  {
    name: 'covid_education_module_2',
    icon: 'icon-healthcare',
    title: 'COVID Modules: Myths (2/3)',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
        return contact.contact.role === 'chw' && isCovidEducationValid(Utils.getMostRecentReport(contact.reports, 'covid_education'));
    },
    resolvedIf: function (contact) {
        return Utils.getMostRecentReport(contact.reports, 'covid_rumors');
    },
    events: [{
      days: 1,
      start: 0,
      end: 100
    }],
    actions: [{
      type: 'report',
      form: 'covid_rumors',
      label: 'COVID Modules: Myths (2/3)',
    }],
  },
  {
    name: 'covid_education_module_3',
    icon: 'icon-healthcare',
    title: 'COVID Modules: Care (3/3)',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: function (contact) {
        return contact.contact.role === 'chw' && Utils.getMostRecentReport(contact.reports, 'covid_rumors');
    },
    resolvedIf: function (contact) {
        return !!isCovidCareValid(Utils.getMostRecentReport(contact.reports, 'covid_care'));
    },
    events: [{
      days: 1,
      start: 0,
      end: 100
    }],
    actions: [{
      type: 'report',
      form: 'covid_care',
      label: 'COVID Modules: Myths (3/3)',
    }],
  }
];
