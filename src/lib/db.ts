'use server';

import postgres from 'postgres';

function getClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set.');
    }

    // By setting idle_timeout to undefined, we can avoid the "Error: Connection ended"
    // issue that can occur in serverless environments.
    const sql = postgres(connectionString, {
        idle_timeout: undefined,
        transform: {
            // Transform numeric and bigint types from strings to numbers.
            // This is safe for this application's purposes.
            numeric: parseFloat,
            bigint: parseInt,
        },
    });
    return sql;
}

const sql = getClient();

export default sql;