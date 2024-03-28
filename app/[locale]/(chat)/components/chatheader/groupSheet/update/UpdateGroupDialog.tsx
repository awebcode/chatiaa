import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessageDispatch, useMessageState } from "@/context/MessageContext";
import { useSocketContext } from "@/context/SocketContextProvider";
import { UPDATE_GROUP_INFO } from "@/context/reducers/actions";
import { updateGroupNamePhoto } from "@/functions/chatActions";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { IoClose } from "react-icons/io5";
export default function UpdateGroupDialog() {
  const { socket } = useSocketContext();
  const { selectedChat } = useMessageState();
  const dispatch = useMessageDispatch();
  const [selectedImage, setSelectedImage] = useState<File | null | string>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");
  //set inital values
  useEffect(() => {
    setPreviewImage(selectedChat?.groupInfo?.image?.url as string);
    setGroupName(selectedChat?.chatName as string);
    setGroupDescription(selectedChat?.groupInfo?.description as string);
  }, [selectedChat]);

  const [errors, setErrors] = useState<{ groupName: string; groupDescription: string }>({
    groupName: "",
    groupDescription: "",
  });

  ////set errors when break rules
  useEffect(() => {
    const newErrors = { ...errors };

    // Check if group name exceeds character limit
    if (groupName.length > 100) {
      newErrors.groupName = "Group name must be 100 characters or less";
    } else {
      newErrors.groupName = "";
    }

    // Check if group description exceeds character limit
    if (groupDescription.length > 100) {
      newErrors.groupDescription = "Group description must be 100 characters or less";
    } else {
      newErrors.groupDescription = "";
    }

    setErrors(newErrors);
  }, [groupName, groupDescription]);

  const updateGroupMutation = useMutation({
    mutationKey: ["group"],
    mutationFn: (data: FormData) => updateGroupNamePhoto(data),
    onSuccess: (data) => {
      console.log({ updgrpData: data });
      dispatch({ type: UPDATE_GROUP_INFO, payload: data });
      socket.emit("update_group_info", data);
      toast.success("Group info updated!");
      document.getElementById("updateGroupDialog")?.click();
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("chatId", selectedChat?.chatId as any);
    formData.append("file", selectedImage as any);
    // Only append group name and description if they are not equal to the default values
    if (groupName !== selectedChat?.chatName) {
      formData.append("groupName", groupName);
    }

    if (groupDescription !== selectedChat?.groupInfo?.description) {
      formData.append("description", groupDescription);
    }
    updateGroupMutation.mutateAsync(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const isSubmitDisabled = () => {
    // Check if group name and description are both selected from selectedChat
    const isGroupNameSelected = groupName === selectedChat?.chatName;
    const isDescriptionSelected =
      groupDescription === selectedChat?.groupInfo?.description;

    // Check if group name or description exceeds 100 characters
    const isGroupNameExceedsLimit = groupName.length > 40;
    const isDescriptionExceedsLimit = groupDescription.length > 100;

    // Return true if either condition is met
    return (
      (isGroupNameSelected && isDescriptionSelected) ||
      isGroupNameExceedsLimit ||
      isDescriptionExceedsLimit
    );
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <FaEdit className="text-blue-600 cursor-pointer inline" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
          <DialogDescription>
            Make changes to the group here. Click save when you're done. all users in
            group will get notified.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {previewImage && (
            <div className="">
              <div className="w-full flex justify-center items-center flex-col">
                <div className=" relative h-36 w-36 rounded">
                  <img
                    src={previewImage}
                    loading="lazy"
                    alt="Preview"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  {!previewImage.includes("cloudinary") && (
                    <span
                      onClick={handleCancelImage}
                      className="absolute -top-3 -right-3 text-red-500 cursor-pointer bg-white  m-2 p-2 rounded-full"
                    >
                      <IoClose />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {(!previewImage || previewImage.includes("cloudinary")) && (
            <div className="">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
              />
            </div>
          )}
          <div className="">
            <Label htmlFor="groupName" className="text-right">
              Group Name
            </Label>
            <Input
              id="groupName"
              value={groupName}
              placeholder="Group name"
              defaultValue={selectedChat?.chatName}
              onChange={(e) => setGroupName(e.target.value)}
              className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
            />
            {errors.groupName && <span className="text-red-500">{errors.groupName}</span>}
          </div>
          <div className="">
            <Label htmlFor="groupName" className="text-right">
              Group Description
            </Label>
            <Textarea
              id="groupDescription"
              placeholder="Enter group description...."
              value={groupDescription}
              defaultValue={selectedChat?.groupInfo?.description}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="col-span-6 resize-none h-10 border"
            />
            {errors.groupDescription && (
              <span className="text-red-500">{errors.groupDescription}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size={"lg"}
            disabled={
              updateGroupMutation.isPending || (!selectedImage && isSubmitDisabled())
            }
            onClick={handleSubmit}
          >
            {updateGroupMutation.isPending ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
        <DialogClose id="updateGroupDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
