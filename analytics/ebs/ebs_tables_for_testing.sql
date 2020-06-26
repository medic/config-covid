CREATE TABLE ebs_signal (
	uuid text,
	form text,
	reported_by text,
	reported_by_parent text,
	signal_id text,
	signal_code text,
	reported timestamp without time zone
);

ALTER TABLE ebs_signal OWNER TO full_access;
GRANT SELECT ON ebs_signal TO superset_dev_db;
ALTER TABLE ebs_signal ADD COLUMN facility text;

CREATE TABLE ebs_verification (
	uuid text,
	form text,
	reported_by text,
	reported_by_parent text,
	signal_id text,
	signal_desc text,
	signal_confirmation text,
	signal_start_date text,
	num_people_symptoms text,
	num_people_dead text,
	additional_details text,
	signal_source text,
	source_specify text,
	threat_exists text,
	verification_date timestamp without time zone,
	latitude text,
	longitude text,
	reported timestamp without time zone
);

ALTER TABLE ebs_verification OWNER TO full_access;
GRANT SELECT ON ebs_verification TO superset_dev_db;

CREATE TABLE ebs_investigation (
	uuid text,
	form text,
	reported_by text,
	reported_by_parent text,
	signal_id text,
	signal_investigated text,
	cause text,
	signs_reported_fever text,
	signs_reported_cough text,
	signs_reported_breathing text,
	signs_reported_diarrhoea text,
	signs_reported_other text,
	signs_other text,
	travel_history text,
	contact_covid_case text,
	labs_sample text,
	num_people_exposed integer,
	num_suspected_cases integer,
	num_human_cases_hospitalized integer,
	num_human_deaths integer,
	event_risk_classification text,
	response_recommendations text,
	latitude text,
	longitude text,
	reported timestamp without time zone
);

ALTER TABLE ebs_investigation OWNER TO full_access;
GRANT SELECT ON ebs_investigation TO superset_dev_db;
