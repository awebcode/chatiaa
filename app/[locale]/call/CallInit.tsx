"use client";
import React from "react";
import {
  RightPanelExpandedType,
  ScenarioModel,
  ZegoUIKitPrebuilt,
} from "@zegocloud/zego-uikit-prebuilt";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useRouter } from "@/navigation";
import { useSocketContext } from "@/context/SocketContextProvider";
import { updateOnCallMembers } from "@/functions/authActions";
const CallPage = ({ roomId }: { roomId: string }) => {
  const router = useRouter();
  const { user: currentUser } = useMessageState();
  const { socket } = useSocketContext();
  const dispatch = useMessageDispatch();
  const meeting = (element: any) => {
    const appid = 860014501;
    const serverSecret = "458b61f8e100220cfce77a83ce180615";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appid,
      serverSecret,
      roomId, //roomId
      currentUser?._id as string,
      currentUser?.name //Name_${Math.floor(Math.random() * 1000)}
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp?.joinRoom({
      container: element,
      scenario: { mode: ScenarioModel?.GroupCall },
      sharedLinks: [
        {
          name: "Copy Join Link",
          url: window?.location?.href,
        },
      ],

      showRoomTimer: true, // Whether to display the timer. Not displayed by default.
      showRoomDetailsButton: true, // Whether to display the button that is used to check the room details. Displayed by default.
      showInviteToCohostButton: true, // Whether to show the button that is used to invite the audience to co-host on the host end.
      showRemoveCohostButton: true, // Whether to show the button that is used to remove the audience on the host end.
      showRequestToCohostButton: true, // Whether to show the button that is used to request to co-host on the audience end.
      rightPanelExpandedType: RightPanelExpandedType as any, // Controls the type of the information displayed on the right panel, display "None" by default.
      autoHideFooter: true, // Whether to automatically hide the footer (bottom toolbar), auto-hide by default. This only applies to mobile browsers.
      enableUserSearch: true, // Whether to enable the user search feature, false by default.
      branding: {
        logoURL:
          "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?size=338&ext=jpg&ga=GA1.1.1395880969.1709856000&semt=sph", // The branding LOGO URL.
      },
      // 1.4 Leaving view
      showLeavingView: true, // Whether to display the leaving view. Displayed by default.
      showLayoutButton: true, // Whether to display the button for switching layouts. Displayed by default.
      showNonVideoUser: true, // Whether to display the non-video participants. Displayed by default.
      showOnlyAudioUser: true, // Whether to display audio-only participants. Displayed by default.
      showLeaveRoomConfirmDialog: true, // When leaving the room, whether to display a confirmation pop-up window, the default is true
      //when leave a user from room only he navigated to chat
      onJoinRoom() {
        console.log(" onJoinRoom");
        socket.emit("update:on-call-count", {
          chatId: roomId,
          userId: currentUser?._id,
          user: currentUser,
          type: "join",
        });
        socket.emit("user-on-call-message", {
          message: `${currentUser?.name + " Joined the room"}`,
          chatId: roomId,
          user: currentUser,
          type: "init-user-join",
        });
        updateOnCallMembers({ chatId: roomId, type: "join" });
      },
      //only fired user side
      onLeaveRoom() {
        console.log("  onLeaveRoom");
        socket.emit("update:on-call-count", {
          chatId: roomId,
          user: currentUser,
          type: "leave",
        });
        socket.emit("user-on-call-message", {
          message: `${currentUser?.name + " Leave from the room"}`,
          chatId: roomId,
          user: currentUser,
          type: "init-user-leave",
        });
        updateOnCallMembers({ chatId: roomId, type: "leave" });
        router.push("/chat");
      },
      // //when join a user in room
      // onUserJoin(users) {
      //   console.log({ onUserJoin: users });
      //   socket.emit("user-on-call-message", {
      //     message: `${users[0].userName + " Joined the room"}`,
      //     chatId: roomId,
      //     userId: users[0].userID,
      //     type: "user-join",
      //   });
      // },
      // //when leave a user from room
      // onUserLeave(users) {
      //   console.log({ onUserLeave: users });
      //   socket.emit("user-on-call-message", {
      //     message: `${users[0].userName + " Leave from the room"}`,
      //     chatId: roomId,
      //     userId: users[0].userID,
      //     type: "user-leave",
      //   });
      // },
    });
  };
  return (
    <>
      <div ref={meeting} className="min-h-screen w-screen"></div>
    </>
  );
};

export default CallPage;
