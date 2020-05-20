
const getField = (report, fieldPath) => [...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
        if (prev === undefined) { return undefined; }
        return prev[fieldName];
    }, report);

const isTraveler = (contact) => { return getField(contact.contact, 'role') === 'traveler'; };
const isCHW = (contact) => { return getField(contact.contact, 'role') === 'chw'; };

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const isDeclarationForm = (report) => { return report.form === 'declaration'; };
const isLocatorForm = (report) => { return report.form === 'locator'; };
const isQuarantineForm = (report) => { return report.form === 'quarantine'; };
const isReferralForm = (report) => { return report.form === 'referral'; };

const isCovidEducationValid = (report) => {
    if (!report) {
      return false;
    }
    const results = Utils.getField(report, 'learning_quiz');
    if (results.hand_washing_q !== 'both_soap_and_water_or_hand_saniter') {
      return false;
    } else if (results.hand_washing_q2 !== 'at_least_20_seconds') {
      return false;
    } else if (results.sneezing_coughing_q !== 'cough_into_your_elbow_or_tissue') {
      return false;
    } else if (results.household_q !== 'a_disinfectant'){
      return false;
    } else if (results.social_distancing_q !== 'at_least_2_meters') {
      return false;
    }
    return true; 
  };

module.exports = [

    {
        id: 'travellers-registered-this-month',
        type: 'count',
        icon: 'icon-person',
        goal: 0,
        translation_key: 'targets.travellers.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        date: 'reported'
    },

    {
        id: 'travellers-registered-today',
        type: 'count',
        icon: 'icon-person',
        goal: 0,
        translation_key: 'targets.travellers.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) { return isTraveler(contact) && isToday(new Date(contact.contact.reported_date)); },
        date: 'reported'
    },

    {
        id: 'reports-with-risk-this-month',
        type: 'count',
        icon: 'icon-risk',
        goal: 0,
        translation_key: 'targets.risk.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'reports',
        appliesToType: ['declaration'],
        idType: 'contact',
        appliesIf: function (contact, report) {
            return getField(report, 'fields.r_high_risk') === 'true';
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-declaration-this-month',
        type: 'percent',
        icon: 'icon-form-general',
        goal: 100,
        translation_key: 'targets.declaration.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        percentage_count_translation_key: 'targets.traveller.percent',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isDeclarationForm(report); });
        },
        date: 'reported'
    },


    {
        id: 'travellers-with-quarantine-today',
        type: 'count',
        icon: 'icon-calendar',
        goal: 0,
        translation_key: 'targets.quarantine.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'reports',
        appliesToType: ['quarantine'],
        idType: 'contact',
        appliesIf: function (contact, report) {
            return isToday(new Date(report.reported_date));
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-quarantine-this-month',
        type: 'percent',
        icon: 'icon-calendar',
        goal: 100,
        translation_key: 'targets.quarantine.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isQuarantineForm(report); });
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-locator-this-month',
        type: 'percent',
        icon: 'icon-service-rating',
        goal: 100,
        translation_key: 'targets.locator.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isLocatorForm(report); });
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-referral-today',
        type: 'count',
        icon: 'icon-hospital',
        goal: 0,
        translation_key: 'targets.referral.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) {
            return isTraveler(contact) &&
                contact.reports.some((report) => { return isToday(new Date(report.reported_date)) && isReferralForm(report); });
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-referral-this-month',
        type: 'count',
        icon: 'icon-hospital',
        goal: 0,
        translation_key: 'targets.referral.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) {
            return isTraveler(contact) && contact.reports.some((report) => { return isReferralForm(report); });
        },
        date: 'reported'
    },
    {
        id: 'covid-learning-modules-completed',
        type: 'count',
        icon: 'icon-hospital',
        goal: 2,
        translation_key: 'Training Modules',
        context:'user.role === "chw"',
        appliesTo: 'reports',
        appliesToType: ['covid_education', 'covid_rumors'],
        appliesIf: function (contact, report) {
             if(!isCHW(contact)) {
                 return false;
             } else if (report.form === 'covid_education') {
                 return isCovidEducationValid(report);
             } else if (report.form === 'covid_rumors') {
                 return true;
             }
            return false;
        },
        date: 'now',
	idType: 'report'
    }

];