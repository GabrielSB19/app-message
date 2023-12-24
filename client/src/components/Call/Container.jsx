import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";
import { reducerCase } from "@/context/constants";
import axios from "axios";
import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAcepted, setCallAcepted] = useState(false);
  const [token, setToken] = useState(undefined);
  const [zgVar, setZgVar] = useState(undefined);
  const [localStream, setLocalStream] = useState(undefined);
  const [publishStream, setPublishStream] = useState(undefined);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => setCallAcepted(true));
    } else {
      setTimeout(() => {
        setCallAcepted(true);
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { token: returnedToken },
        } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
        setToken(returnedToken);
      } catch (error) {
        console.log(error);
      }
    };
    getToken();
  }, [callAcepted]);

  useEffect(() => {
    const startCall = async () => {
      import("zego-express-engine-webrtc").then(
        async ({ ZegoExpressEngine }) => {
          const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
          const server = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID;

          const zg = new ZegoExpressEngine(appId, server);
          setZgVar(zg);

          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamlist, extendedData) => {
              if (updateType === "ADD") {
                const rmVideo = document.getElementById("remote-video");
                const vd = document.createElement(
                  data.callType === "video" ? "video" : "audio"
                );
                vd.id = streamlist[0].streamID;
                vd.autoplay = true;
                vd.playsInline = true;
                vd.muted = false;
                if (rmVideo) rmVideo.appendChild(vd);
                zg.startPlayingStream(streamlist[0].streamID, {
                  audio: true,
                  video: true,
                }).then((stream) => (vd.srcObject = stream));
              } else if (
                updateType === "DELETE" &&
                zg &&
                localStream &&
                streamlist[0].streamID
              ) {
                zg.destroyStream(localStream);
                zg.stopPublishingStream(streamlist[0].streamID);
                zg.logoutRoom(data.roomId.toString());
                dispatch({ type: reducerCase.END_CALL });
              }
            }
          );
          await zg.loginRoom(
            data.roomId.toString(),
            token,
            {
              userID: userInfo.id.toString(),
              userName: userInfo.name,
            },
            { userUpdate: true }
          );
          const localStream = await zg.createStream({
            camera: {
              audio: true,
              video: data.callType === "video" ? true : false,
            },
          });
          const localVideo = document.getElementById("local-audio");
          const videoElement = document.createElement(
            data.callType === "video" ? "video" : "audio"
          );
          videoElement.id = "video-local-zego";
          videoElement.className = "w-32 h-28";
          videoElement.autoplay = true;
          videoElement.muted = false;

          videoElement.playsInline = true;

          localVideo.appendChild(videoElement);
          const td = document.getElementById("video-local-zego");
          td.srcObject = localStream;
          const streamId = "123" + Date.now();
          setPublishStream(streamId);
          setLocalStream(localStream);
          zg.startPublishingStream(streamId, localStream);
        }
      );
    };
    if (token) {
      startCall();
    }
  }, [token]);

  const endCall = () => {
    const id = data.id;
    if (zgVar && localStream && publishStream) {
      zgVar.destroyStream(localStream);
      zgVar.stopPublishingStream(publishStream);
      zgVar.logoutRoom(data.roomId.toString());
    }
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
      <div className="my-5 relative" id="remote-video">
        <div className="absolute bottom-5 right-5" id="local-audio"></div>
      </div>
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
