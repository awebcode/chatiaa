"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FiLink } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import { editMessage, replyMessage, sentMessage } from "@/functions/messageActions";
import useEditReplyStore from "@/store/useEditReply";
import { SET_MESSAGES } from "@/context/reducers/actions";
import { v4 } from "uuid";
import { fileTypeChecker, updateSenderMessagesUI } from "@/config/functions";

const ImageList = dynamic(() => import("./ListImage"));
const ActiveFile = dynamic(() => import("./ActiveFile"));
const InputList = dynamic(() => import("./InputList"));
const ImageCapture: React.FC = () => {
  const dispatch=useMessageDispatch()
  const { user: currentUser, messages, selectedChat } = useMessageState();

  const [files, setFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<File | null>();
  const [loading, setloading] = useState<boolean>(false);
  const { cancelEdit, cancelReply, isEdit, isReply } = useEditReplyStore();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isEdit && e.target.files) {
      const selectedFiles = e?.target?.files[0] ||[]
      setFiles([selectedFiles]);
    } else {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const setActive = (file: File) => {
    setActiveFile(file);
  };
  useEffect(() => {
    setActiveFile(files[0]);
  }, [files]);

  const sentFileMessage = async () => {
    if (!isEdit && !isReply) {
      try {
        if (files.length <= 0) return;

        setloading(true);
        const formData = new FormData();
        // Loop through files and update UI and formData for each file
        files.forEach(async (file) => {
          const fileType: string = fileTypeChecker(file);

          try {
            const tempMessageId = await updateSenderMessagesUI(
              currentUser,
              selectedChat,
              file,
              fileType,
              dispatch
            );
            formData.append("files", file);
            formData.append("tempMessageId", tempMessageId as string); // Associate tempMessageId with the file
          } catch (error) {
            console.error("Error updating sender messages UI:", error);
          }
        });
        formData.append("content", "");
        formData.append("type", "file");
        formData.append("chatId", selectedChat?.chatId as any);
        formData.append("receiverId", selectedChat?.userInfo?._id as any);
           document.getElementById("closeFileDialog")?.click();
        const res = await sentMessage(formData);
        if (res.status === 200) {
          document.getElementById("closeFileDialog")?.click();
          setFiles([]);
          setloading(false);
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        setFiles([]);
      }
    } else if (isEdit) {
      try {
        if (!selectedChat?.chatId && !isEdit) {
          return;
        }
        if (files.length <= 0) return;

        setloading(true);
        const formData = new FormData();

        // Loop through files and update UI and formData for each file
        files.forEach(async (file) => {
          const fileType: string = fileTypeChecker(file);

          try {
            const tempMessageId = await updateSenderMessagesUI(
              currentUser,
              selectedChat,
              file,
              fileType,
              dispatch
            );
            formData.append("files", file);
            formData.append("tempMessageId", tempMessageId as string); // Associate tempMessageId with the file
          } catch (error) {
            console.error("Error updating sender messages UI:", error);
          }
        });
        formData.append("messageId", isEdit?._id);
        formData.append("type", "file");
        formData.append("chatId", selectedChat?.chatId as any);
        formData.append("receiverId", selectedChat?.userInfo?._id as any);
          document.getElementById("closeFileDialog")?.click();
        const res = await editMessage(formData);
        if (res.success) {
          document.getElementById("closeFileDialog")?.click();
          setFiles([]);
          setloading(false);
          cancelEdit();
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        setFiles([]);
      }
    } else if (isReply) {
      try {
        if (!selectedChat?.chatId && !isReply) {
          return;
        }
        if (files.length <= 0) return;

        setloading(true);
        const formData = new FormData();

        // Loop through files and update UI and formData for each file
        files.forEach(async (file) => {
          const fileType: string = fileTypeChecker(file);

          try {
            const tempMessageId = await updateSenderMessagesUI(
              currentUser,
              selectedChat,
              file,
              fileType,
              dispatch
            );
            formData.append("files", file);
            formData.append("tempMessageId", tempMessageId as string); // Associate tempMessageId with the file
          } catch (error) {
            console.error("Error updating sender messages UI:", error);
          }
        });
        formData.append("messageId", isReply?._id);
        formData.append("type", "file");
        formData.append("chatId", selectedChat?.chatId as any);
        formData.append("receiverId", selectedChat?.userInfo?._id as any);
          document.getElementById("closeFileDialog")?.click();
        const res = await replyMessage(formData);
        if (res.success) {
          document.getElementById("closeFileDialog")?.click();
          setFiles([]);
          setloading(false);
          cancelReply();
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        setFiles([]);
        cancelReply();
      }
    }
 document.getElementById("closeFileDialog")?.click();
    // socket.emit("sentMessage", socketData);
  };

  return (
    <Dialog>
      <DialogTrigger className="p-1">
        <FiLink className="text-blue-600 cursor-pointer text-xl mx-2" />
      </DialogTrigger>

      <DialogContent className="z-50 max-w-[400px] ">
        {/* Active file*/}
        <ActiveFile activeFile={activeFile} removeFile={removeFile} />
        {files.length > 0 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              size={"lg"}
              className="bg-rose-500 hover:bg-rose-700 duration-300"
              onClick={() => {
                setFiles([]);
                document.getElementById("closeFileDialog")?.click();
              }}
            >
              Clear files
            </Button>
            <Button
              disabled={loading || files.length <= 0}
              size={"lg"}
              className="bg-blue-500 hover:bg-blue-700 duration-300"
              onClick={sentFileMessage}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-6 h-6 border-l-transparent border-t-2 border-yellow-500 rounded-full animate-spin"></div>
                </div>
              ) : isReply ? (
                "Sent reply files"
              ) : isEdit ? (
                "Sent edit file"
              ) : (
                "Sent files"
              )}
            </Button>
          </div>
        )}
        {/* Image List */}
        <ImageList
          files={files}
          setActive={setActive}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          removeFile={removeFile}
        />

        {/* input lists */}
        <InputList handleFileChange={handleFileChange} files={files} />
        <DialogClose id="closeFileDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCapture;
