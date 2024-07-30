export const removeLocalStorageChatItem = () => {
  localStorage.removeItem("chats");
  localStorage.removeItem("selectedChatId");
};
