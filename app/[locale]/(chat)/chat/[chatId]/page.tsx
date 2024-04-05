import React from "react";

const page = ({ params }: { params: { chatId: string } }) => {
  return (
    <div>
      {/* <ChatHeader/> */}
      {/* <PrefetchMessages chatId={params.chatId} />
          <Input/> */}

      <h1>Waiting for next update!</h1>
    </div>
  );
};

export default page;
