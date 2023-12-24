import { useStateProvider } from "@/context/StateContext";
import React, { useState } from "react";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCase } from "@/context/constants";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAcepted, setCallAcepted] = useState(false);

  const endCall = () => {
    const id = data.id;
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", { from: id });
    } else {
      socket.current.emit("reject-video-call", { from: id });
    }
    dispatch({ type: reducerCase.END_CALL });
  };

  return (
    <div className="border-conversation-border border-l w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div className="flex flex-col gap-3 items-center">
        <span className="text-5xl">{data.name}</span>
        <span className="text-lg">
          {callAcepted && data.callType !== "video"
            ? "On going call"
            : "Calling"}
        </span>
      </div>
      {(!callAcepted || data.callType === "audio") && (
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full "
          />
        </div>
      )}
      <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd
          className="text-3xl cursor-pointer"
          onClick={endCall}
        />
      </div>
    </div>
  );
}

export default Container;
