CREATE OR REPLACE VIEW ebsview_signal_investigation AS
{
	SELECT
		uuid,
		form,
		reported_by,
		reported_by_parent,
		signal_id,
		signal_investigated,
		cause,
		signs_reported_fever,
		signs_reported_cough,
		signs_reported_breathing,
		signs_reported_diarrhoea,
		signs_reported_other,
		signs_other,
		travel_history,
		contact_covid_case,
		labs_sample,
		num_people_exposed,
		num_suspected_cases,
		num_human_cases_hospitalized,
		num_human_deaths,
		event_risk_classification,
		response_recommendations,
		latitude,
		longitude,
		reported::timestamp with time zone
	FROM
		ebs_investigation
};

ALTER VIEW ebsview_signal_investigation OWNER TO full_access;
GRANT SELECT ON ebsview_signal_investigation TO superset_dev_db;

--------------------------------------------------------
--------------------------------------------------------

CREATE OR REPLACE VIEW ebsview_signal_report AS
{
	SELECT
		uuid,
		form,
		reported_by,
		reported_by_parent,
		signal_id,
		signal_code,
		reported::timestamp with time zone
	FROM
		ebs_signal
};

ALTER VIEW ebsview_signal_report OWNER TO full_access;
GRANT SELECT ON ebsview_signal_report TO superset_dev_db;

--------------------------------------------------------
--------------------------------------------------------

CREATE OR REPLACE VIEW ebsview_signal_verification AS
{
	SELECT
		uuid,
		form,
		reported_by,
		reported_by_parent,
		signal_id,
		signal_desc,
		signal_confirmation,
		signal_start_date,
		num_people_symptoms,
		num_people_dead,
		additional_details,
		signal_source,
		source_specify,
		threat_exists,
		verification_date,
		latitude,
		longitude,
		reported::timestamp with time zone
	FROM
		ebs_verification
};

ALTER VIEW ebsview_signal_verification OWNER TO full_access;
GRANT SELECT ON ebsview_signal_verification TO superset_dev_db;

