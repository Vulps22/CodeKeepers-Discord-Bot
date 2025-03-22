const express = require('express');
const Database = require('./database');
const { GuildChannel, EmbedBuilder } = require('discord.js');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/review-request', async (req, res) => {
    // Check for a Bearer token in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid bearer token' });
    }

    const token = authHeader.split(' ')[1];

    // Extract URL and username from the request body
    const { url, username } = req.body;
    if (!url || !username) {
        return res.status(400).json({ error: 'Bad Request: missing url or username in body' });
    }

    // For now, simply log the review request details.
    console.log(`Review Request Received:
        Token: ${token}
        URL: ${url}
        Username: ${username}`);

    const db = new Database();

    //verify the token by checking the associated username in the database
    const query = " SELECT * FROM secrets s JOIN users u ON u.id = s.user_id WHERE s.secret = :token";
    results = await db.executeQuery(query, { ":token": token })

    if (results.length === 0 || results[0].github_username !== username) {
        return res.status(401).json({ error: 'Unauthorized: Invalid bearer token.' });
        //TODO: DM THE USER TO LET THEM KNOW THE TOKEN IS INVALID AND WILL BE AUTOMATICALLY DELETED... (ALSO DELETE THE TOKEN lol)
    }

    console.log('Token verified: User', results[0].github_username);

    postReview(results[0], url);

    return res.status(200).json({ message: 'Review request received' });

});

app.post('/release', async (req, res) => {
    // Check for a Bearer token in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid bearer token' });
    }

    const token = authHeader.split(' ')[1];

    // Extract URL and username from the request body
    const { url, username } = req.body;
    if (!url || !username) {
        return res.status(400).json({ error: 'Bad Request: missing url or username in body' });
    }

    // For now, simply log the review request details.
    console.log(`Release Request Received:
        Token: ${token}
        URL: ${url}
        Username: ${username}`);

    const db = new Database();

    //verify the token by checking the associated username in the database
    const query = " SELECT * FROM secrets s JOIN users u ON u.id = s.user_id WHERE s.secret = :token";
    results = await db.executeQuery(query, { ":token": token })

    if (results.length === 0 || results[0].github_username !== username) {
        return res.status(401).json({ error: 'Unauthorized: Invalid bearer token.' });
        //TODO: DM THE USER TO LET THEM KNOW THE TOKEN IS INVALID AND WILL BE AUTOMATICALLY DELETED... (ALSO DELETE THE TOKEN lol)
    }

    console.log('Token verified: User', results[0].github_username);

    postRelease(results[0], url);

    return res.status(200).json({ message: 'Release request received' });

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});

/**
 * Post the review to the Discord channel
 */2
async function postReview(data, url) {
    console.log('Posting review to Discord...');
    console.log(data);
    console.log(url);

    /** @param {GuildChannel} */
    const channel = global.client.channels.cache.get(process.env.REVIEW_CHANNEL);

    
    const reviewmessage = `Pull Request From <@${data.user_id}>: ${url}`;
    channel.send(reviewmessage);
    console.log('Review posted to Discord');
    return;
}

/**
 * Post the review to the Discord channel
 */
async function postRelease(data, url) {
    console.log('Posting review to Discord...');
    console.log(data);
    console.log(url);

    /** @param {GuildChannel} */
    const channel = global.client.channels.cache.get(process.env.RELEASE_CHANNEL);

    
    const releaseMessage = `Release From <@${data.user_id}>: ${url}`;
    channel.send(releaseMessage);
    console.log('Release posted to Discord');
    return;
}