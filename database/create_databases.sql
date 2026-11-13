-- One-time setup of this project's databases on the shared PostgreSQL server (docs/ARCHITECTURE.md §6.1).
-- Safe to run again. Extensions are created here by a superuser, so migrations never need superuser rights.
-- Run against the `postgres` database:
--   psql -v ON_ERROR_STOP=1 -h <host> -p <port> -U <superuser> -d postgres -f database/create_databases.sql

-- CREATE DATABASE has no IF NOT EXISTS, so each statement is only generated (\gexec) when the database is missing.
-- template0 is the pristine template: on a shared server, objects other projects added to template1 are not inherited.
SELECT 'CREATE DATABASE umimaclean_dev TEMPLATE template0' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'umimaclean_dev')\gexec
SELECT 'CREATE DATABASE umimaclean_dev_test TEMPLATE template0' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'umimaclean_dev_test')\gexec

-- postgis: service areas (AREA-1) and pins; pg_trgm and unaccent: place search in the osm schema (MAP-1).
\connect umimaclean_dev
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

\connect umimaclean_dev_test
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
