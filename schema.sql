-- ============================================================
-- LEARN YOU — Raw MySQL Schema
-- Run this directly in MySQL Workbench / phpMyAdmin / CLI
-- OR use Laravel migrations (preferred for dev)
-- ============================================================

CREATE DATABASE IF NOT EXISTS learn_you
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE learn_you;

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE users (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        ENUM('admin', 'instructor', 'student') NOT NULL DEFAULT 'student',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Courses ────────────────────────────────────────────────────
CREATE TABLE courses (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    instructor_id   BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    is_published    TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_instructor_id (instructor_id)
);

-- ── Lessons ────────────────────────────────────────────────────
CREATE TABLE lessons (
    id              BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    course_id       BIGINT UNSIGNED  NOT NULL,
    title           VARCHAR(200)     NOT NULL,
    description     TEXT,
    video_file_id   VARCHAR(255)     NULL,
    video_source    ENUM('google_drive', 'youtube', 'url') DEFAULT 'google_drive',
    sort_order      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lessons_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lessons_course_id (course_id)
);

-- ── Live Sessions ──────────────────────────────────────────────
CREATE TABLE live_sessions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id   BIGINT UNSIGNED NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    join_url    VARCHAR(500)    NOT NULL,
    starts_at   DATETIME        NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_live_sessions_course
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_live_sessions_course_id (course_id)
);

-- ── Enrollments ────────────────────────────────────────────────
CREATE TABLE enrollments (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id  BIGINT UNSIGNED NOT NULL,
    course_id   BIGINT UNSIGNED NOT NULL,
    enrolled_at TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_enrollment (student_id, course_id),

    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,

    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_course  (course_id)
);

-- ── Sanctum personal_access_tokens (created by Laravel) ───────
-- This table is auto-created by: php artisan migrate
-- Shown here for reference only:
--
-- CREATE TABLE personal_access_tokens (
--     id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--     tokenable_type VARCHAR(255)    NOT NULL,
--     tokenable_id   BIGINT UNSIGNED NOT NULL,
--     name           VARCHAR(255)    NOT NULL,
--     token          VARCHAR(64)     NOT NULL UNIQUE,
--     abilities      TEXT,
--     last_used_at   TIMESTAMP       NULL,
--     expires_at     TIMESTAMP       NULL,
--     created_at     TIMESTAMP       NULL,
--     updated_at     TIMESTAMP       NULL,
--     INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
-- );
