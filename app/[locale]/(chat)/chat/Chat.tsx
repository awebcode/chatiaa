"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import dynamic from "next/dynamic";
import {
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
  ADD_REPLY_MESSAGE,
  BLOCK_CHAT,
  DELETE_CHAT,
  LEAVE_FROM_GROUP_CHAT,
  REMOVE_UNSENT_MESSAGE,
  SET_CHATS,
  SET_MESSAGES,
  SET_TOTAL_MESSAGES_COUNT,
  UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND,
  UPDATE_CHAT_STATUS,
  UPDATE_LATEST_CHAT_MESSAGE,
  UPDATE_MESSAGE_STATUS,
} from "@/context/reducers/actions";
import { IChat } from "@/context/reducers/interfaces";
import { Reaction, Tuser } from "@/store/types";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/navigation";
import useIncomingMessageStore from "@/store/useIncomingMessage";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import {
  updateAllMessageStatusAsDelivered,
  updateMessageStatus,
} from "@/functions/messageActions";

const Chat = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const {
    user: currentUser,
    messages,
    selectedChat,
    totalMessagesCount,
  } = useMessageState();
  const dispatch = useMessageDispatch();
  const router = useRouter();
  const { startTyping, stopTyping } = useTypingStore();
  const { addOnlineUser, onlineUsers } = useOnlineUsersStore();
  const totalMessagesCountRef = useRef<number>(0); // Provide type annotation for number
  const selectedChatRef = useRef<IChat | null>(null); // Provide type annotation for IChat or null
  const currentUserRef = useRef<Tuser | null>(null); // Provide type annotation for Tuser or null
  const socketRef = useRef<Socket | null>(null); // Provide type annotation for socket, you can replace `any` with the specific type if available
  const onlineUsersRef = useRef<any>([]);
  const userRef = useRef<Tuser | null>(null);

  useEffect(() => {
    totalMessagesCountRef.current = totalMessagesCount;
    selectedChatRef.current = selectedChat;
    currentUserRef.current = currentUser;
    userRef.current = currentUser;
    socketRef.current = socket;
    onlineUsersRef.current = onlineUsers;
  }, [totalMessagesCount, selectedChat, currentUser, socket, onlineUsers]);
  useEffect(() => {
    // Emit "setup" event when the component mounts if currentUser is available
    const user = JSON.parse(localStorage.getItem("currentUser") as any);
    if (user) {
      socket?.emit("setup", { id: user._id });
    }
  
  }, []);
  //update friend message when i'm online
  useEffect(() => {
    updateAllMessageStatusAsDelivered(currentUser?._id as any);
    const deliverData = {
      senderId: currentUser?._id,
      pic: currentUser?.image,
    };
    socket.emit("deliveredAllMessageAfterReconnect", deliverData);
  }, []);

  const handleSocketMessage = useCallback(
    async (data: any) => {
      //  update latest chat for both side
      console.log({ socketMessage: data });

      if (selectedChatRef.current?.chatId === data.chat._id) {
        useIncomingMessageStore.setState({
          isIncomingMessage: true,
        });
        dispatch({ type: SET_MESSAGES, payload: data });
        dispatch({
          type: SET_TOTAL_MESSAGES_COUNT,
          payload: totalMessagesCountRef.current + 1,
        });
      }

      // seen message
      if (data.sender?._id === selectedChatRef.current?.userInfo._id) {
        dispatch({
          type: UPDATE_LATEST_CHAT_MESSAGE,
          payload: { ...data, status: "seen" },
        });
        socketRef?.current?.emit("seenMessage", {
          receiverId: data.sender._id,
          chatId: data.chat._id,
          messageId: data._id,
          status: "seen",
        });
        const updateStatusData = {
          chatId: data?.chat._id,
          status: "seen",
        };
        await updateMessageStatus(updateStatusData);
      } else if (
        //delivered message
        data.receiverId === currentUserRef.current?._id &&
        onlineUsersRef.current.some(
          (user: any) => user.id === currentUserRef.current?._id
        )
      ) {
        dispatch({
          type: UPDATE_LATEST_CHAT_MESSAGE,
          payload: { ...data, status: "delivered" },
        });
        socketRef?.current?.emit("deliveredMessage", {
          receiverId: data.sender._id,
          chatId: data.chat._id,
          messageId: data._id,
          status: "delivered",
        });
        const updateStatusData = {
          chatId: data?.chat._id,
          status: "delivered",
        };
        await updateMessageStatus(updateStatusData);
      } else {
        //when friend offline
        dispatch({
          type: UPDATE_LATEST_CHAT_MESSAGE,
          payload: data,
        });
      }
    },

    []
  );
  // Reply Message Handler
  const handleReplyMessage = useCallback((message: any) => {
    // Implementation for handling replyMessage event
    dispatch({ type: ADD_REPLY_MESSAGE, payload: message });
  }, []);

  // Edit Message Handler
  const handleEditMessage = useCallback((message: any) => {
    // Implementation for handling editMessage event
    dispatch({ type: ADD_EDITED_MESSAGE, payload: message });
  }, []);

  // Add Reaction on Message Handler
  const handleAddReactionOnMessage = useCallback(
    (reaction: Reaction & { type: string }) => {
      dispatch({ type: ADD_REACTION_ON_MESSAGE, payload: reaction });
    },
    []
  );

  //handle_Remove_All_Unsent_Message
  const handle_Remove_All_Unsent_Message = useCallback((message: any) => {
    // Implementation for handling removeMessage event
    dispatch({
      type: REMOVE_UNSENT_MESSAGE,
      payload: message,
    });
  }, []);

  //handleSeenMessage
  const handleSeenMessage = useCallback((data: any) => {
    dispatch({ type: UPDATE_CHAT_STATUS, payload: data });
    dispatch({ type: UPDATE_MESSAGE_STATUS, payload: data });

    // Implementation goes here
  }, []);
  const handleDeliverMessage = useCallback((data: any) => {
    dispatch({ type: UPDATE_CHAT_STATUS, payload: data });
    dispatch({ type: UPDATE_MESSAGE_STATUS, payload: data });
    // Implementation goes here
  }, []);

  const handleTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
    startTyping(data.senderId, data.receiverId, data.chatId, data.content, data.userInfo);
    // }
  }, []);
  const handleStopTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
    stopTyping();
    // }
  }, []);

  const handleOnlineUsers = useCallback((users: any) => {
    if (users) {
      addOnlineUser(users);
    }
  }, []);

  const groupCreatedNotifyHandler = useCallback((data: any) => {
    // Implementation goes here
    dispatch({ type: SET_CHATS, payload: data.chat });
  }, []);

  const chatCreatedNotifyHandler = useCallback((data: any) => {
    // Implementation goes here
    dispatch({ type: SET_CHATS, payload: data.chat });
  }, []);
  //after join when close the network
  const singleChatDeletedNotifyReceivedHandler = useCallback((data: any) => {
    // Implementation goes here
    dispatch({ type: DELETE_CHAT, payload: data });
  }, []);
  //UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND
  const handleAllDeliveredAfterReconnect = useCallback((data: any) => {
    dispatch({ type: UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND, payload: data });
  }, []);
  //groupChatLeaveNotifyReceivedHandler
  const groupChatLeaveNotifyReceivedHandler = useCallback((data: any) => {
    if (data.chatId === selectedChatRef.current?.chatId) {
      dispatch({ type: SET_MESSAGES, payload: data });
    }

    dispatch({
      type: LEAVE_FROM_GROUP_CHAT,
      payload: { user: data.user, chatId: data.chatId },
    });

    dispatch({ type: UPDATE_LATEST_CHAT_MESSAGE, payload: data });
  }, []);

  //incoming block single chat
  const chatBlockedNotifyReceivedHandler = useCallback((data: any) => {
    dispatch({ type: BLOCK_CHAT, payload: data });
  }, []);
  useEffect(() => {
    // Add event listeners
    socket.on("receiveMessage", handleSocketMessage);
    socket.on("receiveDeliveredMessage", handleDeliverMessage);
    socket.on("receiveSeenMessage", handleSeenMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    socket.on("setup", handleOnlineUsers);
    socket.on("groupCreatedNotifyReceived", groupCreatedNotifyHandler);
    socket.on("chatCreatedNotifyReceived", chatCreatedNotifyHandler);
    socket.on("singleChatDeletedNotifyReceived", singleChatDeletedNotifyReceivedHandler);
    // Socket event listeners//MESSAGE EVENTS
    socket.on("replyMessage", handleReplyMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("addReactionOnMessage", handleAddReactionOnMessage);
    socket.on("remove_remove_All_unsentMessage", handle_Remove_All_Unsent_Message);
    socket.on(
      "receiveDeliveredAllMessageAfterReconnect",
      handleAllDeliveredAfterReconnect
    );
    //GROUP EVENTS
    socket.on("groupChatLeaveNotifyReceived", groupChatLeaveNotifyReceivedHandler);

    //block single chat

    socket.on("chatBlockedNotifyReceived", chatBlockedNotifyReceivedHandler);
    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("setup", handleOnlineUsers);
      socket.off("disconnect");
      socket.off("receiveMessage", handleSocketMessage);
      socket.off("receiveSeenMessage", handleSeenMessage);
      socket.off("receiveDeliveredMessage", handleDeliverMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("groupCreatedNotifyReceived", groupCreatedNotifyHandler);
      socket.off("chatCreatedNotifyReceived", chatCreatedNotifyHandler);
      socket.off(
        "singleChatDeletedNotifyReceived",
        singleChatDeletedNotifyReceivedHandler
      );
      socket.off(
        "receiveDeliveredAllMessageAfterReconnect",
        handleAllDeliveredAfterReconnect
      );
      socket.off("groupChatLeaveNotifyReceived", groupChatLeaveNotifyReceivedHandler);
      // Socket event listeners
      socket.off("replyMessage", handleReplyMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("addReactionOnMessage", handleAddReactionOnMessage);
      socket.off("remove_remove_All_unsentMessage", handle_Remove_All_Unsent_Message);
      socket.off("chatBlockedNotifyReceived", chatBlockedNotifyReceivedHandler);
    };
  }, []); //

  //  useEffect(() => {
  //    const timeoutId = setTimeout(() => {
  //      if (!currentUser) {
  //        router.push("/login");
  //      }
  //    }, 2000);
  //    return () => clearTimeout(timeoutId);
  //  }, [router, currentUser]);
  return <></>;
};

export default Chat;
