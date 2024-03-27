const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const initializeSocket = require("./socket/socketConnection");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

const db = mysql.createConnection({
  host: "localhost",
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: "tawk_chat_app",
  charset: "Utf8mb4",
});

// mail transporter creation
const createMailTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "ramunaidu2023@outlook.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
};

// send verification mail
const sendVerificationMail = (user) => {
  const transporter = createMailTransporter();

  const mailOptions = {
    from: "Tawk Chat App <ramunaidu2023@outlook.com>",
    to: user.email,
    subject: "Verify your email...",
    html: `<p>Hello ${user.name}, verify your email with OTP</p>
    <h1>${user.otp}</h1>
    <p>This OTP is valid only 10 minutes</p>
    `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("OTP sent successfully");
    }
  });
};

// storing image using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });

// authentication

app.put("/auth/send-otp", async (req, res) => {
  const { email, name } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiryTime = Date.now() + 60 * 1000 * 10;
  const otpExpiry = otpExpiryTime.toString();
  const hashedOtp = await bcrypt.hash(otp.toString(), 10);
  const createUserQuery =
    "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
  db.query(createUserQuery, [hashedOtp, otpExpiry, email], (err, result) => {
    if (err) {
      res.send({
        msg: "Something went wrong try after some time",
        status: 400,
      });
    } else {
      sendVerificationMail({ name, email, otp });
      res.send({ msg: "Verification code sent successful", status: 200 });
    }
  });
});

app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(getUserQuery, [email], async (err, userResult) => {
    if (err) {
      res.send({
        msg: "Something went wrong try again later",
        status: 400,
      });
    } else {
      if (userResult.length) {
        res.send({
          msg: "Email Address already exists",
          status: 400,
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiryTime = Date.now() + 60 * 60 * 1000 * 10;
        const otpExpiry = otpExpiryTime.toString();
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        const createUserQuery =
          "INSERT INTO users (name, email, password, otp, is_verified, otp_expiry) VALUES (?, ? ,?, ?, ?, ?)";
        db.query(
          createUserQuery,
          [name, email, hashedPassword, hashedOtp, false, otpExpiry],
          (err, result) => {
            if (err) {
              res.send({
                msg: "Email Address already exists",
                status: 400,
              });
            } else {
              sendVerificationMail({ name, email, otp });
              res.send({ msg: "Registration successful", status: 200 });
            }
          }
        );
      }
    }
  });
});

app.put("/auth/verify-otp", (req, res) => {
  const { otp, email } = req.body;
  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(getUserQuery, [email], async (err, userResult) => {
    if (err) {
      res.send({
        msg: "Email Address already exists",
        status: 400,
      });
    } else {
      if (userResult.length) {
        if (parseInt(userResult[0].otp_expiry) < parseInt(Date.now())) {
          res.send({ msg: "Verification code expired", status: 401 });
        } else {
          isOtpCorrect = await bcrypt.compare(otp, userResult[0].otp);
          if (isOtpCorrect) {
            const updateUserDetails =
              "UPDATE users SET otp = ?, otp_expiry = ?, is_verified = ? WHERE user_id = ?";
            db.query(updateUserDetails, [
              null,
              null,
              true,
              userResult[0].user_id,
            ]);
            res.send({ msg: "Email verification successfull", status: 200 });
          } else {
            res.send({ msg: "Invalid verification code", status: 400 });
          }
        }
      }
    }
  });
});

app.put("/auth/login", (req, res) => {
  const { password, email } = req.body;
  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(getUserQuery, [email], async (err, userResult) => {
    if (err) {
      res.send({
        msg: "Something went wrong please try again later",
        status: 400,
      });
    } else {
      if (userResult.length) {
        const isPasswordCorrect = await bcrypt.compare(
          password,
          userResult[0].password
        );
        if (isPasswordCorrect) {
          if (userResult[0].is_verified) {
            const jwtToken = jwt.sign(
              { username: userResult[0].name },
              "Ramunaidu"
            );
            res.send({
              msg: "Login successful",
              userDetails: {
                user_id: userResult[0].user_id,
                email: userResult[0].email,
                jwt_token: jwtToken,
              },
              status: 200,
            });
          } else {
            // send OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiryTime = new Date() + 60 * 1000 * 10;
            const otpExpiry = otpExpiryTime.toString();
            const hashedOtp = await bcrypt.hash(otp.toString(), 10);
            const updateUserQuery =
              "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
            db.query(
              updateUserQuery,
              [hashedOtp, otpExpiry, email],
              (err, result) => {
                if (err) {
                  res.send({
                    msg: "Something went wrong try after some time",
                    status: 400,
                  });
                } else {
                  sendVerificationMail({
                    name: userResult[0].name,
                    email: userResult[0].email,
                    otp,
                  });
                  res.send({
                    msg: "Verification code sent successful",
                    userDetails: userResult[0],
                    status: 201,
                  });
                }
              }
            );
          }
        } else {
          res.send({ msg: "Password is incorrect", status: 400 });
        }
      } else {
        res.send({ msg: "Email is not registered", status: 400 });
      }
    }
  });
});

app.put("/auth/reset-password", (req, res) => {
  const { email } = req.body;
  const getUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(getUserQuery, [email], async (err, userResult) => {
    if (err) {
      res.send({
        msg: "Something went wrong please try again later",
        status: 400,
      });
    } else {
      if (userResult.length) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiryTime = Date.now() + 60 * 1000 * 10;
        const otpExpiry = otpExpiryTime.toString();
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        const updateUserQuery =
          "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
        db.query(
          updateUserQuery,
          [hashedOtp, otpExpiry, email],
          (err, result) => {
            if (err) {
              res.send({
                msg: "Something went wrong try after some time",
                status: 400,
              });
            } else {
              sendVerificationMail({
                name: userResult[0].name,
                email: userResult[0].email,
                otp,
              });
              res.send({
                msg: "Verification code sent successful",
                userDetails: { ...userResult[0], type: "reset" },
                status: 201,
              });
            }
          }
        );
      } else {
        res.send({ msg: "Email is not registred" });
      }
    }
  });
});

app.put("/auth/new-password", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const updateUserQuery = "UPDATE users SET password = ? WHERE email = ?";
  db.query(updateUserQuery, [hashedPassword, email], (err, result) => {
    if (err) {
      res.send({
        msg: "Something went wrong please try again later",
        status: 400,
      });
    } else {
      res.send({ msg: "Password updated successfully", status: 200 });
    }
  });
});

app.put("/auth/update-profile", (req, res) => {
  const { userId, profileImage, name, about, phone } = req.body;
  if (profileImage) {
    const getUserQuery = "SELECT profile_image FROM users WHERE user_id = ?";
    db.query(getUserQuery, [parseInt(userId)], (err, userResult) => {
      if (err) {
        res.send({
          msg: "Something went wrong please try again later",
          status: 400,
        });
      } else {
        let isImageAlready = false;
        if (userResult[0].profile_image) {
          isImageAlready = userResult[0].profile_image.startsWith("image_");
        }
        if (isImageAlready) {
          fs.unlinkSync(`./uploads/images/${userResult[0].profile_image}`);
        }
        const updateQuery =
          "UPDATE users SET name = ?, profile_image = ?, about = ?, phone = ? WHERE user_id = ?";
        db.query(
          updateQuery,
          [name, profileImage, about, phone, parseInt(userId)],
          (err, result) => {
            if (err) {
              res.send({
                msg: "Something went wrong please try again later",
                status: 400,
              });
            } else {
              res.send({ status: 200, msg: "Profile updated successfully" });
            }
          }
        );
      }
    });
  } else {
    const updateQuery =
      "UPDATE users SET name = ?, profile_image = ?, about = ?, phone = ? WHERE user_id = ?";
    db.query(
      updateQuery,
      [name, profileImage, about, phone, parseInt(userId)],
      (err, result) => {
        if (err) {
          res.send({
            msg: "Something went wrong please try again later",
            status: 400,
          });
        } else {
          res.send({ status: 200, msg: "Profile updated successfully" });
        }
      }
    );
  }
});

app.put("/auth/block-or-unblock-user", (req, res) => {
  const { userId, blockUserId, type } = req.body;
  const getBlockUserQuery =
    "SELECT blocked_users FROM user_privacy WHERE user_id = ?";
  db.query(getBlockUserQuery, [parseInt(userId)], (err, blockedUsers) => {
    if (err) {
      res.send({
        msg: "Something went wrong please try again later",
        status: 400,
      });
    } else {
      let blockedList = JSON.parse(blockedUsers[0].blocked_users);
      if (type === "block") {
        blockedList.push(parseInt(blockUserId));
      } else {
        blockedList = blockedList.filter((id) => id !== parseInt(blockUserId));
      }

      const updateUserQuery =
        "UPDATE user_privacy SET blocked_users = ? WHERE user_id = ?";
      db.query(
        updateUserQuery,
        [JSON.stringify(blockedList), parseInt(userId)],
        (err, result) => {
          if (err) {
            res.send({
              msg: "Something went wrong please try again later",
              status: 400,
            });
          } else {
            db.query(
              getBlockUserQuery,
              [parseInt(userId)],
              (err, updatedBlockedUsers) => {
                if (err) {
                  res.send({
                    msg: "Something went wrong please try again later",
                    status: 400,
                  });
                } else {
                  res.send({
                    status: 200,
                    blockedUsers: JSON.parse(
                      updatedBlockedUsers[0].blocked_users
                    ),
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

// getting users

app.get("/get-users/:userId", (req, res) => {
  const { userId } = req.params;
  const getUsersQuery =
    "SELECT user_id, name, profile_image, email, about, phone FROM users WHERE user_id <> ?";
  db.query(getUsersQuery, [parseInt(userId)], (err, usersResult) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      const getRequestsQuery = `
    SELECT sender_id FROM requests WHERE receiver_id = ? AND status = ?
  `;
      db.query(
        getRequestsQuery,
        [parseInt(userId), "sent"],
        (err, requestsResult) => {
          if (err) {
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            const getFriendsQuery =
              "SELECT friends FROM user_privacy WHERE user_id = ?";
            db.query(
              getFriendsQuery,
              [parseInt(userId)],
              (err, friendsResult) => {
                if (err) {
                  res.send({
                    status: 400,
                    msg: "Something went wrong please try again later",
                  });
                } else {
                  const getSentRequestsQuery = `
                    SELECT receiver_id FROM requests WHERE sender_id = ? AND status = ?
                  `;
                  db.query(
                    getSentRequestsQuery,
                    [parseInt(userId), "sent"],
                    (err, sentResult) => {
                      if (err) {
                        res.send({
                          status: 400,
                          msg: "Something went wrong please try again later",
                        });
                      } else {
                        let friendsIds = [];
                        if (friendsResult.length > 0) {
                          friendsIds = JSON.parse(friendsResult[0].friends);
                        }
                        const requestsIds = requestsResult.map(
                          (req) => req.sender_id
                        );

                        const sentRequestsIds = sentResult.map(
                          (req) => req.receiver_id
                        );
                        res.send({
                          status: 200,
                          requestsDetails: requestsIds,
                          friendsDetails: friendsIds,
                          sentRequestsDetails: sentRequestsIds,
                          users: usersResult,
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

app.get("/get-user/:email", (req, res) => {
  const { email } = req.params;
  const getUsersQuery =
    "SELECT user_id, name, email, profile_image, about, phone FROM users WHERE email = ?";
  db.query(getUsersQuery, [email], (err, result) => {
    if (err) {
      res.send({ msg: "Something went wrong", status: 400 });
    } else {
      res.send({ status: 200, user: result[0] });
    }
  });
});

app.get("/get-joined-groups/:userId", (req, res) => {
  const { userId } = req.params;
  const getGroupsQuery =
    "SELECT * FROM tawk_chat_app.groups WHERE admin = ? OR JSON_CONTAINS(members, ?)";
  db.query(
    getGroupsQuery,
    [parseInt(userId), JSON.stringify([parseInt(userId)])],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        let createdGroups = [];
        let joinedGroups = [];

        result.forEach((group) => {
          if (group.admin === parseInt(userId)) {
            createdGroups.push(group);
          } else {
            joinedGroups.push(group);
          }
        });

        res.send({ status: 200, createdGroups, joinedGroups });
      }
    }
  );
});

app.get("/get-group-users/:admin/:members", (req, res) => {
  const { members, admin } = req.params;
  const membersList = JSON.parse(members);
  membersList.push(parseInt(admin));
  const string = "?,".repeat(membersList.length);
  const reqString = string.slice(0, string.length - 1);
  const getUsersQuery = `SELECT * FROM users WHERE user_id IN (${reqString})`;
  db.query(getUsersQuery, membersList, (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({ status: 200, membersDetails: result });
    }
  });
});

app.get("/get-block-users-ids/:userId", (req, res) => {
  const { userId } = req.params;
  const getBlockQuery =
    "SELECT blocked_users FROM user_privacy WHERE user_id = ?";
  db.query(getBlockQuery, [parseInt(userId)], (err, resultArray) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({
        status: 200,
        blockUsers: JSON.parse(resultArray[0].blocked_users),
      });
    }
  });
});

// friend requests

app.post("/send-friend-request", (req, res) => {
  const { from, to } = req.body;
  const sendRequestQuery =
    "INSERT INTO requests (sender_id, receiver_id, status) VALUES (?,?,?)";
  db.query(
    sendRequestQuery,
    [parseInt(from), parseInt(to), "sent"],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        res.send({
          msg: "Request sent successfull",
          status: 200,
          requestId: result.insertId,
        });
      }
    }
  );
});

app.get("/get-friend-requests/:userId", (req, res) => {
  const { userId } = req.params;
  const getRequestsQuery = `
    SELECT 
      r.request_id AS requestId,
      r.sender_id As senderId,
      u.name AS senderName,
      u.profile_image AS senderProfileImage,
      u.about,
      u.phone,
      u.email
    FROM
      requests r
    JOIN
      users u ON r.sender_id = u.user_id
    WHERE
      (r.receiver_id = ? AND r.status = ?)
  `;
  db.query(getRequestsQuery, [parseInt(userId), "sent"], (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      const getSentRequestsQuery = `
        SELECT receiver_id FROM requests WHERE sender_id = ? AND status = ?
      `;
      db.query(
        getSentRequestsQuery,
        [parseInt(userId), "sent"],
        (err, sentResult) => {
          if (err) {
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            const sentRequestsIds = sentResult.map((req) => req.receiver_id);
            res.send({
              status: 200,
              requestsDetails: result,
              sentRequestsDetails: sentRequestsIds,
            });
          }
        }
      );
    }
  });
});

app.put("/accept-friend-request", (req, res) => {
  const { requestId, sender, receiver } = req.body;
  const updateRequestQuery =
    "UPDATE requests SET status = ? WHERE request_id = ?";
  db.query(
    updateRequestQuery,
    ["accept", parseInt(requestId)],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const friendsQuery =
          "SELECT user_id, friends FROM user_privacy WHERE user_id IN (?, ?)";
        db.query(
          friendsQuery,
          [parseInt(sender), parseInt(receiver)],
          (err, friendsResult) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later",
              });
            } else {
              if (friendsResult.length === 0) {
                const postQuery = `
              INSERT INTO
                user_privacy (user_id, friends, pinned_users, blocked_users)
              VALUES
                (?, ?, ?, ?),
                (?, ?, ?, ?)
              `;
                const emptyValue = JSON.stringify([]);
                db.query(
                  postQuery,
                  [
                    parseInt(sender),
                    JSON.stringify([parseInt(receiver)]),
                    emptyValue,
                    emptyValue,
                    parseInt(receiver),
                    JSON.stringify([parseInt(sender)]),
                    emptyValue,
                    emptyValue,
                  ],
                  (err, postResult) => {
                    if (err) {
                      res.send({
                        status: 400,
                        msg: "Something went wrong please try again later",
                      });
                    } else {
                      res.send({
                        status: 200,
                        msg: "Friends updated successful",
                      });
                    }
                  }
                );
              } else if (friendsResult.length === 1) {
                const alreadyAddedUserId = friendsResult[0].user_id;
                const addUserId =
                  alreadyAddedUserId === parseInt(sender)
                    ? parseInt(receiver)
                    : parseInt(sender);
                const addFriendUserId =
                  addUserId === parseInt(sender)
                    ? parseInt(receiver)
                    : parseInt(sender);
                const addNewUserQuery =
                  "INSERT INTO user_privacy (user_id, friends, pinned_users, blocked_users) VALUES (?, ?, ?, ?)";
                const emptyValue = JSON.stringify([]);
                db.query(
                  addNewUserQuery,
                  [
                    addUserId,
                    JSON.stringify([addFriendUserId]),
                    emptyValue,
                    emptyValue,
                  ],
                  (err, postResult) => {
                    if (err) {
                      res.send({
                        status: 400,
                        msg: "Something went wrong please try again later",
                      });
                    } else {
                      const friends = JSON.stringify([
                        ...JSON.parse(friendsResult[0].friends),
                        addUserId,
                      ]);
                      const updateQuery =
                        "UPDATE user_privacy SET friends = ? WHERE user_id = ?";
                      db.query(
                        updateQuery,
                        [friends, alreadyAddedUserId],
                        (err, updateResult) => {
                          if (err) {
                            res.send({
                              status: 400,
                              msg: "Something went wrong please try again later",
                            });
                          } else {
                            res.send({
                              status: 200,
                              msg: "Friends updated successful",
                            });
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                const senderFriends = JSON.parse(friendsResult[0].friends);
                const receiverFriends = JSON.parse(friendsResult[1].friends);
                const senderTotal = JSON.stringify([
                  ...senderFriends,
                  parseInt(receiver),
                ]);
                const receiverTotal = JSON.stringify([
                  ...receiverFriends,
                  parseInt(sender),
                ]);

                const updatefriendsQuery = `
              UPDATE user_privacy
              SET friends =
                CASE
                  WHEN user_id = ? THEN ?
                  WHEN user_id = ? THEN ?
                  ELSE friends
                END
              WHERE user_id IN (?,?) 
            `;

                db.query(
                  updatefriendsQuery,
                  [
                    parseInt(sender),
                    senderTotal,
                    parseInt(receiver),
                    receiverTotal,
                    parseInt(sender),
                    parseInt(receiver),
                  ],
                  (err, result) => {
                    if (err) {
                      res.send({
                        status: 400,
                        msg: "Something went wrong please try again later",
                      });
                    } else {
                      res.send({
                        status: 200,
                        msg: "Friends updated successful",
                      });
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
  );
});

app.delete("/reject-friend-request", (req, res) => {
  const { requestId } = req.body;
  const updateRequestQuery = "DELETE FROM requests WHERE request_id = ?";
  db.query(updateRequestQuery, [parseInt(requestId)], (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({ status: 200, msg: "Friend request rejected" });
    }
  });
});

app.get("/get-friends/:userId", (req, res) => {
  const { userId } = req.params;
  const getFriendsQuery = `
    SELECT friends FROM user_privacy WHERE user_id = ?
  `;
  db.query(getFriendsQuery, [parseInt(userId)], (err, friendsResult) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      if (
        friendsResult.length > 0 &&
        JSON.parse(friendsResult[0].friends).length > 0
      ) {
        const friends = JSON.parse(friendsResult[0].friends);
        const string = "?,".repeat(friends.length);
        const reqString = string.slice(0, string.length - 1);
        const getFriends = `SELECT user_id, name, profile_image, about, phone FROM users WHERE user_id IN (${reqString})`;

        db.query(getFriends, friends, (err, result) => {
          if (err) {
            console.log(err);
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            res.send({ status: 200, friendsDetails: result });
          }
        });
      } else {
        res.send({ status: 200, friendsDetails: [] });
      }
    }
  });
});

app.put("/remove-friend", (req, res) => {
  const { userId, friendId } = req.body;
  const getFriendsQuery =
    "SELECT user_id, friends FROM user_privacy WHERE user_id IN (?, ?)";
  db.query(
    getFriendsQuery,
    [parseInt(userId), parseInt(friendId)],
    (err, friendsResult) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        let userFriends = [];
        let friendFriends = [];

        if (parseInt(userId) < parseInt(friendId)) {
          userFriends = JSON.parse(friendsResult[0].friends).filter(
            (id) => id !== parseInt(friendId)
          );
          friendFriends = JSON.parse(friendsResult[1].friends).filter(
            (id) => id !== parseInt(userId)
          );
        } else {
          userFriends = JSON.parse(friendsResult[1].friends).filter(
            (id) => id !== parseInt(friendId)
          );
          friendFriends = JSON.parse(friendsResult[0].friends).filter(
            (id) => id !== parseInt(userId)
          );
        }
        const updateFriendsQuery = `
        UPDATE
          user_privacy
        SET friends =
          CASE
            WHEN user_id = ? THEN ?
            WHEN user_id = ? THEN ?
            ELSE friends
          END
        WHERE user_id IN (?, ?)
        `;
        db.query(
          updateFriendsQuery,
          [
            parseInt(userId),
            JSON.stringify(userFriends),
            parseInt(friendId),
            JSON.stringify(friendFriends),
            parseInt(userId),
            parseInt(friendId),
          ],
          (err, result) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later",
              });
            } else {
              const deleteRequestsQuery =
                "DELETE FROM requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)";
              db.query(
                deleteRequestsQuery,
                [
                  parseInt(userId),
                  parseInt(friendId),
                  parseInt(friendId),
                  parseInt(userId),
                ],
                (err, result) => {
                  console.log(err);
                  if (err) {
                    res.send({
                      status: 400,
                      msg: "Something went wrong please try again later",
                    });
                  } else {
                    res.send({ status: 200, msg: "User removed successfully" });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

// messages

// image uploading
app.post("/image-upload", upload.single("image"), (req, res) => {
  if (req.file) {
    res.send({
      msg: "Image upload successful",
      status: 200,
      fileName: req.file.filename,
    });
  } else {
    res.send({ msg: "Image uploading failed", status: 400 });
  }
});

app.post("/messages/send-message", (req, res) => {
  const { from, to, message, type, isOnline, caption, chatUserBlockedUsers } =
    req.body;
  const isBlockedMe = chatUserBlockedUsers.includes(parseInt(from));
  const dateTime = new Date();
  const status = isBlockedMe ? "sent" : isOnline ? "delivered" : "sent";
  const msgType = isBlockedMe ? "block" : type;
  const sendMessageQuery =
    "INSERT INTO messages (message, sender_id, receiver_id, type, message_status, created_at, caption) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sendMessageQuery,
    [message, parseInt(from), parseInt(to), msgType, status, dateTime, caption],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const getMessageQuery = "SELECT * FROM messages WHERE message_id = ?";
        db.query(
          getMessageQuery,
          [parseInt(result.insertId)],
          (err, messageResult) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later",
              });
            } else {
              res.send({
                status: 200,
                msg: "Message sent successful",
                sentMessage: messageResult[0],
              });
            }
          }
        );
      }
    }
  );
});

app.get("/messages/get-messages/:from/:to", (req, res) => {
  const { from, to } = req.params;
  const getMessagesQuery =
    "SELECT * FROM messages WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND type IN (?, ?, ?, ?) ORDER BY message_id ASC";
  db.query(
    getMessagesQuery,
    [
      parseInt(from),
      parseInt(to),
      parseInt(to),
      parseInt(from),
      "text",
      "image",
      "url",
      "block",
    ],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        res.send({
          status: 200,
          msg: "Messages fetched successfully",
          messages: result,
        });
      }
    }
  );
});

// call history
app.get("/messages/get-call-history/:userId", (req, res) => {
  const { userId } = req.params;
  const getMessagesQuery =
    "SELECT * FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND type IN (?, ?) ORDER BY message_id DESC";
  db.query(
    getMessagesQuery,
    [parseInt(userId), parseInt(userId), "Voice call", "Video call"],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const callLogHistory = [];

        result.forEach((callLog) => {
          const { message, created_at, type, sender_id, receiver_id } = callLog;
          const {
            senderId,
            senderName,
            senderProfileImage,
            receiverId,
            receiverName,
            receiverProfileImage,
          } = JSON.parse(message);
          let user;
          if (senderId === parseInt(userId)) {
            user = {
              userId: receiverId,
              name: receiverName,
              profileImage: receiverProfileImage,
              createdAt: created_at,
              type,
              senderId: sender_id,
              receiverId: receiver_id,
            };
          } else {
            user = {
              userId: senderId,
              name: senderName,
              profileImage: senderProfileImage,
              createdAt: created_at,
              type,
              senderId: sender_id,
              receiverId: receiver_id,
            };
          }
          callLogHistory.push(user);
        });

        res.send({
          status: 200,
          msg: "Messages fetched successfully",
          callLogHistory,
        });
      }
    }
  );
});

app.put("/messages/update-message-status", (req, res) => {
  const { messageIds, status } = req.body;
  const string = "?,".repeat(messageIds.length);
  const reqStrings = string.slice(0, string.length - 1);
  let updateStatusQuery = `
  UPDATE
   messages 
  SET 
    message_status = "delivered"
  WHERE 
    message_id IN (${reqStrings})
  `;
  if (status === "read") {
    updateStatusQuery = `
  UPDATE
   messages 
  SET 
    message_status = "read"
  WHERE 
    message_id IN (${reqStrings})
  `;
  }
  db.query(updateStatusQuery, messageIds, (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({
        status: 200,
        msg: "Messages status updated successfully",
      });
    }
  });
});

app.delete("/messages/delete-messages", (req, res) => {
  const { messageIds, images } = req.body;
  const string = "?,".repeat(messageIds.length);
  const reqString = string.slice(0, string.length - 1);
  const deleteMessages = `DELETE FROM messages WHERE message_id IN (${reqString})`;
  db.query(deleteMessages, messageIds, (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      if (images.length > 0) {
        images.forEach((img) => fs.unlinkSync(`./uploads/images/${img}`));
      }
      res.send({ msg: "Messages deleted successfully", status: 200 });
    }
  });
});

// chats
app.get("/chat/get-all-chat-users/:userId", (req, res) => {
  const { userId } = req.params;
  const getChatsQuery = `
    SELECT
      sender.user_id AS senderId,
      sender.name AS senderName,
      sender.profile_image AS senderProfileImage,
      sender.about AS senderAbout,
      sender.phone AS senderPhone,
      receiver.user_id AS receiverId,
      receiver.name AS receiverName,
      receiver.profile_image AS receiverProfileImage,
      receiver.about AS receiverAbout,
      receiver.phone AS receiverPhone,
      m.message_id AS messageId,
      m.message_status AS messageStatus,
      m.message,
      m.type AS messageType,
      m.created_at AS createdAt
    FROM
      messages m JOIN users sender ON sender.user_id = m.sender_id
      JOIN users receiver ON receiver.user_id = m.receiver_id
    WHERE
      (m.sender_id = ? OR m.receiver_id = ?) AND type IN (?, ?, ?, ?)
  `;
  db.query(
    getChatsQuery,
    [parseInt(userId), parseInt(userId), "text", "image", "url", "block"],
    (err, chatsResult) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const getPinnedUsers =
          "SELECT pinned_users, blocked_users FROM user_privacy WHERE user_id = ?";
        db.query(
          getPinnedUsers,
          [parseInt(userId)],
          (err, pinnedAndBlockedUsers) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later",
              });
            } else {
              if (chatsResult.length < 1) {
                res.send({
                  status: 200,
                  allChatUsers: [],
                  allPinnedUsers: [],
                  messagesInSentStatus: [],
                  pinnedUsers: [],
                  blockedUsers: [],
                });
              } else {
                chatsResult.sort((a, b) => b.messageId - a.messageId);

                const users = new Map();
                const messagesInSentStatus = [];
                chatsResult.forEach((msg) => {
                  const {
                    messageId,
                    message,
                    messageType,
                    messageStatus,
                    senderId,
                    receiverId,
                    createdAt,
                  } = msg;
                  const isSender = senderId === parseInt(userId);
                  const calculatedId = isSender ? receiverId : senderId;

                  if (messageStatus === "sent" && messageType !== "block") {
                    messagesInSentStatus.push(messageId);
                  }
                  if (
                    !users.get(calculatedId) &&
                    (isSender || messageType !== "block")
                  ) {
                    let user = {
                      messageId,
                      message,
                      messageType,
                      messageStatus,
                      senderId,
                      receiverId,
                      createdAt,
                    };
                    if (isSender) {
                      user = {
                        ...user,
                        userId: msg.receiverId,
                        name: msg.receiverName,
                        about: msg.receiverAbout,
                        profileImage: msg.receiverProfileImage,
                        phone: msg.receiverPhone,
                        totalUnreadMessages: [],
                      };
                    } else {
                      user = {
                        ...user,
                        userId: msg.senderId,
                        name: msg.senderName,
                        about: msg.senderAbout,
                        profileImage: msg.senderProfileImage,
                        phone: msg.senderPhone,
                        totalUnreadMessages:
                          msg.messageStatus !== "read" &&
                          messageType !== "block"
                            ? [msg.messageId]
                            : [],
                      };
                    }
                    users.set(calculatedId, { ...user });
                  } else if (
                    messageStatus !== "read" &&
                    messageType !== "block" &&
                    !isSender
                  ) {
                    const user = users.get(calculatedId);
                    users.set(calculatedId, {
                      ...user,
                      totalUnreadMessages: [
                        ...user.totalUnreadMessages,
                        msg.messageId,
                      ],
                    });
                  }
                });

                let pinnedChats = [];
                let allChats = [];
                let pinned = [];
                if (pinnedAndBlockedUsers.length > 0) {
                  pinned = JSON.parse(pinnedAndBlockedUsers[0].pinned_users);
                }

                Array.from(users.values()).map((user) => {
                  if (pinned.includes(user.userId)) {
                    pinnedChats = [...pinnedChats, { ...user, isPinned: true }];
                  } else {
                    allChats = [...allChats, { ...user, isPinned: false }];
                  }
                });

                res.send({
                  status: 200,
                  allChatUsers: allChats,
                  allPinnedUsers: pinnedChats,
                  messagesInSentStatus,
                  pinnedUsers: pinned,
                  blockedUsers: JSON.parse(
                    pinnedAndBlockedUsers[0].blocked_users
                  ),
                });
              }
            }
          }
        );
      }
    }
  );
});

app.put("/chat/update-pinned-chats", (req, res) => {
  const { userId, pinnedUser } = req.body;
  const getPinnedUsers =
    "SELECT pinned_users FROM user_privacy WHERE user_id = ?";
  db.query(getPinnedUsers, [parseInt(userId)], (err, pinnedUsers) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      let pinned = [];
      if (pinnedUsers) {
        pinned = JSON.parse(pinnedUsers[0].pinned_users);
      }
      const updatePinnedQuery =
        "UPDATE user_privacy SET pinned_users = ? WHERE user_id = ?";
      db.query(
        updatePinnedQuery,
        [JSON.stringify([...pinned, parseInt(pinnedUser)]), parseInt(userId)],
        (err, result) => {
          if (err) {
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            db.query(
              getPinnedUsers,
              [parseInt(userId)],
              (err, updatedPinnedUsers) => {
                if (err) {
                  res.send({
                    status: 400,
                    msg: "Something went wrong please try again later",
                  });
                } else {
                  res.send({
                    status: 200,
                    msg: "Added to pinned users successful",
                    pinnedUsers: JSON.parse(updatedPinnedUsers[0].pinned_users),
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

app.put("/chat/update-unpinned-chats", (req, res) => {
  const { userId, unpinnedUser } = req.body;
  const getPinnedUsers =
    "SELECT pinned_users FROM user_privacy WHERE user_id = ?";
  db.query(getPinnedUsers, [parseInt(userId)], (err, pinnedUsers) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      const pinned = JSON.parse(pinnedUsers[0].pinned_users);
      const updatedPinned = pinned.filter(
        (id) => parseInt(id) !== parseInt(unpinnedUser)
      );
      const updatePinnedQuery =
        "UPDATE user_privacy SET pinned_users = ? WHERE user_id = ?";
      db.query(
        updatePinnedQuery,
        [JSON.stringify(updatedPinned), parseInt(userId)],
        (err, result) => {
          if (err) {
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            db.query(
              getPinnedUsers,
              [parseInt(userId)],
              (err, updatedPinnedUsers) => {
                if (err) {
                  res.send({
                    status: 400,
                    msg: "Something went wrong please try again later",
                  });
                } else {
                  res.send({
                    status: 200,
                    msg: "Added to pinned users successful",
                    pinnedUsers: JSON.parse(updatedPinnedUsers[0].pinned_users),
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

// groups & chats
app.post("/group/create-group", (req, res) => {
  const { admin, members, groupName, logo } = req.body;
  const membersString = JSON.stringify([...members]);
  const createdAt = new Date();
  const logoAvatar = logo || null;
  const createGroupQuery =
    "INSERT INTO tawk_chat_app.groups (group_name, admin, members, logo, created_at) VALUES (?, ?, ?, ?, ?)";
  db.query(
    createGroupQuery,
    [
      groupName,
      parseInt(admin),
      JSON.stringify(members),
      logoAvatar,
      createdAt,
    ],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const getGroupQuery =
          "SELECT * FROM tawk_chat_app.groups WHERE group_id = ?";
        db.query(getGroupQuery, [result.insertId], (err, groupResult) => {
          if (err) {
            res.send({
              status: 400,
              msg: "Something went wrong please try again later",
            });
          } else {
            const group = groupResult[0];
            const newGroup = {
              groupId: group.group_id,
              groupName: group.group_name,
              admin: group.admin,
              members: group.members,
              logo: group.logo,
              groupCreatedAt: group.created_at,
            };

            res.send({
              status: 200,
              msg: "Group created successfully",
              group: newGroup,
            });
          }
        });
      }
    }
  );
});

app.get("/group/get-group-chats/:userId", (req, res) => {
  const { userId } = req.params;
  const getChatsQuery = `
  SELECT
    m.message_id AS messageId,
    m.group_id AS groupId,
    m.message,
    m.message_status AS messageStatus,
    m.created_at AS createdAt,
    m.type AS messageType,
    m.sender_id AS senderId,
    g.group_name AS groupName,
    g.admin AS admin,
    g.logo,
    g.members AS members,
    g.created_at AS groupCreatedAt
  FROM
    tawk_chat_app.group_messages m JOIN tawk_chat_app.groups g ON m.group_id = g.group_id
  WHERE
    (m.sender_id = ? OR JSON_CONTAINS(m.receiver_ids, ?)) AND JSON_CONTAINS(g.members, ?)
  ORDER BY
    m.message_id
  DESC
  `;
  db.query(
    getChatsQuery,
    [
      parseInt(userId),
      JSON.stringify([parseInt(userId)]),
      JSON.stringify([parseInt(userId)]),
    ],
    (err, messagesResult) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        const getGroupsQuery =
          "SELECT * FROM tawk_chat_app.groups WHERE (admin = ? OR JSON_CONTAINS(members, ?))";
        db.query(
          getGroupsQuery,
          [parseInt(userId), JSON.stringify([parseInt(userId)])],
          (err, groupsResult) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later",
              });
            } else {
              if (messagesResult.length === 0) {
                res.send({
                  status: 200,
                  msg: "Groups fetched successfully",
                  myGroups: [],
                  joinedGroups: [],
                  messagesInSentStatus: [],
                });
              } else {
                const groups = new Map();
                const messagesInSentStatus = [];

                messagesResult.forEach((msg) => {
                  const { groupId, messageStatus, messageId } = msg;

                  if (messageStatus === "sent") {
                    messagesInSentStatus.push(messageId);
                  }

                  if (!groups.get(groupId)) {
                    groups.set(groupId, {
                      ...msg,
                      totalUnreadMessages:
                        messageStatus !== "read" ? [messageId] : [],
                    });
                  } else if (messageStatus !== "read") {
                    const group = groups.get(groupId);
                    groups.set(groupId, {
                      ...group,
                      totalUnreadMessages: [
                        ...group.totalUnreadMessages,
                        messageId,
                      ],
                    });
                  }
                });

                const chatGroups = Array.from(groups.values());
                const groupIds = Array.from(groups.keys());
                let noMessagesGroups = [];

                groupsResult.forEach((group) => {
                  if (!groupIds.includes(group.group_id)) {
                    const newGroup = {
                      groupId: group.group_id,
                      groupName: group.group_name,
                      admin: group.admin,
                      members: group.members,
                      logo: group.logo,
                      groupCreatedAt: group.created_at,
                    };
                    noMessagesGroups = [...noMessagesGroups, newGroup];
                  }
                });

                const allGroups = [...chatGroups, ...noMessagesGroups];
                let myGroups = [];
                let joinedGroups = [];
                allGroups.forEach((group) => {
                  if (group.admin === parseInt(userId)) {
                    myGroups = [...myGroups, { ...group, isGroupChat: true }];
                  } else {
                    joinedGroups = [
                      ...joinedGroups,
                      { ...group, isGroupChat: true },
                    ];
                  }
                });

                res.send({
                  status: 200,
                  msg: "Groups fetched successfully",
                  myGroups,
                  joinedGroups,
                  messagesInSentStatus,
                });
              }
            }
          }
        );
      }
    }
  );
});

app.put("/group/add-or-remove-friends", (req, res) => {
  const { members, groupId } = req.body;
  const updateQuery =
    "UPDATE tawk_chat_app.groups SET members = ? WHERE group_id = ?";
  db.query(
    updateQuery,
    [JSON.stringify(members), parseInt(groupId)],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later",
        });
      } else {
        res.send({ status: 200, msg: "Friends updated successfully" });
      }
    }
  );
});

app.delete("/group/delete-group", (req, res) => {
  const { messageIds, images, groupId } = req.body;
  const deleteGroupQuery =
    "DELETE FROM tawk_chat_app.groups WHERE group_id = ?";
  db.query(deleteGroupQuery, [parseInt(groupId)], (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      const string = "?,".repeat(messageIds.length);
      const reqString = string.slice(0, string.length - 1);
      const deleteMessages = `DELETE FROM tawk_chat_app.group_messages WHERE message_id IN (${reqString})`;
      db.query(deleteMessages, messageIds, (err, result) => {
        if (err) {
          res.send({
            status: 400,
            msg: "Something went wrong please try again later",
          });
        } else {
          if (images.length > 0) {
            images.forEach((img) => fs.unlinkSync(`./uploads/images/${img}`));
          }
          res.send({ msg: "Messages deleted successfully", status: 200 });
        }
      });
    }
  });
});

// group messages
app.post("/group-messages/send-message", (req, res) => {
  const { from, to, message, type, groupId, caption } = req.body;
  const dateTime = new Date();
  const status = "sent";
  const sendMessageQuery =
    "INSERT INTO tawk_chat_app.group_messages (group_id, message, sender_id, receiver_ids, type, message_status, created_at, caption) VALUES (?,?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sendMessageQuery,
    [
      parseInt(groupId),
      message,
      parseInt(from),
      JSON.stringify(to),
      type,
      status,
      dateTime,
      caption,
    ],
    (err, result) => {
      if (err) {
        res.send({
          status: 400,
          msg: "Something went wrong please try again later 1",
        });
      } else {
        const getMessageQuery = `
          SELECT
            m.message_id AS messageId,
            m.group_id AS groupId,
            m.message,
            m.sender_id AS senderId,
            m.receiver_ids AS receiverIds,
            m.type AS messageType,
            m.message_status AS messageStatus,
            m.created_at AS createdAt,
            u.name AS senderName,
            u.profile_image AS senderProfileImage,
            u.user_id AS userId
          FROM
            tawk_chat_app.group_messages m
          JOIN
            users u ON u.user_id = m.sender_id
          WHERE
            m.message_id = ?
        `;
        db.query(
          getMessageQuery,
          [parseInt(result.insertId)],
          (err, messageResult) => {
            if (err) {
              res.send({
                status: 400,
                msg: "Something went wrong please try again later 2",
              });
            } else {
              res.send({
                status: 200,
                msg: "Message sent successful",
                sentMessage: messageResult[0],
              });
            }
          }
        );
      }
    }
  );
});

app.get("/group-messages/get-messages/:groupId", (req, res) => {
  const { groupId } = req.params;
  const getMessagesQuery = `
    SELECT
      sender.user_id AS senderId,
      sender.name AS senderName,
      sender.profile_image AS senderProfileImage,
      sender.about AS senderAbout,
      m.group_id AS groupId,
      m.message_id AS messageId,
      m.message_status AS messageStatus,
      m.message,
      m.type AS messageType,
      m.created_at AS createdAt,
      m.caption
    FROM
      tawk_chat_app.group_messages m JOIN users sender ON sender.user_id = m.sender_id
    WHERE
      m.group_id = ?
  `;
  db.query(getMessagesQuery, [parseInt(groupId)], (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({
        status: 200,
        msg: "Messages fetched successfully",
        messages: result,
      });
    }
  });
});

app.put("/group-messages/update-message-status", (req, res) => {
  const { messageIds, status } = req.body;
  const string = "?,".repeat(messageIds.length);
  const reqStrings = string.slice(0, string.length - 1);

  let updateStatusQuery = `
  UPDATE
   tawk_chat_app.group_messages
  SET 
    message_status = "delivered"
  WHERE 
    message_id IN (${reqStrings})
  `;
  if (status === "read") {
    updateStatusQuery = `
  UPDATE
    tawk_chat_app.group_messages
  SET 
    message_status = "read"
  WHERE 
    message_id IN (${reqStrings})
  `;
  }
  db.query(updateStatusQuery, messageIds, (err, result) => {
    if (err) {
      console.log(err);
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      res.send({
        status: 200,
        msg: "Messages status updated successfully",
      });
    }
  });
});

app.delete("/group-messages/delete-messages", (req, res) => {
  const { messageIds, images } = req.body;
  const string = "?,".repeat(messageIds.length);
  const reqString = string.slice(0, string.length - 1);
  const deleteMessages = `DELETE FROM tawk_chat_app.group_messages WHERE message_id IN (${reqString})`;
  db.query(deleteMessages, messageIds, (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      if (images.length > 0) {
        images.forEach((img) => fs.unlinkSync(`./uploads/images/${img}`));
      }
      res.send({ msg: "Messages deleted successfully", status: 200 });
    }
  });
});

app.delete("/group-messages/clear-group-chat", (req, res) => {
  const { groupId, images } = req.body;
  const deleteMessages = `DELETE FROM tawk_chat_app.group_messages WHERE group_id = ?`;
  db.query(deleteMessages, [parseInt(groupId)], (err, result) => {
    if (err) {
      res.send({
        status: 400,
        msg: "Something went wrong please try again later",
      });
    } else {
      if (images.length > 0) {
        images.forEach((img) => fs.unlinkSync(`./uploads/images/${img}`));
      }
      res.send({ msg: "Messages deleted successfully", status: 200 });
    }
  });
});

const server = app.listen(process.env.PORT | PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

initializeSocket(server);
