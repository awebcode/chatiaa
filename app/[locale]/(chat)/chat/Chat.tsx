"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import dynamic from "next/dynamic";
import {
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
  ADD_REPLY_MESSAGE,
  SET_MESSAGES,
  SET_TOTAL_MESSAGES_COUNT,
} from "@/context/reducers/actions";
import { IChat } from "@/context/reducers/interfaces";
import { Tuser } from "@/store/types";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/navigation";
import useIncomingMessageStore from "@/store/useIncomingMessage";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";

const LeftSide = dynamic(() => import("../components/LeftSide"));
const Main = dynamic(() => import("../components/Main"));
const EmptyChat = dynamic(() => import("../components/Empty"));
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
  const { addOnlineUser } = useOnlineUsersStore();
  const totalMessagesCountRef = useRef<number>(0); // Provide type annotation for number
  const selectedChatRef = useRef<IChat | null>(null); // Provide type annotation for IChat or null
  const currentUserRef = useRef<Tuser | null>(null); // Provide type annotation for Tuser or null
  const socketRef = useRef<Socket | null>(null); // Provide type annotation for socket, you can replace `any` with the specific type if available

  useEffect(() => {
    totalMessagesCountRef.current = totalMessagesCount;
    selectedChatRef.current = selectedChat;
    currentUserRef.current = currentUser;
    socketRef.current = socket;
  }, [totalMessagesCount, selectedChat, currentUser, socket]);

  const handleSocketMessage = useCallback(
    (data: any) => {
      if (selectedChat?.chatId === data.chatId) {
        dispatch({ type: SET_MESSAGES, payload: data });
        dispatch({
          type: SET_TOTAL_MESSAGES_COUNT,
          payload: totalMessagesCountRef.current + 1,
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
      console.log({ socketMessage: data });
      // Implementation goes here
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
  const handleAddReactionOnMessage = useCallback((message: any) => {
    // Implementation for handling addReactionOnMessage event
    dispatch({ type: ADD_REACTION_ON_MESSAGE, payload: message });
  }, []);

  // Remove Message Handler
  const handleRemoveMessage = useCallback((message: any) => {
    // Implementation for handling removeMessage event
  }, []);

  // Remove From All Handler
  const handleRemoveFromAll = useCallback((message: any) => {
    // Implementation for handling removeFromAll event
  }, []);

  // Unsent Message Handler
  const handleUnsentMessage = useCallback((message: any) => {
    // Implementation for handling unsentMessage event
  }, []);
  const handleDeliverMessage = useCallback((data: any) => {
    // Implementation goes here
  }, []);

  const handleTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
    startTyping(data.senderId, data.receiverId, data.chatId, data.content);
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
  }, []);

  const chatCreatedNotifyHandler = useCallback((data: any) => {
    // Implementation goes here
  }, []);
  //after join when close the network
  const chatDeletedNotifyReceivedHandler = useCallback((data: any) => {
    // Implementation goes here
  }, []);

  const handleAllDeliveredAfterReconnect = useCallback((data: any) => {}, []);

  useEffect(() => {
    // Add event listeners
    socket.on("receiveMessage", handleSocketMessage);
    socket.on("receiveDeliveredMessage", handleDeliverMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    socket.on("setup", handleOnlineUsers);
    socket.on("groupCreatedNotifyReceived", groupCreatedNotifyHandler);
    socket.on("chatCreatedNotifyReceived", chatCreatedNotifyHandler);
    socket.on("chatDeletedNotifyReceived", chatDeletedNotifyReceivedHandler);
    // Socket event listeners
    socket.on("replyMessage", handleReplyMessage);
    socket.on("editMessage", handleEditMessage);
    socket.on("addReactionOnMessage", handleAddReactionOnMessage);
    socket.on("removeMessage", handleRemoveMessage);
    socket.on("removeFromAll", handleRemoveFromAll);
    socket.on("unsentMessage", handleUnsentMessage);
    socket.on(
      "receiveDeliveredAllMessageAfterReconnect",
      handleAllDeliveredAfterReconnect
    );

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off("setup", handleOnlineUsers);
      socket.off("disconnect");
      socket.off("receiveMessage", handleSocketMessage);
      socket.off("receiveDeliveredMessage", handleDeliverMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("groupCreatedNotifyReceived", groupCreatedNotifyHandler);
      socket.off("chatCreatedNotifyReceived", chatCreatedNotifyHandler);
      socket.off("chatDeletedNotifyReceived", chatDeletedNotifyReceivedHandler);
      socket.off(
        "receiveDeliveredAllMessageAfterReconnect",
        handleAllDeliveredAfterReconnect
      );

      // Socket event listeners
      socket.off("replyMessage", handleReplyMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("addReactionOnMessage", handleAddReactionOnMessage);
      socket.off("removeMessage", handleRemoveMessage);
      socket.off("removeFromAll", handleRemoveFromAll);
      socket.off("unsentMessage", handleUnsentMessage);
    };
  }, []); //
  useEffect(() => {
    // Emit "setup" event when the component mounts
    if (currentUser) {
      const setupData = {
        id: currentUser?._id,
      };
      socket.emit("setup", setupData);
    }
  }, [currentUser, socket]);
  //  useEffect(() => {
  //    const timeoutId = setTimeout(() => {
  //      if (!currentUser) {
  //        router.push("/login");
  //      }
  //    }, 2000);
  //    return () => clearTimeout(timeoutId);
  //  }, [router, currentUser]);
  return (
    <div className="">
      <div className="  flexBetween gap-2 overflow-hidden">
        {/* Left side */}
        <div
          className={`h-[88vh] basis-[100%] ${
            selectedChat ? "hidden" : "block"
          } md:block w-full md:basis-2/4 border `}
        >
          <LeftSide />
        </div>
        {/* Rightside */}
        <div
          className={`h-[88vh] border w-full ${
            selectedChat ? "block basis-[100%] w-full" : "hidden"
          }  md:block`}
        >
          {selectedChat ? <Main /> : <EmptyChat />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
