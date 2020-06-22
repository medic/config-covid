CREATE OR REPLACE VIEW superset_signal_view AS
( 
	SELECT
		sig.signal_id,
		sig.reported AS signal_reported,
		verif.reported AS verification_reported,
		verif.threat_exists,
		invest.reported AS investigation_reported,
		invest.labs_sample,
		invest.signal_investigated
	FROM
	    ebsview_signal_report AS sig
		LEFT JOIN ebsview_signal_verification AS verif ON (sig.signal_id = verif.signal_id)
		LEFT JOIN ebsview_signal_investigation AS invest ON (sig.signal_id = invest.signal_id)
);

REASSIGN OWNED BY michael to full_access;
GRANT SELECT ON superset_signal_view TO superset_dev_db ;