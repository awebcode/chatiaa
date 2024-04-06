"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";

import {
  ADD_EDITED_MESSAGE,
  ADD_REACTION_ON_MESSAGE,
  ADD_REPLY_MESSAGE,
  BLOCK_CHAT,
  DELETE_CHAT,
  LEAVE_FROM_GROUP_CHAT,
  LEAVE_ONLINE_USER,
  MAKE_AS_ADMIN_TO_GROUP_CHAT,
  RECEIVE_CALL_INVITATION,
  REMOVE_ADMIN_FROM_GROUP_CHAT,
  REMOVE_UNSENT_MESSAGE,
  REMOVE_USER_FROM_GROUP,
  SEEN_PUSH_USER_GROUP_MESSAGE,
  SET_CHATS,
  SET_MESSAGES,
  SET_TOTAL_MESSAGES_COUNT,
  SET_USER,
  UPDATE_CHAT_MESSAGE_AFTER_ONLINE_FRIEND,
  UPDATE_CHAT_STATUS,
  UPDATE_GROUP_INFO,
  UPDATE_LATEST_CHAT_MESSAGE,
  UPDATE_MESSAGE_STATUS,
  UPDATE_ONLINE_STATUS,
  USER_CALL_REJECTED,
  USER_CALL_ACCEPTED,
  UPDATE_ON_CALL_COUNT,
  CLEAR_MESSAGES,
  DELETE_ALL_MESSAGE_IN_CHAT,
} from "@/context/reducers/actions";
import { IChat } from "@/context/reducers/interfaces";
import { Reaction, Tuser } from "@/store/types";
import { Socket } from "socket.io-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/navigation";
import useIncomingMessageStore from "@/store/useIncomingMessage";
import { useTypingStore } from "@/store/useTyping";
import { useOnlineUsersStore } from "@/store/useOnlineUsers";
import {
  pushgroupSeenBy,
  updateAllMessageStatusAsDelivered,
  updateAllMessageStatusAsSeen,
  updateMessageStatus,
} from "@/functions/messageActions";
import { axiosClient } from "@/config/AxiosConfig";
import { IncomingCallDialog } from "./call/IncomingCall";
import { RejectedCallDialog } from "./call/CallRejected";
import { MyCallPage } from "./call/MyCall";
import { Howl } from "howler";
import { showNotification } from "@/config/showNotification";
const SocketEvents = ({ currentUser }: { currentUser: Tuser }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const {
    // user: currentUser,
    messages,
    selectedChat,
    totalMessagesCount,
    callInfo,
  } = useMessageState();
  const dispatch = useMessageDispatch();

  const router = useRouter();
  const { startTyping, stopTyping } = useTypingStore();
  const { addOnlineUser, removeOnlineUser, onlineUsers, setInitOnlineUsers } =
    useOnlineUsersStore();
  const totalMessagesCountRef = useRef<number>(0); // Provide type annotation for number
  const selectedChatRef = useRef<IChat | null>(null); // Provide type annotation for IChat or null
  const currentUserRef = useRef<Tuser | null>(null); // Provide type annotation for Tuser or null
  const socketRef = useRef<Socket | null>(null); // Provide type annotation for socket, you can replace `any` with the specific type if available
  const onlineUsersRef = useRef<any>([]);
  const userRef = useRef<Tuser | null>(null);
  const soundRef = useRef<any | null>(null);
  const playSound = new Howl({
    src: ["/audio/messenger.mp3"],
    preload: true,
    volume: 1,
  });
  //updateAllMessageStatusAsDeliveredMutation
  const updateAllMessageStatusAsDeliveredMutation = useMutation({
    mutationKey: ["group"],
    mutationFn: (userId: string) => updateAllMessageStatusAsDelivered(userId),
  });
  //pushSeenByMutation
  const pushSeenByMutation = useMutation({
    mutationKey: ["group"],
    mutationFn: (body: { chatId: string; messageId: string }) => pushgroupSeenBy(body),
  });
  // set initial user start
  useEffect(() => {
    dispatch({ type: SET_USER, payload: currentUser });
  }, [currentUser]);
  // set initial user end
  useEffect(() => {
    totalMessagesCountRef.current = totalMessagesCount;
    selectedChatRef.current = selectedChat;
    currentUserRef.current = currentUser;
    userRef.current = currentUser;
    socketRef.current = socket;
    onlineUsersRef.current = onlineUsers;
    soundRef.current = playSound;
  }, [totalMessagesCount, selectedChat, currentUser, socket, onlineUsers]);
  useEffect(() => {
    // Emit "setup" event when the component mounts if currentUser is available
    // const user = JSON.parse(localStorage.getItem("currentUser") as any);
    if (currentUser) {
      socket?.emit("setup", { userId: currentUser._id });
    }
  }, [currentUser?._id]);

  //fetch initial online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const { data } = await axiosClient.get("/getOnlineUsersInMyChats");
      let onlineUserss = data.onlineUsers.map((u: Tuser) => ({
        userId: u._id,
        socketId: u.socketId,
        userInfo: u,
      }));
      setInitOnlineUsers(onlineUserss);
    };
    fetchOnlineUsers();
  }, []);
  //update friend chat and messages staus when i'm online
  useEffect(() => {
    updateAllMessageStatusAsDelivered(currentUser?._id as any);
  }, []);
  useEffect(() => {
    socket.emit("deliveredAllMessageAfterReconnect", {
      userId: currentUser?._id,
    });
  }, [currentUser?._id]);

  const handleSocketMessage = useCallback(
    async (data: any) => {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
      //  update latest chat for both side
      console.log({ socketMessage: data });

      if (selectedChatRef.current?.chatId === data.chat?._id) {
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
      if (
        !data?.chat?.isGroupChat &&
        data.sender?._id === selectedChatRef.current?.userInfo._id
      ) {
        useIncomingMessageStore.setState({
          isIncomingMessage: true,
        });
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

        //send to db

        const pushData = {
          chatId: data?.chat?._id,
          messageId: data?._id,
          user: currentUserRef.current,
          status: "seen",
          onClickByseen: "false",
        };

        //emit event to server to sender
        socket.emit("seenPushGroupMessage", pushData);
        //update my side visible the user who seen
        dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE, payload: pushData });
        pushSeenByMutation.mutate({
          chatId: data.chat?._id,
          messageId: data?._id as any,
        });
        const updateStatusData = {
          chatId: data?.chat._id,
          status: "seen",
        };
        await updateMessageStatus(updateStatusData);
      } else if (
        !data.chat?.isGroupChat &&
        //delivered message
        data.receiverId === currentUserRef.current?._id &&
        onlineUsersRef.current.some(
          (user: any) => user.userId === currentUserRef.current?._id
        )
      ) {
        //play sound
        soundRef.current?.play();
        showNotification(data.sender.name, data.sender.image, data.content);
        useIncomingMessageStore.setState({
          isIncomingMessage: true,
        });
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
        if (data.chat?.isGroupChat && data.sender?._id !== currentUserRef.current?._id) {
          //update group
          const pushData = {
            chatId: data?.chat?._id,
            messageId: data?._id,
            user: currentUserRef.current,
          };

          dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE, payload: pushData });
        } else {
          //update one two one side
          dispatch({
            type: UPDATE_LATEST_CHAT_MESSAGE,
            payload: data,
          });
        }
      }
      ////*****************group chat hanle */

      if (data.chat?.isGroupChat) {
        //if friends are in room
        if (
          data?.chat?._id === selectedChatRef.current?.chatId &&
          data?.sender?._id !== currentUserRef.current?._id
        ) {
          //update receiver side
          useIncomingMessageStore.setState({
            isIncomingMessage: true,
          });
          dispatch({
            type: UPDATE_LATEST_CHAT_MESSAGE,
            payload: { ...data, status: "seen" },
          });

          const pushData = {
            chatId: data?.chat?._id,
            messageId: data?._id,
            user: currentUserRef.current,
            status: "seen",
            onClickByseen: "false",
          };

          //emit event to server to sender
          socket.emit("seenPushGroupMessage", pushData);

          dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE, payload: pushData });

          //update sender side
          const updateStatusData = {
            chatId: data?.chat?._id,
            status: "seen",
          };
          //send to db
          pushSeenByMutation.mutate({
            chatId: data.chat?._id,
            messageId: data?._id as any,
          });
          await updateMessageStatus(updateStatusData);
          updateAllMessageStatusAsSeen(data.chat?._id).catch(console.error);
        } else {
          if (
            data.chat.status !== "seen" &&
            data.chat.users?.some((user: any) =>
              onlineUsersRef.current.some(
                (onlineUser: any) =>
                  onlineUser.userId === user?._id &&
                  onlineUser.userId !== currentUserRef.current?._id
              )
            )
          ) {
            //play sound
            soundRef.current?.play();
            showNotification(data.sender.name, data.sender.image, data.content);
            useIncomingMessageStore.setState({
              isIncomingMessage: true,
            });
            dispatch({
              type: UPDATE_LATEST_CHAT_MESSAGE,
              payload: { ...data, status: "delivered" },
            });
            socket.emit("deliveredGroupMessage", {
              chat: {
                ...data.chat,
                latestMessage: { ...data.chat.latestMessage, isSeen: false },
              },
              _id: data._id,
              status: "delivered",
            });
            //update status

            await updateMessageStatus({
              chatId: data?.chat?._id,
              status: "delivered",
            });
          }
        }
      }
    },

    []
  );
  // Reply Message Handler
  const handleReplyMessage = useCallback((message: any) => {
    // Implementation for handling replyMessage event
    dispatch({
      type: ADD_REPLY_MESSAGE,
      payload: { ...message, addMessageType: "replyMessage" },
    }); //ADD_REPLY_MESSAGE
  }, []);

  // Edit Message Handler
  const handleEditMessage = useCallback((message: any) => {
    // Implementation for handling editMessage event
    dispatch({
      type: SET_MESSAGES,
      payload: { ...message, addMessageType: "editSocketMessage" },
    }); //ADD_EDITED_MESSAGE
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
    const typingData = {
      senderId: data.senderId,
      chatId: data.chatId,
      content: data.content,
      userInfo: data.userInfo,
    };
    startTyping(typingData);
  }, []);
  const handleStopTyping = useCallback((data: any) => {
    // if (data.receiverId === currentUser?._id) {
    stopTyping(data.senderId, data.chatId);
    // }
  }, []);
  //handleAlreadyConnectedOnlineUsers
  const handleAlreadyConnectedOnlineUsers = useCallback(
    (users: { userId: string; socketId: string; userInfo: Tuser }[]) => {
      if (users) {
        // setInitOnlineUsers(users);
      }
    },
    []
  );
  //handleOnlineUsers
  const handleOnlineUsers = useCallback(
    (user: { userId: string; socketId: string; userInfo: Tuser; chatId: string }) => {
      if (user) {
        if (user.userId !== currentUserRef?.current?._id) {
          addOnlineUser(user);
          dispatch({
            type: UPDATE_ONLINE_STATUS,
            payload: { chatId: user.chatId, type: "online" },
          });
        }
      }
    },
    []
  );
  //handleLeaveOnlineUsers
  const handleLeaveOnlineUsers = useCallback(
    (user: {
      userId: string;
      socketId: string;
      userInfo: Tuser;
      chatId: string;
      isAnyGroupUserOnline: boolean;
    }) => {
      if (user) {
        dispatch({
          type: UPDATE_ONLINE_STATUS,
          payload: {
            chatId: user.chatId,
            userId: user.userId,
            currentUser,
            isAnyGroupUserOnline: user.isAnyGroupUserOnline,
            type: "leave",
          },
        });
        dispatch({ type: LEAVE_ONLINE_USER, payload: user });
        removeOnlineUser(user);
      }
    },
    []
  );
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

      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
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
  //userRemoveFromGroupNotify
  const handleUserRemoveFromGroupNotify = useCallback((data: any) => {
    dispatch({ type: SET_MESSAGES, payload: data.message });
    dispatch({
      type: UPDATE_LATEST_CHAT_MESSAGE,
      payload: data.message,
    });
    if (selectedChatRef.current?.chatId === data.chatId) {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
    }
    // queryClient.invalidateQueries({ queryKey: ["groupUsers"] });
    // dispatch({ type: REMOVE_USER_FROM_GROUP, payload: data });

    // console.log({ handleUserRemoveFromGroupNotify: data });
  }, []);
  //userRemoveFromGroupNotify
  const handleMakeAdminToGroupNotify = useCallback((data: any) => {
    dispatch({ type: SET_MESSAGES, payload: data.message });
    dispatch({
      type: UPDATE_LATEST_CHAT_MESSAGE,
      payload: data.message,
    });
    // queryClient.invalidateQueries({ queryKey: ["groupUsers"] });
    dispatch({ type: MAKE_AS_ADMIN_TO_GROUP_CHAT, payload: data });

    if (selectedChatRef.current?.chatId === data.chatId) {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
    }
    // console.log({ handleMakeAdminToGroupNotify: data.message });
  }, []);
  //adminRemoveFromGroupNotify
  const handleAdminRemoveFromGroupNotify = useCallback((data: any) => {
    dispatch({ type: SET_MESSAGES, payload: data.message });
    dispatch({
      type: UPDATE_LATEST_CHAT_MESSAGE,
      payload: data.message,
    });
    // queryClient.invalidateQueries({ queryKey: ["groupUsers"] });
    dispatch({ type: REMOVE_ADMIN_FROM_GROUP_CHAT, payload: data });
    if (selectedChatRef.current?.chatId === data.chatId) {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
    }
  }, []);

  //handleSeenPushGroupMessage
  const handleSeenPushGroupMessage = useCallback((data: any) => {
    dispatch({
      type: SEEN_PUSH_USER_GROUP_MESSAGE,
      payload: { ...data, isSocketData: true },
    });
  }, []);

  //handleDeliveredGroupMessage
  const handleDeliveredGroupMessage = useCallback((data: any) => {
    dispatch({ type: UPDATE_CHAT_STATUS, payload: data });
    dispatch({
      type: UPDATE_LATEST_CHAT_MESSAGE,
      payload: { ...data, status: "delivered" },
    });
  }, []);
  //handleUpdate_group_info_Received
  const handleUpdate_group_info_Received = useCallback((data: any) => {
    dispatch({ type: UPDATE_GROUP_INFO, payload: data });
  }, []);
  //hanlegroupNotifyReceived

  const handlegroupNotifyReceived = useCallback((data: any) => {
    dispatch({ type: SET_MESSAGES, payload: data.message });
    dispatch({
      type: UPDATE_LATEST_CHAT_MESSAGE,
      payload: data.message,
    });
    if (selectedChatRef.current?.chatId === data.chatId) {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
    }
  }, []);
  //call handlers

  //handleIncomingCall
  const handleIncomingCall = useCallback((data: any) => {
    dispatch({ type: RECEIVE_CALL_INVITATION, payload: data });
  }, []);
  //handleCallAccepted
  const handleCallAccepted = useCallback((data: any) => {
    dispatch({ type: USER_CALL_ACCEPTED, payload: data });
    router.push(`/call/${data.chatId}`);
  }, []);

  //handleCallRejected
  const handleCallRejected = useCallback((data: any) => {
    dispatch({ type: USER_CALL_REJECTED, payload: data });
  }, []);
  //handleUpdateOnCallCount
  const handleUpdateOnCallCount = useCallback((data: any) => {
    dispatch({ type: UPDATE_ON_CALL_COUNT, payload: data });
  }, []);
  //handleUserOnCallMessage
  const handleUserOnCallMessage = useCallback((data: any) => {
    if (
      data.receiverId === currentUserRef.current?._id &&
      onlineUsersRef.current.some(
        (user: any) => user.userId === currentUserRef.current?._id
      )
    ) {
      dispatch({ type: SET_MESSAGES, payload: { ...data.message, status: "delivered" } });
      dispatch({
        type: UPDATE_LATEST_CHAT_MESSAGE,
        payload: { ...data.message, status: "delivered" },
      });
      socketRef?.current?.emit("deliveredMessage", {
        receiverId: data.message.sender._id,
        chatId: data.chatId,
        messageId: data.message._id,
        status: "delivered",
      });
      const updateStatusData = {
        chatId: data?.chatId,
        status: "delivered",
      };
      updateMessageStatus(updateStatusData);
    }

    if (selectedChatRef.current?.chatId === data.chatId) {
      useIncomingMessageStore.setState({
        isIncomingMessage: true,
      });
      dispatch({ type: SET_MESSAGES, payload: { ...data.message, status: "seen" } });
      dispatch({
        type: UPDATE_LATEST_CHAT_MESSAGE,
        payload: { ...data.message, status: "seen" },
      });

      //send to db
      if (data.message.sender._id !== currentUserRef?.current?._id) {
        socketRef?.current?.emit("seenMessage", {
          receiverId: data.message.sender._id,
          chatId: data.chatId,
          messageId: data.message._id,
          status: "seen",
        });
        const pushData = {
          chatId: data?.chatId,
          messageId: data.message?._id as any,
          user: currentUserRef.current,
          status: "seen",
          onClickByseen: "false",
        };

        //emit event to server to sender
        socket.emit("seenPushGroupMessage", pushData);
        //update my side visible the user who seen
        dispatch({ type: SEEN_PUSH_USER_GROUP_MESSAGE, payload: pushData });
        pushSeenByMutation.mutate({
          chatId: data?.chatId,
          messageId: data.message?._id as any,
        });
        const updateStatusData = {
          chatId: data?.chatId,
          status: "seen",
        };
        updateMessageStatus(updateStatusData);
      }
    }
  }, []);

  //deletedAllMessageInChatNotify
  const deletedAllMessageInChatNotify = useCallback((data: any) => {

    if (data.chatId === selectedChatRef?.current?.chatId) {
      dispatch({ type: DELETE_ALL_MESSAGE_IN_CHAT,payload:data });
    } else {
      dispatch({ type: DELETE_ALL_MESSAGE_IN_CHAT,payload:{...data,type:"update-only-chats"} });
    }
  }, []);
  useEffect(() => {
    // Add event listeners
    socket.on("receiveMessage", handleSocketMessage);
    socket.on("receiveDeliveredMessage", handleDeliverMessage);
    socket.on("receiveSeenMessage", handleSeenMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    //add/remove online users
    socket.on("alreadyConnectedOnlineUsers", handleAlreadyConnectedOnlineUsers);
    socket.on("addOnlineUsers", handleOnlineUsers);
    socket.on("leaveOnlineUsers", handleLeaveOnlineUsers);
    //add/remove online users
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
    socket.on("userRemoveFromGroupNotifyReceived", handleUserRemoveFromGroupNotify);
    socket.on("makeAdminToGroupNotifyReceived", handleMakeAdminToGroupNotify);
    socket.on("adminRemoveFromGroupNotifyReceived", handleAdminRemoveFromGroupNotify);
    socket.on("seenPushGroupMessageReceived", handleSeenPushGroupMessage);
    socket.on("deliveredGroupMessageReceived", handleDeliveredGroupMessage);
    socket.on("update_group_info_Received", handleUpdate_group_info_Received);
    socket.on("groupNotifyReceived", handlegroupNotifyReceived);
    //block single chat

    socket.on("chatBlockedNotifyReceived", chatBlockedNotifyReceivedHandler);
    // Clean up event listeners when the component unmounts
    //call
    socket.on("received_incoming_call", handleIncomingCall);
    socket.on("user:call_accepted", handleCallAccepted);
    socket.on("user:call_rejected", handleCallRejected);
    socket.on("caller_call_rejected_received", handleCallRejected);
    socket.on("update:on-call-count_received", handleUpdateOnCallCount);
    socket.on("user-on-call-message_received", handleUserOnCallMessage);
    socket.on("deletedAllMessageInChatNotify", deletedAllMessageInChatNotify);
    return () => {
      //online events
      socket.off("addOnlineUsers", handleOnlineUsers);
      socket.off("leaveOnlineUsers", handleLeaveOnlineUsers);
      socket.on("alreadyConnectedOnlineUsers", handleAlreadyConnectedOnlineUsers);
      //message and typing events
      socket.off("receiveMessage", handleSocketMessage);
      socket.off("receiveSeenMessage", handleSeenMessage);
      socket.off("receiveDeliveredMessage", handleDeliverMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off(
        "singleChatDeletedNotifyReceived",
        singleChatDeletedNotifyReceivedHandler
      );
      socket.off(
        "receiveDeliveredAllMessageAfterReconnect",
        handleAllDeliveredAfterReconnect
      );
      // message event listeners
      socket.off("replyMessage", handleReplyMessage);
      socket.off("editMessage", handleEditMessage);
      socket.off("addReactionOnMessage", handleAddReactionOnMessage);
      socket.off("remove_remove_All_unsentMessage", handle_Remove_All_Unsent_Message);
      socket.off("chatBlockedNotifyReceived", chatBlockedNotifyReceivedHandler);
      //group events
      socket.off("groupCreatedNotifyReceived", groupCreatedNotifyHandler);
      socket.off("chatCreatedNotifyReceived", chatCreatedNotifyHandler);

      socket.off("userRemoveFromGroupNotifyReceived", handleUserRemoveFromGroupNotify);
      socket.off("makeAdminToGroupNotifyReceived", handleMakeAdminToGroupNotify);
      socket.off("adminRemoveFromGroupNotifyReceived", handleAdminRemoveFromGroupNotify);
      socket.off("groupChatLeaveNotifyReceived", groupChatLeaveNotifyReceivedHandler);
      socket.off("seenPushGroupMessageReceived", handleSeenPushGroupMessage);
      socket.off("deliveredGroupMessageReceived", handleDeliveredGroupMessage);
      socket.off("update_group_info_Received", handleUpdate_group_info_Received);
      socket.off("groupNotifyReceived", handlegroupNotifyReceived);
      //call
      socket.off("received_incoming_call", handleIncomingCall);
      socket.off("user:call_accepted", handleCallAccepted);
      socket.off("user:call_rejected", handleCallRejected);
      socket.off("caller_call_rejected_received", handleCallRejected);
      //update:on-call-count_received
      socket.off("update:on-call-count_received", handleUpdateOnCallCount);
      socket.off("user-on-call-message_received", handleUserOnCallMessage);
      socket.off("deletedAllMessageInChatNotify", deletedAllMessageInChatNotify);
    };
  }, []); //

  //show notification
  const playIncomingCallSound = new Howl({
    src: ["/audio/messenger_call_ring.mp3"],
    volume: 1,
    loop: true,
  });

  useEffect(() => {
    if (callInfo?.isIncomingCall) {
      playIncomingCallSound.play();
      showNotification(
        callInfo?.sender.name as string,
        callInfo?.sender.image as string,
        "Incoming call received"
      );
    } else {
      playIncomingCallSound.stop();
    }
    return () => {
      playIncomingCallSound.stop();
    };
  }, [callInfo]);
  //
  const playMycallingSound = new Howl({
    src: ["/audio/iphone_ring.mp3"],
    volume: 1,
    loop: true,
  });

  useEffect(() => {
    if (callInfo?.isMyCall === true) {
      playMycallingSound.play();
    } else {
      playMycallingSound.stop();
    }
    return () => {
      playMycallingSound.stop();
    };
  }, [callInfo]);
  return (
    <>
      {callInfo?.isMyCall && <MyCallPage />}
      {callInfo?.isIncomingCall && <IncomingCallDialog />}
      {callInfo?.isRejected && <RejectedCallDialog />}
    </>
  );
};

export default SocketEvents;
