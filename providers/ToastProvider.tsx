"use client";

import React, { ReactNode } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ToastProvider = () => {
  return (
    <>
      <ToastContainer
        position="top-left"
        autoClose={false}
        limit={4}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
        transition={Bounce}
      />
    </>
  );
};

export default ToastProvider;
