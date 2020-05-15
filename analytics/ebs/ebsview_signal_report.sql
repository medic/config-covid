CREATE OR REPLACE VIEW chtview_signal_report AS
(
    SELECT
        doc ->> '_id' AS uuid,
        doc ->> 'form' AS form,
        doc #>> '{contact,_id}' AS reported_by,
        doc #>> '{contact,parent,_id}' AS reported_by_parent,
        doc ->> 'patient_id' AS signal_id, -- We have to grab from patient_id until https://github.com/medic/cht-core/issues/6291 is implemented
        doc ->> 'form' AS signal_code,
        to_timestamp((NULLIF(couchdb.doc ->> 'reported_date'::text, ''::text)::bigint / 1000)::double precision) AS reported
    FROM
        couchdb
    WHERE
        doc ->> 'form' = '8'
);
