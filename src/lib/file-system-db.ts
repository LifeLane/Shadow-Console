import fs from 'fs/promises';
import path from 'path';

// Helper function to ensure the directory exists
async function ensureDirectoryExists(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
}

/**
 * Reads and parses a JSON file from the data directory.
 * @param dbPath The absolute path to the JSON database file.
 * @returns A promise that resolves to the parsed JSON data.
 */
export async function readDb<T>(dbPath: string): Promise<T> {
    try {
        await ensureDirectoryExists(dbPath);
        const fileContent = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(fileContent) as T;
    } catch (error: any) {
        // If the file doesn't exist, return an empty array, which is a common case for new dbs
        if (error.code === 'ENOENT') {
            return [] as T;
        }
        console.error(`Error reading database file at ${dbPath}:`, error);
        throw new Error(`Could not read from ${path.basename(dbPath)}.`);
    }
}

/**
 * Stringifies and writes data to a JSON file in the data directory.
 * @param dbPath The absolute path to the JSON database file.
 * @param data The data to write to the file.
 */
export async function writeDb<T>(dbPath: string, data: T): Promise<void> {
    try {
        await ensureDirectoryExists(dbPath);
        const fileContent = JSON.stringify(data, null, 2);
        await fs.writeFile(dbPath, fileContent, 'utf-8');
    } catch (error) {
        console.error(`Error writing to database file at ${dbPath}:`, error);
        throw new Error(`Could not write to ${path.basename(dbPath)}.`);
    }
}
