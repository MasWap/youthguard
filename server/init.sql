-- Création de la table des administrateurs
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NOT NULL UNIQUE
);

-- Création de la table des tags (mots à filtrer)
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255) NOT NULL UNIQUE
);

-- Création de la table des enfants avec la colonne is_active pour indiquer si un compte est actif
CREATE TABLE kids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    birth_date DATE,
    is_active BOOLEAN DEFAULT FALSE, -- Par défaut, le compte est actif
    max_time INT DEFAULT 3600, -- Temps maximum de visionnage par défaut (1 heure)
    uuid VARCHAR(36) UNIQUE, -- Colonne pour stocker l'UUID
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES admins (id)
);

-- Création de la table de relation entre les enfants et les tags (many-to-many)
CREATE TABLE kids_tags (
    kid_id INT,
    tag_id INT,
    PRIMARY KEY (kid_id, tag_id),
    FOREIGN KEY (kid_id) REFERENCES kids (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Insertion de l'administrateur avec les données fournies
INSERT INTO
    admins (
        username,
        password,
        ip_address
    )
VALUES (
        'test',
        '$2a$10$jPZTP7Ol8DcvtqOD/1fIG.kpZXcAIvYwIvNCQ0KxPw8TcJXOYRw/a',
        '195.15.137.164'
    );

-- Insertion des tags (mots à filtrer)
INSERT INTO
    tags (libelle)
VALUES ('Violence'),
    ('Drogue'),
    ('Horreur'),
    ('Bagage');

-- Insertion des enfants avec is_active indiquant s'ils sont actifs ou non
INSERT INTO
    kids (
        username,
        birth_date,
        is_active,
        max_time,
        admin_id
    )
VALUES (
        'Alice',
        '2011-04-12',
        FALSE,
        3600,
        1
    ),
    (
        'Bob',
        '2012-09-20',
        FALSE,
        340,
        1
    ),
    (
        'Charlie',
        '2010-02-18',
        TRUE,
        60,
        1
    );

-- Association des enfants avec des tags (mots à filtrer)
INSERT INTO
    kids_tags (kid_id, tag_id)
VALUES (1, 1),
    (1, 4),
    (2, 2),
    (2, 3),
    (3, 1),
    (3, 3);