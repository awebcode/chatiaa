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
import { useMessageState } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import { sentMessage } from "@/functions/messageActions";

const ImageList = dynamic(() => import("./ListImage"));
const ActiveFile = dynamic(() => import("./ActiveFile"));
const InputList = dynamic(() => import("./InputList"));
const ImageCapture: React.FC = () => {
  const { user: currentUser, messages, selectedChat } = useMessageState();
  const [files, setFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<File | null>();
  const [loading, setloading] = useState<boolean>(false);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const setActive = (file: File) => {
    setActiveFile(file);
    console.log({ file });
  };
  useEffect(() => {
    setActiveFile(files[0]);
  }, [files]);

  const sentFileMessage = async () => {
    try {
      if (files.length <= 0) return;

      setloading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("content", "");
      formData.append("type", "file");
      formData.append("chatId", selectedChat?.chatId as any);
      formData.append("receiverId", selectedChat?.userInfo?._id as any);
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
              ) : (
                "Sent Files"
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
        <InputList handleFileChange={handleFileChange} />
        <DialogClose id="closeFileDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCapture;
