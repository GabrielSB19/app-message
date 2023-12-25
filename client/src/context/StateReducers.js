import { reducerCase } from "./constants";

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  messagesSearch: false,
  userContacts: [],
  onlineUsers: [],
  filteredContacts: [],
  videoCall: undefined,
  voiceCall: undefined,
  incomingVoiceCall: undefined,
  incomingVideoCall: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCase.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCase.SET_NEW_USER:
      return { ...state, newUser: action.newUser };
    case reducerCase.SET_ALL_CONTACTS_PAGE:
      return { ...state, contactsPage: !state.contactsPage };
    case reducerCase.CHANGE_CURRENT_CHAT_USER:
      return { ...state, currentChatUser: action.user };
    case reducerCase.SET_MESSAGES:
      return { ...state, messages: action.messages };
    case reducerCase.SET_SOCKET:
      return { ...state, socket: action.socket };
    case reducerCase.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.newMessage] };
    case reducerCase.SET_MESSAGE_SEARCH:
      return { ...state, messagesSearch: !state.messagesSearch };
    case reducerCase.SET_USER_CONTACTS:
      return { ...state, userContacts: action.userContacts };
    case reducerCase.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.onlineUsers };
    case reducerCase.SET_CONTACT_SEARCH:
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );
      return {
        ...state,
        contactSearch: action.contactSearch,
        filteredContacts,
      };
    case reducerCase.SET_VIDEO_CALL:
      return { ...state, videoCall: action.videoCall };
    case reducerCase.SET_VOICE_CALL:
      return { ...state, voiceCall: action.voiceCall };
    case reducerCase.SET_INCOMING_VOICE_CALL:
      return { ...state, incomingVoiceCall: action.incomingVoiceCall };
    case reducerCase.SET_INCOMING_VIDEO_CALL:
      return { ...state, incomingVideoCall: action.incomingVideoCall };
    case reducerCase.END_CALL:
      return {
        ...state,
        videoCall: undefined,
        voiceCall: undefined,
        incomingVoiceCall: undefined,
        incomingVideoCall: undefined,
      };
    case reducerCase.SET_EXIT_CHAT:
      return { ...state, currentChatUser: undefined };
    default:
      return state;
  }
};

export default reducer;
