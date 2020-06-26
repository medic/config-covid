CREATE OR REPLACE VIEW ebsview_signal_investigation AS
(
    SELECT
        doc ->> '_id' AS uuid,
        doc ->> 'form' AS form,
        doc #>> '{contact,_id}' AS reported_by,
        doc #>> '{contact,parent,_id}' AS reported_by_parent,
        (doc #>> '{fields,signal_id}')::text AS signal_id,
        (doc #>> '{fields, scdsc_investigation, signal_investigated}')::text AS signal_investigated,
        (doc #>> '{fields, scdsc_investigation, cause}')::text AS cause,
        CASE
            WHEN (doc #>> '{fields, scdsc_investigation, signs_reported}') LIKE '%fever%' THEN 'yes'
            ELSE 'no'
        END AS signs_reported_fever,
        CASE
            WHEN (doc #>> '{fields, scdsc_investigation, signs_reported}') LIKE '%cough%' THEN 'yes'
            ELSE 'no'
        END AS signs_reported_cough,
        CASE
            WHEN (doc #>> '{fields, scdsc_investigation, signs_reported}') LIKE '%breathing%' THEN 'yes'
            ELSE 'no'
        END AS signs_reported_breathing,
        CASE
            WHEN (doc #>> '{fields, scdsc_investigation, signs_reported}') LIKE '%diarrhoea%' THEN 'yes'
            ELSE 'no'
        END AS signs_reported_diarrhoea,
        CASE
            WHEN (doc #>> '{fields, scdsc_investigation, signs_reported}') LIKE '%other%' THEN 'yes'
            ELSE 'no'
        END AS signs_reported_other,
        (doc #>> '{fields, scdsc_investigation, signs_other}')::text AS signs_other,
        (doc #>> '{fields, scdsc_investigation, travel_history}')::text AS travel_history,
        (doc #>> '{fields, scdsc_investigation, contact_covid_case}')::text AS contact_covid_case,
        (doc #>> '{fields, scdsc_investigation, labs_sample}')::text AS labs_sample,
        (doc #>> '{fields, scdsc_investigation, no_people_exposed}')::int AS num_people_exposed,
        (doc #>> '{fields, scdsc_investigation, no_suspected_cases}')::int AS num_suspected_cases,
        (doc #>> '{fields, scdsc_investigation, no_human_cases_hospitalized}')::int AS num_human_cases_hospitalized,
        (doc #>> '{fields, scdsc_investigation, no_human_deaths}')::int AS num_human_deaths,
        (doc #>> '{fields, scdsc_investigation, event_risk_classification}')::text AS event_risk_classification,
        (doc #>> '{fields, scdsc_investigation, response_recommendations}')::text AS response_recommendations,
        doc #>> '{geolocation,latitude}' AS latitude,
        doc #>> '{geolocation,longitude}' AS longitude,
        to_timestamp((NULLIF(couchdb.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision) AS reported
    FROM
        couchdb
    WHERE
        doc ->> 'form' = 'scdsc_investigation'
);

ALTER VIEW ebsview_signal_investigation OWNER TO full_access;
GRANT SELECT ON ebsview_signal_investigation TO superset_dev_db;

