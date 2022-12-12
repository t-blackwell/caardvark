CREATE TABLE "user" (
    user_id SERIAL NOT NULL,
    email TEXT NOT NULL,
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_user PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX uk_user_email ON "user"(email);

CREATE TABLE "password" (
    "hash" VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,

    CONSTRAINT fk_password_user_id FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX uk_password_user_id ON "password"(user_id);

CREATE TABLE note (
    note_id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body VARCHAR(MAX) NOT NULL,
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_note PRIMARY KEY (note_id),
    CONSTRAINT fk_note_user_id FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE card_type (
    card_type_id SERIAL NOT NULL,
    name VARCHAR(50),

    CONSTRAINT pk_card_type PRIMARY KEY (card_type_id)
);

CREATE TABLE card_template (
    card_template_id SERIAL NOT NULL,
    card_type_id INTEGER NOT NULL,
    "text" VARCHAR(100),
    text_css VARCHAR(MAX),
    bg_css VARCHAR(MAX),
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_card_template PRIMARY KEY (card_type_id),
    CONSTRAINT fk_card_template_card_type FOREIGN KEY (card_type_id) REFERENCES card_type(card_type_id)
);

CREATE TABLE "card" (
    card_id SERIAL NOT NULL,
    "hash" VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    card_template_id INTEGER NOT NULL,
    "from" VARCHAR(50) NOT NULL,
    "to" VARCHAR(50),
    published_date TIMESTAMP(3),
    deleted VARCHAR(1) NOT NULL DEFAULT 'N',
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_card PRIMARY KEY (id),
    CONSTRAINT fk_card_user FOREIGN KEY (user_id) REFERENCES "user"(user_id),
    CONSTRAINT fk_card_card_template FOREIGN KEY (card_template_id) REFERENCES "card_template"(card_template_id),
    CONSTRAINT ch_card_deleted CHECK (deleted IN ('Y', 'N'))
);