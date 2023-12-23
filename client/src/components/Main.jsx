import React, { useState, useEffect, useRef } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { GET_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { HOST } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { reducerCase } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";

function Main() {
  const router = useRouter();
  const [{ userInfo, currentChatUser }, dispatch] = useStateProvider();
  const [redirectLogin, setredirectLogin] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);
  const [actualChat, setActualChat] = useState(null);
  const [getMessage, setGetMessage] = useState(null);
  const socket = useRef();

  useEffect(() => {
    if (redirectLogin) {
      router.push("/login");
    }
  }, [redirectLogin]);

  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) {
      setredirectLogin(true);
    }
    if (!userInfo && currentUser?.email) {
      const { data } = await axios.post(CHECK_USER_ROUTE, {
        email: currentUser.email,
      });
      if (!data.status) {
        router.push("/login");
      }
      if (data.status) {
        const {
          id,
          name,
          email,
          profilePicture: profileImage,
          status,
        } = data.data;
        dispatch({
          type: reducerCase.SET_USER_INFO,
          userInfo: {
            id,
            name,
            email,
            profileImage,
            status,
          },
        });
      }
    }
  });

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user", userInfo?.id);
      dispatch({ type: reducerCase.SET_SOCKET, socket });
    }
  }, [userInfo]);

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("msg-recieve", (data) => {
        setGetMessage(data);
      });

      setSocketEvent(true);
    }
  }, [socket.current]);

  useEffect(() => {
    setActualChat(currentChatUser);
  }, [currentChatUser]);

  useEffect(() => {
    if (currentChatUser?.id === getMessage?.message.senderId) {
      dispatch({
        type: reducerCase.ADD_MESSAGE,
        newMessage: { ...getMessage?.message },
      });
    }
  }, [getMessage]);

  useEffect(() => {
    const getMessages = async () => {
      const {
        data: { messages },
      } = await axios.get(
        `${GET_MESSAGE_ROUTE}/${userInfo?.id}/${currentChatUser?.id}`
      );
      dispatch({ type: reducerCase.SET_MESSAGES, messages });
    };
    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser]);

  return (
    <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
      <ChatList />
      {currentChatUser ? <Chat /> : <Empty />}
    </div>
  );
}

export default Main;
