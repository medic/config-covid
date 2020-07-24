CREATE TABLE tbl_trained
(
    period timestamp,
    trained_user int
);

ALTER TABLE tbl_trained OWNER TO full_access;
GRANT SELECT ON tbl_trained TO superset_dev_db;