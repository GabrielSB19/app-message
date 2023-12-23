import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(parseInt(to));
    if (message && from && to) {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          reciever: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: { sender: true, reciever: true },
      });
      return res.status(201).send({ message: newMessage, status: true });
    }
    return res.status(400).send({ message: "All fields are required" });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;

    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: parseInt(from), recieverId: parseInt(to) },
          { recieverId: parseInt(from), senderId: parseInt(to) },
        ],
      },
      orderBy: { id: "asc" },
    });
    const unreadMessages = [];

    messages.forEach((element, index) => {
      if (
        element.messageStatus !== "read" &&
        element.senderId === parseInt(to)
      ) {
        messages[index].messageStatus = "read";
        unreadMessages.push(element.id);
      }
    });

    await prisma.messages.updateMany({
      where: { id: { in: unreadMessages } },
      data: { messageStatus: "read" },
    });

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      const getUser = onlineUsers.get(parseInt(to));

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            type: "image",
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageStatus: getUser ? "delivered" : "sent",
          },
        });
        return res.status(201).send({ message });
      }
      return res.status(400).send("From and To are required");
    }
    return res.status(400).send("Image is required");
  } catch (error) {
    next(error);
  }
};

export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      const getUser = onlineUsers.get(parseInt(to));

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            type: "audio",
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            messageStatus: getUser ? "delivered" : "sent",
          },
        });
        return res.status(201).send({ message });
      }
      return res.status(400).send("From and To are required");
    }
    return res.status(400).send("Audio is required");
  } catch (error) {
    next(error);
  }
};

export const getInitialContactsWithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: { reciever: true, sender: true },
          orderBy: { createAt: "desc" },
        },
        recievedMessages: {
          include: { reciever: true, sender: true },
          orderBy: { createAt: "desc" },
        },
      },
    });
    const messages = [...user.sentMessages, ...user.recievedMessages];
    messages.sort((a, b) => b.createAt.getTime() - a.createAt.getTime());
    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculateId = isSender ? msg.recieverId : msg.senderId;
      if (msg.messageStatus === "sent") {
        messageStatusChange.push(msg.id);
      }
      const {
        id,
        type,
        message,
        messageStatus,
        createAt,
        senderId,
        recieverId,
      } = msg;
      if (!users.get(calculateId)) {
        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createAt,
          senderId,
          recieverId,
        };
        if (isSender) {
          user = { ...user, ...msg.reciever, totalUnreadMessages: 0 };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }
        users.set(calculateId, { ...user });
      } else if (messageStatus !== "read" && !isSender) {
        const user = users.get(calculateId);
        users.set(calculateId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });
    if (messageStatusChange.length) {
      await prisma.messages.updateMany({
        where: { id: { in: messageStatusChange } },
        data: { messageStatus: "delivered" },
      });
    }
    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (error) {
    next(error);
  }
};
