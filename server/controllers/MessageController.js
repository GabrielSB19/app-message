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
