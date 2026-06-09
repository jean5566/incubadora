-- =============================================================
--  ESQUEMA COMPLETO — Sistema de Incubadora Universitaria
--  Orden: respeta dependencias de llaves foráneas
-- =============================================================

-- ------------------------------------------------------------
-- 1. USUARIOS  (tabla central del sistema)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario      INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150)   NOT NULL,
    correo          VARCHAR(150)   NOT NULL UNIQUE,
    clave           VARCHAR(255)   NOT NULL,
    rol             ENUM('administrador','mentor','emprendedor') NOT NULL,
    estado          ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    fecha_registro  TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contraseña: password1234
INSERT INTO usuarios (nombre, correo, clave, rol, estado) VALUES
    ('Administrador', 'admin@uniincubadora.edu.ec',
     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'administrador', 'activo');

-- ------------------------------------------------------------
-- 2. TOKENS DE ACCESO  (Laravel Sanctum)
-- ------------------------------------------------------------
CREATE TABLE tokens_acceso (
    id_token        BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    tipo_modelo     VARCHAR(255)     NOT NULL,
    id_modelo       BIGINT UNSIGNED  NOT NULL,
    nombre          VARCHAR(255)     NOT NULL,
    token           VARCHAR(64)      NOT NULL UNIQUE,
    permisos        TEXT             NULL,
    ultimo_uso      TIMESTAMP        NULL,
    expira_en       TIMESTAMP        NULL,
    creado_en       TIMESTAMP        NULL,
    actualizado_en  TIMESTAMP        NULL,
    INDEX idx_tokenable (tipo_modelo, id_modelo)
);

-- ------------------------------------------------------------
-- 3. PROYECTOS
-- ------------------------------------------------------------
CREATE TABLE proyectos (
    id_proyecto         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT UNSIGNED  NOT NULL,
    id_docente          INT UNSIGNED  NULL,
    nombre_proyecto     VARCHAR(200)  NOT NULL,
    descripcion         TEXT          NOT NULL,
    sector_tecnologico  VARCHAR(200)  NULL,
    problema_resuelve   TEXT          NULL,
    propuesta_valor     TEXT          NULL,
    estado              ENUM('pendiente','activo','finalizado','rechazado') NOT NULL DEFAULT 'pendiente',
    fecha_registro      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proyectos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_proyectos_docente FOREIGN KEY (id_docente) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 4. ASIGNACIONES
-- ------------------------------------------------------------
CREATE TABLE asignaciones (
    id_asignacion  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
    id_proyecto    INT UNSIGNED    NOT NULL,
    id_usuario     INT UNSIGNED    NOT NULL,
    fecha          TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    activo         ENUM('si','no') NOT NULL DEFAULT 'si',
    CONSTRAINT fk_asignaciones_proyecto FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
    CONSTRAINT fk_asignaciones_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios(id_usuario)  ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. MENTORES
-- ------------------------------------------------------------
CREATE TABLE mentores (
    id_mentor           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT UNSIGNED  NOT NULL UNIQUE,
    especialidad        VARCHAR(255)  NULL,
    fecha_creacion      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mentores_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 6. EMPRENDEDORES
-- ------------------------------------------------------------
CREATE TABLE emprendedores (
    id_emprendedor      INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT UNSIGNED  NOT NULL UNIQUE,
    telefono            VARCHAR(20)   NULL,
    carrera             VARCHAR(150)  NULL,
    semestre            VARCHAR(50)   NULL,
    bio                 TEXT          NULL,
    fecha_actualizacion TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_emprendedores_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. ETAPAS  (catálogo fijo)
-- ------------------------------------------------------------
CREATE TABLE etapas (
    id_etapa     INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
    nombre_etapa VARCHAR(100)     NOT NULL,
    orden_etapa  TINYINT UNSIGNED NOT NULL
);

INSERT INTO etapas (nombre_etapa, orden_etapa) VALUES
    ('Ideación',     1),
    ('Validación',   2),
    ('Prototipo',    3),
    ('Incubación',   4),
    ('Escalamiento', 5);

-- ------------------------------------------------------------
-- 8. SEGUIMIENTOS
-- ------------------------------------------------------------
CREATE TABLE seguimientos (
    id_seguimiento  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_proyecto     INT UNSIGNED  NOT NULL,
    id_etapa        INT UNSIGNED  NOT NULL,
    fecha_inicio    DATE          NOT NULL,
    fecha_fin       DATE          NULL,
    id_mentor       INT UNSIGNED  NOT NULL,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
    FOREIGN KEY (id_etapa)    REFERENCES etapas(id_etapa),
    FOREIGN KEY (id_mentor)   REFERENCES usuarios(id_usuario)   ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 9. DOCUMENTOS  (id_revision nullable — se enlaza en paso 10)
-- ------------------------------------------------------------
CREATE TABLE documentos (
    id_documento  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_proyecto   INT UNSIGNED  NOT NULL,
    nombre        VARCHAR(200)  NOT NULL,
    archivo       VARCHAR(500)  NOT NULL,
    fecha         DATE          NOT NULL,
    id_usuario    INT UNSIGNED  NOT NULL,
    id_revision   INT UNSIGNED  NULL,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario)  REFERENCES usuarios(id_usuario)   ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 10. REVISIONES  (+ FK circular documentos → revisiones)
-- ------------------------------------------------------------
CREATE TABLE revisiones (
    id_revision     INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_seguimiento  INT UNSIGNED  NOT NULL,
    fecha_envio     DATE          NOT NULL,
    observaciones   TEXT          NULL,
    revisado        TINYINT(1)    NOT NULL DEFAULT 0,
    FOREIGN KEY (id_seguimiento) REFERENCES seguimientos(id_seguimiento) ON DELETE CASCADE
);

ALTER TABLE documentos
    ADD CONSTRAINT fk_documentos_revision
        FOREIGN KEY (id_revision) REFERENCES revisiones(id_revision) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 11. ASESORIAS
-- ------------------------------------------------------------
CREATE TABLE asesorias (
    id_asesoria     INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
    id_seguimiento  INT UNSIGNED   NOT NULL,
    titulo          VARCHAR(200)   NOT NULL,
    descripcion     TEXT           NULL,
    fecha           DATE           NOT NULL,
    hora_inicio     TIME           NOT NULL,
    hora_fin        TIME           NULL,
    modalidad       ENUM('virtual','presencial') NOT NULL DEFAULT 'virtual',
    enlace          VARCHAR(500)   NULL,
    lugar           VARCHAR(300)   NULL,
    estado          ENUM('programada','realizada','cancelada') NOT NULL DEFAULT 'programada',
    notas           TEXT           NULL,
    CONSTRAINT fk_asesorias_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES seguimientos(id_seguimiento) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 12. NOTIFICACIONES
-- ------------------------------------------------------------
CREATE TABLE notificaciones (
    id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT UNSIGNED  NOT NULL,
    tipo        VARCHAR(50)   NOT NULL,
    mensaje     VARCHAR(500)  NOT NULL,
    url         VARCHAR(255)  NULL,
    leida       TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =============================================================
--  TABLAS INTERNAS DE LARAVEL (gestionadas por migraciones PHP)
--  tokens_restablecimiento · sesiones · cache_datos
--  cache_bloqueos · trabajos · lotes_trabajos · trabajos_fallidos
-- =============================================================
