"use client";
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
import { useMessageState } from "@/context/MessageContext";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { IoClose } from "react-icons/io5";
import { updateUser } from "@/functions/authActions";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Tuser } from "@/store/types";
import RevalidateTag from "@/functions/serverActions";
import LoaderComponent from "@/components/Loader";
export default function UpdateMyProfileDialog({currentUser}:{currentUser:Tuser}) {
  // const { user: currentUser } = useMessageState();
  const [selectedImage, setSelectedImage] = useState<File | null | string>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  //set inital values
  useEffect(() => {
    setPreviewImage(currentUser?.image as string);
    setName(currentUser?.name as string);
    setBio(currentUser?.bio as string);
  }, [currentUser]);

  const [errors, setErrors] = useState<{ name: string; bio: string; password: string }>({
    name: "",
    bio: "",
    password: "",
  });

  ////set errors when break rules
  useEffect(() => {
    const newErrors = { ...errors };

    // Check if group name exceeds character limit
    if (name?.length > 20) {
      newErrors.name = "User name must be under 20 characters or less";
    } else {
      newErrors.name = "";
    }

    // Check if group description exceeds character limit
    if (bio?.length > 100) {
      newErrors.bio = "Bio must be under 100 characters or less";
    } else {
      newErrors.bio = "";
    }
    // Check if password length is less than 6 or greater than 20
    if (password?.length < 6 ) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password.length > 20) {
      newErrors.password = "Password should less than 20  characters";
    } else {
      newErrors.password = "";
    }
    setErrors(newErrors);
  }, [name, bio, password]);

  const updateUserMutation = useMutation({
    mutationKey: ["users"],
    mutationFn: (data: FormData) => updateUser(data),
    onSuccess: (data) => {
      //   dispatch({ type: UPDATE_GROUP_INFO, payload: data });
      //   socket.emit("update_group_info", data);
       setName("");
       setBio("");
      RevalidateTag("my-profile")
      toast.success("User info updated!");
      document.getElementById("updateCurrentUserDialog")?.click();
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("userId", currentUser?._id as any);
    formData.append("file", selectedImage as any);
    // Only append group name and description if they are not equal to the default values
    if (name !== currentUser?.name) {
      formData.append("name", name);
    }

    if (bio !== currentUser?.bio) {
      formData.append("bio", bio);
    }
    if (password) {
      formData.append("password", password);
    }
    updateUserMutation.mutateAsync(formData);
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
    const isnameSelected = name === currentUser?.name;
    const isBioSelected = bio === currentUser?.bio;

    // Check if group name or description exceeds 100 characters
    const isnameExceedsLimit = name?.length > 40;
    const isBioExceedsLimit = bio?.length > 100;

    // Return true if either condition is met
    return (
      (isnameSelected && isBioSelected) ||
      isnameExceedsLimit ||
 
      isBioExceedsLimit
    );
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <FaEdit className="text-blue-600 cursor-pointer inline" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to the profile here. Click save when you're document
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {previewImage && (
            <div className="">
              <div className="w-full flex justify-center items-center flex-col">
                <div className=" relative h-24 w-24 rounded-lg ">
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
          {(!previewImage ||
            !previewImage.includes("blob") ||
            previewImage.includes("cloudinary")) && (
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
            <Label htmlFor="name" className="text-right">
              User Name
            </Label>
            <Input
              id="name"
              value={name}
              defaultValue={currentUser?.name}
              placeholder="username..."
              onChange={(e) => setName(e.target.value)}
              className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
            />
            {errors.name && <span className="text-red-500">{errors.name}</span>}
          </div>

          {/* password */}

          <div className="">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="password..."
                onChange={(e) => setPassword(e.target.value)}
                className="shadow-lg w-full h-auto bg-transparent  text-[10px] md:text-sm py-3 px-3 rounded-md  outline-none border border-gray-400  transition-all duration-300"
              />
              {showPassword ? (
                <FiEye
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 caret-lime-400"
                />
              ) : (
                <FiEyeOff
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 caret-lime-400"
                />
              )}
            </div>
            {errors.password && <span className="text-red-500">{errors.password}</span>}
          </div>
          <div className="">
            <Label htmlFor="bio" className="text-right">
              User bio
            </Label>
            <Textarea
              id="bio"
              placeholder="User bio...."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-6 resize-none h-10 border"
            />
            {errors.bio && <span className="text-red-500">{errors.bio}</span>}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            size={"lg"}
            disabled={
              updateUserMutation.isPending || (!selectedImage && isSubmitDisabled())
            }
            onClick={handleSubmit}
          >
            {updateUserMutation.isPending ? (
              <LoaderComponent text="Saving..." />
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
        <DialogClose id="updateCurrentUserDialog" className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
