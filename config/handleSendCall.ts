import { getSenderFull } from "@/app/[locale]/(chat)/components/logics/logics";
import { SENT_CALL_INVITATION } from "@/context/reducers/actions";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import { Socket } from "socket.io-client";

export function handleSendCall(callType: string, currentUser: Tuser | null, chatData: IChat | null,socket:Socket ,dispatch:any) {
  const callData = {
    sender: currentUser,
    isGroupChat: chatData?.isGroupChat,
    groupInfo: {
      image: chatData?.groupInfo?.image?.url,
      groupName: chatData?.chatName,
    },
    chatId: chatData?.chatId ? chatData?.chatId : chatData?._id,
    receiver: chatData?.userInfo?chatData?.userInfo:getSenderFull(currentUser,chatData?.users as any),
  };
  // router.push(`/call/${chatData?.chatId}`);
  dispatch({ type: SENT_CALL_INVITATION, payload: callData });
  socket.emit("sent_call_invitation", callData);

  socket.emit("user-on-call-message", {
    message: `${
      currentUser?.name +
      `📱 Was started a ${chatData?.isGroupChat ? "room call" : "call"} `
    }`,
    chatId: chatData?.chatId,
    user: currentUser,
    type: "call-notify",
  });
}
