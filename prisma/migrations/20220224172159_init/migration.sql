CREATE TABLE [user] (
    user_id SERIAL NOT NULL,
    email TEXT NOT NULL,
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_user PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX uk_user_email ON [user](email);

CREATE TABLE [password] (
    [hash] VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,

    CONSTRAINT fk_password_user_id FOREIGN KEY (user_id) REFERENCES [user](user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX uk_password_user_id ON [password](user_id);

CREATE TABLE note (
    note_id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body VARCHAR(MAX) NOT NULL,
    created_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP(3) NOT NULL,

    CONSTRAINT pk_note PRIMARY KEY (note_id),
    CONSTRAINT fk_note_user_id FOREIGN KEY (user_id) REFERENCES [user](user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
