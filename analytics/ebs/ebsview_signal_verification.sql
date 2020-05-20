CREATE OR REPLACE VIEW ebsview_signal_verification AS
(
    SELECT
        doc ->> '_id' AS uuid,
        doc ->> 'form' AS form,
        doc #>> '{contact,_id}' AS reported_by,
        doc #>> '{contact,parent,_id}' AS reported_by_parent,
        (doc #>> '{fields,signal_id}')::text AS signal_id,
        (doc #>> '{fields, signal_verification, signal_desc}')::text AS signal_desc,
        (doc #>> '{fields, signal_verification, signal_type}')::text AS signal_confirmation,
        (doc #>> '{fields, signal_verification, signal_start_date}')::date as signal_start_date,
        (doc #>> '{fields, signal_verification, no_people_symptoms}')::int as num_people_symptoms,
        (doc #>> '{fields, signal_verification, no_people_dead}')::int as num_people_dead,
        (doc #>> '{fields, signal_verification, additional_details}')::text as additional_details,
        (doc #>> '{fields, signal_verification, source}')::text as signal_source,
        (doc #>> '{fields, signal_verification, source_specify}')::text as source_specify,
        (doc #>> '{fields, signal_verification, threat_exists}')::text AS threat_exists,
        (doc #>> '{fields, signal_verification, verification_date}')::date as verification_date,
        doc #>> '{geolocation,latitude}' AS latitude,
        doc #>> '{geolocation,longitude}' AS longitude,
        to_timestamp((NULLIF(couchdb.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision) AS reported
    FROM
        couchdb
    WHERE
        doc ->> 'form' = 'cha_signal_verification'
);

ALTER VIEW ebsview_signal_verification OWNER TO full_access;
