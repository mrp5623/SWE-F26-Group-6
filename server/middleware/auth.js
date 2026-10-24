const pool = require("../db");
const { getAuth } = require("@clerk/express");

async function requireUser(req, res, next) {

    //FROM CLERK QUICKSTART:

    const { isAuthenticated, userId } = getAuth(req);

    // If user isn't authenticated, return a 401 error
    if (!isAuthenticated) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    let result = await pool.query("SELECT role from users where clerk_id = $1", [userId]);
    
    if (result.rows.length == 0){
        result = await pool.query("INSERT INTO users (clerk_id, role) VALUES ($1, 'member') RETURNING id, role", [userId]);
    }

    req.userId = result.rows[0].id;
    req.userRole = result.rows[0].role;

    next();
}

function requireAdmin(req, res, next){

    if(req.userRole != "admin"){
        res.status(403).json({ error: 'User is not an administrator' });
        return;
    }

    next();
}

module.exports = { requireUser, requireAdmin };