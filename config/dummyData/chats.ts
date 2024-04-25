export const inittialDummyChats = [
  {
    _id: 1,
    users: [
      {
        _id: 1,
        name: "test",
        image: "test",
        email: "test@gmail.com",
        onlineStatus: "online",
        createdAt: Date.now(),
      },
      {
        _id: 2,
        name: "test2",
        image: "test2",
        email: "test2@gmail.com",
        onlineStatus: "offline",
        createdAt: Date.now(),
      },
    ],
    isGroupChat: false,
    isOnline: true,
    latestMessage: {
      _id: 1,
      content: "Hello world",
      type: "text",
      createdAt: Date.now(),
      sender: {
        _id: 1,
        name: "test",
        image: "test",
        email: "test@gmail.com",
        onlineStatus: "online",
        createdAt: Date.now(),
      },
    },
  },

  {
    _id: 2,
    users: [
      {
        _id: 1,
        name: "test",
        image: "test",
        email: "test@gmail.com",
        onlineStatus: "online",
        createdAt: Date.now(),
      },
      {
        _id: 3,
        name: "test3",
        image: "test3",
        email: "test3@gmail.com",
        onlineStatus: "offline",
        createdAt: Date.now(),
      },
    ],
    isGroupChat: false,
    isOnline: true,
    latestMessage: {
      _id: 2,
      content: "Oii dear",
      type: "text",
      createdAt: Date.now(),
      sender: {
        _id: 4,
        name: "test4",
        image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
        email: "test4@gmail.com",
        onlineStatus: "online",
        createdAt: Date.now(),
      },
    },
  },
];
