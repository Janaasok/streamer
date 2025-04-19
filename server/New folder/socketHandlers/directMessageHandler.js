const Message = require("../models/message");
const Conversation = require("../models/conversation");
const chatUpdates = require("./updates/chat");

const directMessageHandler = async (socket, data) => {
  try {
    console.log("Direct Message event is being handled");
    const { userId } = socket.user;
    const { receiverUserId, content, file } = data;

    // Create a new message object
    const messageData = {
      content: content || "", // Text message content
      author: userId,
      date: new Date(),
      type: "DIRECT",
    };

    // If a file is included, add it to the message object
    if (file) {
      messageData.file = {
        name: file.name,
        type: file.type,
        data: file.data, // Base64 file data (not recommended for large files)
        url: file.url || "", // URL if using cloud storage
      };
    }

    // Create and save message
    const message = await Message.create(messageData);

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverUserId] },
    });

    if (conversation) {
      conversation.messages.push(message._id);
      await conversation.save();
      chatUpdates.updateChatHistory(conversation._id.toString());
    } else {
      const newConversation = await Conversation.create({
        messages: [message._id],
        participants: [userId, receiverUserId],
      });

      chatUpdates.updateChatHistory(newConversation._id.toString());
    }
  } catch (error) {
    console.error("Error handling direct message:", error);
  }
};

module.exports = directMessageHandler;
