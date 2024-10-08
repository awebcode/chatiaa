import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TabsContent } from "@/components/ui/tabs";
import { fileTypeChecker, updateSenderMessagesUI } from "@/config/functions";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { editMessage, replyMessage, sentMessage } from "@/apisActions/messageActions";
import useEditReplyStore from "@/store/useEditReply";
import { CameraIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Webcam from "react-webcam";

const ImageFiles = ({
  webcamRef,
  capturedImage,
  removeImageFile,
  handleDownloadImage,
  capturePhoto,
  clearCapturedPhoto,
}: {
  webcamRef: any;
  capturedImage: any[];
  removeImageFile: any;
  handleDownloadImage: any;
  capturePhoto: any;
  clearCapturedPhoto: any;
}) => {
  const { user: currentUser, messages, selectedChat } = useMessageState();
  const [loading, setloading] = useState<boolean>(false);
  const { cancelEdit, cancelReply, isEdit, isReply } = useEditReplyStore();
  const dispatch = useMessageDispatch();
  const sentFileMessage = async () => {
    if (!isEdit || !isReply) {
      try {
        if (capturedImage.length <= 0) return;

        setloading(true);
        const formData = new FormData();
        // Loop through files and update UI and formData for each file
        capturedImage.forEach(async (file) => {
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
        document.getElementById("cameraDialog")?.click();
        const res = await sentMessage(formData);
        if (res.status === 200) {
          document.getElementById("closeFileDialog")?.click();
          document.getElementById("cameraDialog")?.click();
          clearCapturedPhoto();
          setloading(false);
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        document.getElementById("cameraDialog")?.click();
        clearCapturedPhoto();
      }
    } else if (isEdit) {
      try {
        if (!selectedChat?.chatId && !isEdit) {
          return;
        }
        if (capturedImage.length <= 0) return;

        setloading(true);
        const formData = new FormData();

        // Loop through files and update UI and formData for each file
        capturedImage.forEach(async (file) => {
          const fileType: string = fileTypeChecker(file);

          try {
            const tempMessageId = await updateSenderMessagesUI(
              currentUser,
              selectedChat,
              file,
              fileType,
              dispatch,
              isEdit
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
        document.getElementById("cameraDialog")?.click();
        cancelEdit();
        const res = await editMessage(formData);
        if (res.success) {
          setloading(false);
          document.getElementById("closeFileDialog")?.click();
          document.getElementById("cameraDialog")?.click();
          clearCapturedPhoto();
          cancelEdit();
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        clearCapturedPhoto();
        document.getElementById("cameraDialog")?.click();
        cancelEdit();
      }
    } else if (isReply) {
      try {
        if (!selectedChat?.chatId && !isReply) {
          return;
        }
        if (capturedImage.length <= 0) return;

        setloading(true);
        const formData = new FormData();

        // Loop through files and update UI and formData for each file
        capturedImage.forEach(async (file) => {
          const fileType: string = fileTypeChecker(file);

          try {
            const tempMessageId = await updateSenderMessagesUI(
              currentUser,
              selectedChat,
              file,
              fileType,
              dispatch,
              isReply
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
        document.getElementById("cameraDialog")?.click();
        cancelReply();
        const res = await replyMessage(formData);
        if (res.success) {
          setloading(false);
          document.getElementById("closeFileDialog")?.click();
          document.getElementById("cameraDialog")?.click();
          clearCapturedPhoto();
          cancelReply();
        }
      } catch (error) {
        setloading(false);
      } finally {
        setloading(false);
        document.getElementById("closeFileDialog")?.click();
        document.getElementById("cameraDialog")?.click();
        clearCapturedPhoto();
        cancelReply();
      }
    }
    // socket.emit("sentMessage", socketData);

    document.getElementById("closeFileDialog")?.click();
    document.getElementById("cameraDialog")?.click();
  };
  return (
    <div>
      {" "}
      <TabsContent value="photo">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-auto object-cover"
        />
        <div className="flex gap-2">
          {" "}
          <Button
            disabled={(isEdit as any) && capturedImage.length > 0}
            size="lg"
            className="bg-blue-600 hover:bg-blue-600"
            onClick={capturePhoto}
          >
            <CameraIcon /> Capture Photo
          </Button>
          {capturedImage && capturedImage.length > 0 && (
            <Button
              size="lg"
              className="bg-rose-600 hover:bg-rose-500"
              onClick={clearCapturedPhoto}
            >
              Clear all
            </Button>
          )}
          <Button
            disabled={loading || capturedImage.length <= 0}
            size={"lg"}
            className="bg-blue-500 hover:bg-blue-700 duration-300"
            onClick={sentFileMessage}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-6 h-6 border-l-transparent border-t-2 border-yellow-500 rounded-full animate-spin"></div>
              </div>
            ) : isReply ? (
              "Sent reply images"
            ) : isEdit ? (
              "Sent edit image"
            ) : (
              "Sent"
            )}
          </Button>
        </div>
        {capturedImage && capturedImage.length > 0 && (
          <Carousel
            opts={{
              align: "center",
            }}
            className={`w-full max-w-sm ${
              capturedImage?.length <= 0 ? "hidden" : "block"
            }`}
          >
            <CarouselContent>
              {capturedImage?.map((file: any, index: number) => (
                <CarouselItem
                  key={index}
                  className={`relative basis-1/2 flex items-center    border border-blue-500
            }`}
                >
                  {/* URL.createObjectURL(file) */}
                  <div>
                    <Image
                      height={60}
                      width={60}
                      src={URL.createObjectURL(file)}
                      alt="image"
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                  <button
                    className="absolute right-1 top-1   bg-gray-100 rounded  focus:outline-none"
                    onClick={() => removeImageFile(file)}
                  >
                    <IoMdCloseCircleOutline className="text-rose-400 text-xl " />
                  </button>
                  <button
                    className="absolute right-1 bottom-0  bg-gray-100 rounded  focus:outline-none"
                    onClick={() => handleDownloadImage(file)}
                  >
                    <FaDownload className="text-blue-400 text-sm md:text-lg " />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={`${capturedImage?.length <= 2 ? "hidden" : "block"}`}
            />
            <CarouselNext
              className={`${capturedImage?.length <= 2 ? "hidden" : "block"}`}
            />
          </Carousel>
        )}
      </TabsContent>
    </div>
  );
};

export default ImageFiles;
