const mysql = require('mysql2/promise');

class Database {
    /**
     * Connect to the database using mysql2
     * @returns {Promise<mysql.Connection>} The connection
     */
    async connect() {
        console.log('Connecting to the database...');
        // Await the creation of the connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        return connection;
    }

    /**
     * Execute a parameterized query against the database.
     * @param {string} query The SQL query with named parameters (e.g., :name)
     * @param {Object} params An object of parameters (e.g., { name: "jamie", id: 1 })
     * @returns {Promise<*>} The query results
     */
    async executeQuery(query, params = {}) {
        // Convert parameters to a consistent format: add a colon prefix if missing and escape the value.
        const parameters = this.escape(params);
        // Replace named parameters in the query with the escaped values.
        const parameterizedQuery = this.parameterize(query, parameters);

        // Get a connection
        const conn = await this.connect();
        try {
            // Execute the query; using the promise-based API, we don't need a callback.
            const [results, fields] = await conn.query(parameterizedQuery);
            await conn.end();
            return results;
        } catch (err) {
            await conn.end();
            throw err;
        }
    }

    /**
     * Escape values in the data object.
     * @param {Object} data 
     * @returns {Object} Object with keys starting with a colon and escaped values.
     */
    escape(data = {}) {
        let output = [];
        for (const [key, value] of Object.entries(data)) {
            output[key] = mysql.escape(value);
        }
        return output;
    }
    

    /**
     * Replace named parameters in the query with their escaped values.
     * @param {string} query 
     * @param {Object} data 
     * @returns {string}
     */
    parameterize(query, data = {}) {
        let output = query;
        for (const [key, value] of Object.entries(data)) {
            output = output.replace(key, value);
        }
        return output;
    }

}

module.exports = Database;
