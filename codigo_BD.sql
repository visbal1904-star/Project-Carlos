-- ============================================================
-- DDL — App de Administración de Conjuntos Residenciales
-- Motor: PostgreSQL
-- Generado con ayuda de IA a partir del modelo entidad-relación
-- definido manualmente (según lo permitido por la actividad).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Conjunto_Residencial
-- ------------------------------------------------------------
CREATE TABLE Conjunto_Residencial (
    id_conjunto     SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    direccion       VARCHAR(150) NOT NULL,
    ciudad          VARCHAR(50)  NOT NULL,
    pais            VARCHAR(50)  NOT NULL DEFAULT 'Colombia',
    nit             VARCHAR(20)  UNIQUE
);

-- ------------------------------------------------------------
-- 2. Apartamento
-- ------------------------------------------------------------
CREATE TABLE Apartamento (
    id_apartamento  SERIAL PRIMARY KEY,
    id_conjunto     INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    torre           VARCHAR(10),
    numero          VARCHAR(10) NOT NULL,
    piso            INTEGER,
    UNIQUE (id_conjunto, torre, numero)
);

-- ------------------------------------------------------------
-- 3. Usuario
-- ------------------------------------------------------------
CREATE TABLE Usuario (
    id_usuario      SERIAL PRIMARY KEY,
    id_conjunto     INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    id_apartamento  INTEGER REFERENCES Apartamento(id_apartamento), -- nulo si es portero/administrador
    nombre          VARCHAR(50)  NOT NULL,
    apellido        VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    rol             VARCHAR(20)  NOT NULL
                    CHECK (rol IN ('Residente_Principal','Residente_Familiar','Portero','Administrador'))
);

-- ------------------------------------------------------------
-- 4. Suscripcion  (relación comercial: conjunto <-> tu empresa)
-- ------------------------------------------------------------
CREATE TABLE Suscripcion (
    id_suscripcion  SERIAL PRIMARY KEY,
    id_conjunto     INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    plan            VARCHAR(30),
    modelo_cobro    VARCHAR(30) CHECK (modelo_cobro IN ('por_apartamento','tarifa_plana')),
    costo_mensual   NUMERIC(10,2),
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE,
    estado          VARCHAR(20) NOT NULL DEFAULT 'activa'
                    CHECK (estado IN ('activa','suspendida','cancelada'))
);

-- ------------------------------------------------------------
-- 5. Pago  (cuota de administración: residente -> conjunto)
-- ------------------------------------------------------------
CREATE TABLE Pago (
    id_pago             SERIAL PRIMARY KEY,
    id_apartamento      INTEGER NOT NULL REFERENCES Apartamento(id_apartamento),
    tipo_pago           VARCHAR(30) NOT NULL
                        CHECK (tipo_pago IN ('Administracion','Reserva_Zona','Multa')),
    valor               NUMERIC(10,2) NOT NULL,
    fecha_pago          TIMESTAMP,
    fecha_vencimiento   DATE NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','pagado','vencido'))
);

-- ------------------------------------------------------------
-- 6. Visita  (superclase: Visitante o Domicilio)
-- ------------------------------------------------------------
CREATE TABLE Visita (
    id_visita           SERIAL PRIMARY KEY,
    id_apartamento      INTEGER NOT NULL REFERENCES Apartamento(id_apartamento),
    id_usuario_autoriza INTEGER REFERENCES Usuario(id_usuario), -- residente que generó el QR (opcional)
    id_usuario_registra INTEGER REFERENCES Usuario(id_usuario), -- portero que la registró (opcional)
    tipo_visita         VARCHAR(20) NOT NULL CHECK (tipo_visita IN ('Visitante','Domicilio')),
    codigo_qr           VARCHAR(50),
    pre_autorizada      BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_hora_ingreso  TIMESTAMP,
    fecha_hora_salida   TIMESTAMP,
    estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','autorizado','rechazado','finalizado','expirado'))
);

-- ------------------------------------------------------------
-- 7. Visitante  (subtipo de Visita, 1:1)
-- ------------------------------------------------------------
CREATE TABLE Visitante (
    id_visita           INTEGER PRIMARY KEY REFERENCES Visita(id_visita),
    nombre_visitante    VARCHAR(80) NOT NULL,
    documento_identidad VARCHAR(20),
    motivo_visita       VARCHAR(100),
    foto_url            TEXT
);

-- ------------------------------------------------------------
-- 8. Domicilio  (subtipo de Visita, 1:1)
-- ------------------------------------------------------------
CREATE TABLE Domicilio (
    id_visita            INTEGER PRIMARY KEY REFERENCES Visita(id_visita),
    empresa              VARCHAR(50) NOT NULL,
    repartidor_nombre    VARCHAR(80),
    telefono_repartidor  VARCHAR(20)
);

-- ------------------------------------------------------------
-- 9. Item_Domicilio  (N productos por cada Domicilio)
-- ------------------------------------------------------------
CREATE TABLE Item_Domicilio (
    id_item         SERIAL PRIMARY KEY,
    id_visita       INTEGER NOT NULL REFERENCES Domicilio(id_visita),
    descripcion     VARCHAR(100) NOT NULL,
    cantidad        INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0)
);

-- ------------------------------------------------------------
-- 10. Paquete  (independiente, no es una Visita)
-- ------------------------------------------------------------
CREATE TABLE Paquete (
    id_paquete              SERIAL PRIMARY KEY,
    id_apartamento          INTEGER NOT NULL REFERENCES Apartamento(id_apartamento),
    id_usuario_registra     INTEGER REFERENCES Usuario(id_usuario), -- portero que lo recibió
    empresa_transportadora  VARCHAR(50) NOT NULL,
    numero_guia             VARCHAR(50),
    foto_url                TEXT,
    fecha_hora_recepcion    TIMESTAMP NOT NULL DEFAULT now(),
    fecha_hora_entrega      TIMESTAMP,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'recibido'
                            CHECK (estado IN ('recibido','entregado','devuelto'))
);

-- ------------------------------------------------------------
-- 11. Zona_Comun
-- ------------------------------------------------------------
CREATE TABLE Zona_Comun (
    id_zona             SERIAL PRIMARY KEY,
    id_conjunto         INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    nombre              VARCHAR(50) NOT NULL,
    capacidad_maxima    INTEGER,
    costo_reserva       NUMERIC(10,2) DEFAULT 0
);

-- ------------------------------------------------------------
-- 12. Reserva
-- ------------------------------------------------------------
CREATE TABLE Reserva (
    id_reserva      SERIAL PRIMARY KEY,
    id_zona         INTEGER NOT NULL REFERENCES Zona_Comun(id_zona),
    id_usuario      INTEGER NOT NULL REFERENCES Usuario(id_usuario),
    id_pago         INTEGER REFERENCES Pago(id_pago), -- 0..1:1, no todas las reservas requieren pago
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente','confirmada','cancelada')),
    CHECK (hora_fin > hora_inicio)
);

-- ------------------------------------------------------------
-- 13. Comunicado  (informativo, masivo)
-- ------------------------------------------------------------
CREATE TABLE Comunicado (
    id_comunicado       SERIAL PRIMARY KEY,
    id_conjunto         INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    id_usuario_autor    INTEGER NOT NULL REFERENCES Usuario(id_usuario),
    titulo              VARCHAR(100) NOT NULL,
    contenido           TEXT NOT NULL,
    fecha_publicacion   TIMESTAMP NOT NULL DEFAULT now(),
    alcance             VARCHAR(20) NOT NULL DEFAULT 'Todos'
                        CHECK (alcance IN ('Todos','Apartamento_Especifico'))
);

-- ------------------------------------------------------------
-- 14. PQR  (bidireccional: peticiones, quejas, reclamos)
-- ------------------------------------------------------------
CREATE TABLE PQR (
    id_pqr              SERIAL PRIMARY KEY,
    id_conjunto         INTEGER NOT NULL REFERENCES Conjunto_Residencial(id_conjunto),
    id_usuario          INTEGER NOT NULL REFERENCES Usuario(id_usuario),      -- quién la radica
    id_usuario_responde INTEGER REFERENCES Usuario(id_usuario),               -- admin que responde
    tipo                VARCHAR(20) NOT NULL
                        CHECK (tipo IN ('Peticion','Queja','Reclamo','Sugerencia')),
    asunto              VARCHAR(100) NOT NULL,
    descripcion         TEXT NOT NULL,
    respuesta           TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT now(),
    fecha_respuesta     TIMESTAMP,
    estado              VARCHAR(20) NOT NULL DEFAULT 'abierto'
                        CHECK (estado IN ('abierto','en_proceso','cerrado'))
);

-- ============================================================
-- Fin del script — 14 tablas, con PK, FK y validaciones básicas
-- ============================================================