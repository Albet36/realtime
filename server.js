
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = 3000;
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ChatCord Bot';

// run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);


        // welcome cyrrent user
        socket.emit('message', formatMessage(botName, 'welcome to chatcord'));
        // to all clients in the current namespace except the sender
        socket.broadcast.emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    })
    // Run when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            //  send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                user: getRoomUsers(user.room)
            })
        }

    });
    // listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })
})
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
