const Database = require('./database.js');

const db = new Database();

const parameters = {
    ":name": "jamie",
    ":id": 1
};

const query = "SELECT * FROM users WHERE name = :name AND id = :id";

const escaped = db.escape(parameters);
console.log(escaped);

const result = db.parameterize(query, escaped);
console.log(result);

expectedOutput = "SELECT * FROM users WHERE name = 'jamie' AND id = 1";

console.log(result === expectedOutput ? "✅ Test passed" : "❌ Test failed");