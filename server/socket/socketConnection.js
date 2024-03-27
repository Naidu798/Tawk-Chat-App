const { Server } = require("socket.io");

let onlineUsers = {};

const removeUser = (value) => {
  for (let user in onlineUsers) {
    if (onlineUsers[user] === value) {
      delete onlineUsers[user];
      break;
    }
  }
};

// let rooms = {};
const userSockets = {};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  // initialize connection and online users
  io.on("connection", (socket) => {
    socket.on("addNewUser", (userId) => {
      if (!onlineUsers[userId]) {
        onlineUsers[userId] = socket.id;
      }
      io.emit("getOnlineUsers", onlineUsers);
    });

    // one to one message sending
    socket.on("sendMessage", ({ message, sender, socketId }) => {
      io.to(socketId).emit("getMessage", { message, sender });
    });

    socket.on("updateMessageStatus", ({ msgs, socketId }) => {
      io.to(socketId).emit("getUpdateMessageStatus", msgs);
    });

    //Send Friend Request
    socket.on("sendFriendRequest", ({ requestDetails, socketId }) => {
      io.to(socketId).emit("getFriendRequest", requestDetails);
    });

    // send accept friend notification
    socket.on("sendAcceptRequest", ({ friendDetails, socketId }) => {
      io.to(socketId).emit("getAcceptRequest", friendDetails);
    });

    // send accept friend notification
    socket.on("sendRejectRequest", ({ friendDetails, socketId }) => {
      io.to(socketId).emit("getRejectRequest", friendDetails);
    });

    // send remove friend notification
    socket.on("sendRemoveFriend", ({ from, socketId }) => {
      io.to(socketId).emit("getRemoveFriend", from);
    });

    socket.on("updateBlockUsers", ({ blockUser, id, socketId, type }) => {
      io.to(socketId).emit("getUpdateBlockUsers", { blockUser, id, type });
    });

    // outgoing-voice-call
    socket.on("outgoingVoiceCall", (voiceCall) => {
      io.to(voiceCall.friendSocket).emit("incomingVoiceCall", voiceCall);
    });

    socket.on("outgoingVideoCall", (videoCall) => {
      io.to(videoCall.friendSocket).emit("incomingVideoCall", videoCall);
    });

    // accept call
    socket.on("acceptCall", ({ user, callData }) => {
      io.to(user).emit("callAccepted", callData);
    });

    // end call
    socket.on("endCall", (user) => {
      io.to(user).emit("callEnded");
    });

    // join in group
    socket.on("joinRoom", ({ groupDetails, userDetails }) => {
      const { group_id, group_name } = groupDetails;
      const { user_id, name } = userDetails;

      socket.join(group_id);
      if (!userSockets[group_id]) {
        userSockets[group_id] = {};
      }
      userSockets[group_id][user_id] = socket.id;
      // console.log(`${name} joined the ${group_name}`);
    });

    // leave the group
    socket.on("leaveGroup", ({ groupDetails, userDetails }) => {
      const { group_id, group_name } = groupDetails;
      const { user_id, name } = userDetails;

      if (userSockets[group_id] && userSockets[group_id][user_id]) {
        delete userSockets[group_id][user_id];
        socket.leave(group_id);
        // console.log(`User ${name} left the ${group_name} group`);
      }
    });

    // group message sending
    socket.on("newGroupMessage", ({ message, groupName }) => {
      io.to(message.groupId).emit("getGroupMessage", message);
      // console.log(`Message from ${message.senderName} in ${groupName}`);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected");

      Object.keys(userSockets).forEach((groupId) => {
        const groupUsers = userSockets[groupId];
        const disConnectedUserId = Object.keys(groupUsers).find(
          (userId) => groupUsers[userId] === socket.id
        );

        if (disConnectedUserId) {
          delete userSockets[groupId][disConnectedUserId];
        }
      });
      removeUser(socket.id);
      io.emit("getOnlineUsers", onlineUsers);
    });
  });
};

module.exports = initializeSocket;
