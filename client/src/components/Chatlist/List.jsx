import { useStateProvider } from "@/context/StateContext";
import { reducerCase } from "@/context/constants";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, onlineUsers }, dispatch] =
    useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      if (userInfo?.id) {
        try {
          const {
            data: { users, onlineUsers },
          } = await axios.get(
            `${GET_INITIAL_CONTACTS_ROUTE}/${parseInt(userInfo?.id)}`
          );

          dispatch({ type: reducerCase.SET_ONLINE_USERS, onlineUsers });
          dispatch({
            type: reducerCase.SET_USER_CONTACTS,
            userContacts: users,
          });
        } catch (error) {
          console.log(error);
        }
      }
    };
    getContacts();
  }, [userInfo]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {userContacts.map((contact) => (
        <ChatLIstItem data={contact} key={contact.id} />
      ))}
    </div>
  );
}

export default List;
