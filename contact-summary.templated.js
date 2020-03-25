const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;


const getField = (report, fieldPath) => [...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
      if (prev === undefined) { return undefined; }
      return prev[fieldName];
    }, report);

const isTraveler = () => { return getField(thisContact, 'role') === 'traveler'; };

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) { return true; }
  return false;
};

const hasReport = function (form) {
  return allReports && allReports.some((report) => report.form === form);
};

const context = {
  isPassenger: isTraveler(),
  hasDeclarationForm: hasReport('declaration'),
  hasLocatorForm: hasReport('locator'),
  hasQuarantineForm: hasReport('quarantine'),
};

const fields = [
  { appliesToType: 'person', label: 'patient_id', value: thisContact.patient_id, width: 4 },
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'person.field.alternate_phone', value: thisContact.phone_alternate, width: 4 },
  { appliesToType: 'person', appliesIf: isTraveler, label: 'contact.nationality', value: 'country.' + getField(thisContact, 'traveler.nationality'), translate: true, width: 4 },
  { appliesToType: 'person', appliesIf: isTraveler, label: 'contact.passport', value: getField(thisContact, 'traveler.passport'), width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: '!person', label: 'contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: '!person', label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: '!person', label: 'External ID', value: thisContact.external_id, width: 4 },
  { appliesToType: '!person', appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: 'person', label: 'contact.notes', value: thisContact.notes, width: 12 },
  { appliesToType: '!person', label: 'contact.notes', value: thisContact.notes, width: 12 }
];

const cards = [
  {
    label: 'contact.profile.referral',
    appliesToType: 'person',
    appliesIf: function () {
      return isTraveler() && !!getNewestReport(allReports, 'referral');
    },
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'referral');
      const temp_infra_unit = getField(report, 'fields.temp_infra_unit');
      const temp_clinical_unit = getField(report, 'fields.temp_clinical_unit');
      const temp_infra_unit_text = temp_infra_unit === 'celsius' ? '°C' : temp_infra_unit === 'fahrenheit' ? '°F' : '';
      const temp_clinical_unit_text = temp_clinical_unit === 'celsius' ? '°C' : temp_clinical_unit === 'fahrenheit' ? '°F' : '';
      if (report) {
        fields.push(
            { label: 'contact.profile.referral.temp_ir', value: getField(report, 'fields.temp_infra') + temp_infra_unit_text, width: 6 },
            { label: 'contact.profile.referral.temp_clinical', value: getField(report, 'fields.temp_clinical') + temp_clinical_unit_text, width: 6 },
            { label: 'contact.profile.referral.referred_to', value: 'contact.profile.referral.place.' + getField(report, 'fields.referred_to'), translate: true, width: 6 },
            { label: '', icon: 'icon-risk', width: 6 }
        );
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.quarantine.form',
    appliesToType: 'person',
    appliesIf: isTraveler,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'quarantine');
      if (report) {
        fields.push(
            { label: 'contact.profile.quarantine.airline', value: getField(report, 'fields.flight_info.airline'), width: 4 },
            { label: 'contact.profile.quarantine.flight', value: getField(report, 'fields.flight_info.flight'), width: 4 },
            { label: 'contact.profile.quarantine.arrival_date', value: getField(report, 'fields.flight_info.arrival_date'), filter: 'simpleDate', width: 4 },
            { label: 'contact.profile.quarantine.accomodation.stay', value: 'contact.profile.quarantine.accomodation.stay.' + getField(report, 'fields.accomodation.staying_at'), translate: true, width: 4 },
            { label: 'contact.profile.quarantine.accomodation.province', value: getField(report, 'fields.accomodation.province'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.district', value: getField(report, 'fields.accomodation.district'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.municipality', value: getField(report, 'fields.accomodation.municipality'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.ward', value: getField(report, 'fields.accomodation.ward'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.house', value: getField(report, 'fields.accomodation.house'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.landline', value: getField(report, 'fields.accomodation.landline'), width: 4 },
            { label: 'contact.profile.quarantine.accomodation.mobile', value: getField(report, 'fields.accomodation.mobile'), width: 4 }
        );
      }
      else {
        fields.push({ label: 'contact.profile.quarantine.form.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.declaration.form',
    appliesToType: 'person',
    appliesIf: isTraveler,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'declaration');
      if (report) {
        const contactRiskFactors = getRiskFactors(getField(report, 'fields.contact_info'));
        const healthRiskFactors = getRiskFactors(getField(report, 'fields.health'));

        if (contactRiskFactors && contactRiskFactors.length > 0) {
          fields.push({ label: 'risk.contact.found', width: 12, icon: 'icon-risk' });
          contactRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.contact.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.contact.none' });
        }

        if (healthRiskFactors && healthRiskFactors.length > 0) {
          fields.push({ label: 'risk.health.found', width: 12, icon: 'icon-risk' });
          healthRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.health.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.health.none' });
        }

      }
      else {
        fields.push({ label: 'contact.profile.declaration.form.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.locator.form',
    appliesToType: 'person',
    appliesIf: isTraveler,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'locator');
      if (report) {
        fields.push(
            { label: 'contact.profile.locator.airline', value: getField(report, 'fields.flight_info.airline'), width: 4 },
            { label: 'contact.profile.locator.flight', value: getField(report, 'fields.flight_info.flight'), width: 4 },
            { label: 'contact.profile.locator.arrival_date', value: getField(report, 'fields.flight_info.arrival_date_updated') || getField(report, 'fields.flight_info.arrival_date'), filter: 'simpleDate', width: 4 }

        );
      }
      else {
        fields.push({ label: 'contact.profile.locator.form.none' });
      }

      return fields;
    }
  }

];

function getRiskFactors(group) {
  if (!group) return false;
  const riskFactors = [];
  Object.keys(group).forEach(function (key) {
    if (group[key] === 'true' && key.indexOf('_risk') < 0) {
      riskFactors.push(key);
    }
  });
  return riskFactors;
}

function getNewestReport(allReports, forms) {
  let result;
  allReports && allReports.forEach(function (report) {
    if (!isReportValid(report) || !forms.includes(report.form)) { return; }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
}


module.exports = {
  context: context,
  cards: cards,
  fields: fields
};
