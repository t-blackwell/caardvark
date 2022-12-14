CREATE TABLE "user" (
    user_id SERIAL NOT NULL,
    email VARCHAR(200) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    body VARCHAR(4000) NOT NULL,
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_note PRIMARY KEY (note_id),
    CONSTRAINT fk_note_user_id FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE card_type (
    card_type_id SERIAL NOT NULL,
    name VARCHAR(50),

    CONSTRAINT pk_card_type PRIMARY KEY (card_type_id)
);

CREATE TABLE card_template (
    card_template_id SERIAL NOT NULL,
    card_type_id INTEGER NOT NULL,
    "text" VARCHAR(100),
    text_css VARCHAR(4000),
    bg_css VARCHAR(4000),
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_card_template PRIMARY KEY (card_template_id),
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
    updated_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_card PRIMARY KEY (card_id),
    CONSTRAINT uk_card_hash UNIQUE ("hash"),
    CONSTRAINT fk_card_user FOREIGN KEY (user_id) REFERENCES "user"(user_id),
    CONSTRAINT fk_card_card_template FOREIGN KEY (card_template_id) REFERENCES "card_template"(card_template_id),
    CONSTRAINT ch_card_deleted CHECK (deleted IN ('Y', 'N'))
);

CREATE TABLE color (
    color_id SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    hex VARCHAR(8),

    CONSTRAINT pk_color PRIMARY KEY (color_id)
);

CREATE TABLE font (
    font_id SERIAL NOT NULL,
    "name" VARCHAR(100),

    CONSTRAINT pk_font PRIMARY KEY (font_id)
);

CREATE TABLE "message" (
    message_id SERIAL NOT NULL,
    card_id INTEGER NOT NULL,
    "from" VARCHAR(50) NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    color_id INTEGER NOT NULL,
    font_id INTEGER NOT NULL,
    image_url VARCHAR(500),
    deleted VARCHAR(1) NOT NULL DEFAULT 'N',
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_message PRIMARY KEY (message_id),
    CONSTRAINT fk_message_card FOREIGN KEY (card_id) REFERENCES card(card_id),
    CONSTRAINT fk_message_color FOREIGN KEY (color_id) REFERENCES color(color_id),
    CONSTRAINT fk_message_font FOREIGN KEY (font_id) REFERENCES font(font_id),
    CONSTRAINT ch_message_deleted CHECK (deleted IN ('Y', 'N'))
);