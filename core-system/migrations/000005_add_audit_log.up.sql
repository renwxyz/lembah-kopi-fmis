-- Audit trail: mencatat siapa melakukan apa pada resource apa (append-only).
CREATE TABLE log_audit (
    id_audit BIGSERIAL PRIMARY KEY,
    waktu TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_admin VARCHAR(20) REFERENCES pengguna_admin(id_admin) ON DELETE SET NULL,
    username VARCHAR(100) NOT NULL,
    peran VARCHAR(30),
    aksi VARCHAR(30) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    metode VARCHAR(10) NOT NULL,
    path VARCHAR(300) NOT NULL,
    status_code SMALLINT NOT NULL,
    request_id VARCHAR(100),
    ip_address VARCHAR(64)
);

CREATE INDEX idx_log_audit_waktu ON log_audit (waktu DESC, id_audit DESC);
CREATE INDEX idx_log_audit_admin ON log_audit (id_admin, waktu DESC);
CREATE INDEX idx_log_audit_resource ON log_audit (resource, resource_id);

