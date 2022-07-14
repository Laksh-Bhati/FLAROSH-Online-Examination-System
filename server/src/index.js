const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

const unKnownError = "ERR000";
const resourceExists = "ERR001";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(authHeader);

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ashish2117",
  database: "flarosh",
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("DB connection done");
  } else {
    console.log("DB connection Failed");
  }
});

// starting the server
app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT);
});

///////=============================User APIs=============================////

app.post("/users", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let user = req.body;

  var sql = "INSERT INTO user values (?, ?, ?, ?, ?, ?, ?)";
  var useId = uuidv4();
  mysqlConnection.query(
    sql,
    [
      useId,
      user.userName,
      user.hallTicketNo,
      user.university,
      user.course,
      user.email,
      user.password,
    ],
    (err, rows, fields) => {
      if (!err) {
        res.send(JSON.stringify({ id: useId }));
      } else {
        res.status(400);
        res.send(getSqlErrorBody(err));
      }
    }
  );
});

app.post("/logins", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var providedEmail = req.body.email;
  var password = req.body.password;

  var sql = "SELECT id, email, password FROM user WHERE email = ?";

  mysqlConnection.query(sql, [providedEmail], (err, rows, fields) => {
    if (rows && rows.length == 1) {
      if (rows[0].password != password) {
        console.log("Pass did not match");
        res.status(401);
        res.send(getErrorBody("ERR002", "Unauth"));
      } else {
        var token = jwt.sign(
          { userId: rows[0].id, email: providedEmail },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_DEFAULT_EXPIRY }
        );
        res.status(200).json({
          jwtToken: token,
        });
      }
    } else {
      console.log("User not found");
      res.status(401);
      res.send(getErrorBody("ERR002", "Unauth"));
    }
  });
});

app.get("/authorizations", authenticateJWT, (req, res) => {
  res.sendStatus(200);
});

///////=====================Question Apis===================////

app.get("/questions/:subject/:serial", authenticateJWT, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var subject = req.params["subject"];
  var serial = req.params["serial"];
  var sql = "SELECT * from question where subject = ? and serial_no = ?;";
  mysqlConnection.query(sql, [subject, serial], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500);
      console.log(err);
    } else if (rows.length > 1) {
      res.sendStatus(400);
    } else {
      res.status(200);
      res.send(rows[0]);
    }
  });
});

app.get("/subjects/:subject/questions/counts", authenticateJWT, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var subject = req.params["subject"];
  var sql = "SELECT count(*) as count from question where subject = ?;";
  console.log(subject);
  mysqlConnection.query(sql, [subject], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500);
      console.log(err);
    } else if (rows.length > 1) {
      res.sendStatus(400);
    } else {
      console.log(rows);
      res.status(200);
      res.send(rows[0]);
    }
  });
});

app.post("/questions/responses", authenticateJWT, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var questionResponse = req.body;
  var responseId = uuidv4();
  var sql = "INSERT INTO response VALUES(?, ?, ?, ?);";
  mysqlConnection.query(
    sql,
    [
      responseId,
      req.user.userId,
      questionResponse.questionId,
      questionResponse.selectedOpt,
    ],
    (err, rows, fields) => {
      if (err) {
        res.sendStatus(500);
        console.log(err);
      } else {
        res.status(200);
        res.send(
          JSON.stringify({
            id: responseId,
          })
        );
      }
    }
  );
});

app.get("/users/me", authenticateJWT, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var sql = "SELECT * from user where id= ?";
  console.log("subject");
  mysqlConnection.query(sql, [req.user.userId], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.status(200);
      var user = JSON.stringify({
        userName: rows[0].username,
        hallTicketNo: rows[0].hall_ticket_no,
        university: rows[0].university,
        course: rows[0].course,
        email: rows[0].email,
      });
      res.send(user);
    }
  });
});

app.get("/users/reports", authenticateJWT, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  var subject = req.query.subject;
  var totalQuestions = 0;
  var userId = req.user.userId;
  if (!subject) {
    res.sendStatus(400);
  }
  var sql =
    "select q.id, q.serial_no, r.selected_option, q.correct_option " +
    "from response r, question q " +
    "where r.user_id = ? " +
    "and q.id = r.question_id " +
    "and q.subject = ? " +
    "order by q.serial_no;";

  var sql2 = "SELECT count(*) as count from question where subject = ?;";
  mysqlConnection.query(sql2, [subject], (err, rows, fields) => {
    if (err) {
      res.sendStatus(500);
      console.log(err);
    } else if (rows.length > 1) {
      res.sendStatus(400);
    } else {
      totalQuestions = rows[0].count;
      mysqlConnection.query(sql, [userId, subject], (err, rows, fields) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.status(200);
          var report = createReport(rows, subject, totalQuestions);
          res.send(JSON.stringify(report));
        }
      });
    }
  });
});

function createReport(rows, subject, totalQuestions) {
  var row = 0;
  var correctResonses = 0;
  while(rows.length > row) {
    if(rows[row].selected_option == rows[row].correct_option) {
      correctResonses = correctResonses + 1;
    }
    row = row + 1;
    console.log(row)
  }
  return {
    correctResonses: correctResonses,
    numberOfAttempts: rows.length,
    subject: subject,
    totalQuestions: totalQuestions
  }
}

////// Utility methods
function getSqlErrorBody(err) {
  if (
    err.sqlMessage.includes("email") &&
    err.sqlMessage.includes("Duplicate")
  ) {
    return getErrorBody(resourceExists, "Email exists");
  } else if (
    err.sqlMessage.includes("username") &&
    err.sqlMessage.includes("Duplicate")
  ) {
    return getErrorBody(resourceExists, "Username exists");
  }

  return getErrorBody(unKnownError, "Some error occured");
}

function getErrorBody(code, message) {
  var errorBody = {
    code: code,
    message: message,
  };
  return JSON.stringify(errorBody);
}
