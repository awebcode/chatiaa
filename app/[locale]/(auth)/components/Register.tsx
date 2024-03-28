"use client";
import { registerUser } from "@/functions/authActions";
import { signIn, useSession } from "next-auth/react";
import { Link, useRouter } from "@/navigation";
import React, { FormEvent, useState } from "react";
import Image from "next/image";

const Register = () => {
  const [loading, setloading] = useState(false);
  const { data: session } = useSession();
  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  const handleGithubLogin = async () => {
    await signIn("github");
  };

  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setloading(true);
    const formData = new FormData(e.currentTarget);
    const registerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
    const { name, email, password } = registerData;
    if (!name || !email || !password) {
      return setError("Plese fill all the fields!");
    }
    if ((registerData as any).password?.length < 6) {
      setloading(false);
      return setError("Password must be at least 6 charecters");
    }
    const data = await registerUser(registerData);
    if (data && !data.user) {
      setloading(false);
      console.log({ data });
      return setError(data?.response?.data?.message);
    }
    if (data.user) {
      const res = await signIn("credentials", {
        email: data.user.email,
        password: formData.get("password"),
        redirect: false,
      });
      setloading(false);
      if (res?.error) {
        setloading(false);
        console.log(res);
        return setError(res.error);
      }
      if (res?.ok) return router.push("/chat");
    }
  };
  if (session?.user) router.push("/chat");
  return (
    <div className=" min-h-screen p-5">
      <div className="max-w-lg mx-auto   bg-white dark:bg-gray-800 p-8 rounded-xl shadow dark:shadow-none shadow-slate-300 dark:border dark:border-indigo-600">
        <h1 className="text-4xl font-medium ">Signup</h1>
        <p className="">Hi, Welcome back 👋</p>

        <div className="my-5">
          <button
            onClick={handleGoogleLogin}
            className="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg  hover:border-slate-400 hover:text-gray-100 hover:shadow transition duration-150"
          >
            <Image
              height={24}
              width={24}
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-6 h-6"
              alt=""
              loading="lazy"
            />{" "}
            <span>Login with Google</span>
          </button>
        </div>

        <div className="my-5">
          <button
            onClick={handleGithubLogin}
            className="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg  hover:border-slate-400 hover:text-gray-100 hover:shadow transition duration-150"
          >
            <Image
              height={24}
              width={24}
              quality={100}
              src="/github.svg"
              className="w-6 h-6 object-cover"
              alt=""
              loading="lazy"
            />{" "}
            <span>Login with Github</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="my-10">
          {error && <div className="bg-red-700 text-white p2 mb-2">{error}</div>}
          <div className="flex flex-col space-y-5">
            <label htmlFor="name">
              <p className="font-medium  pb-2">name</p>
              <input
                id="name"
                name="name"
                type="name"
                className="w-full dark:bg-gray-200 dark:text-black py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter name"
              />
            </label>
            <label htmlFor="email">
              <p className="font-medium  pb-2">Email address</p>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full dark:bg-gray-200 dark:text-black py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter email address"
              />
            </label>
            <label htmlFor="password">
              <p className="font-medium  pb-2">Password</p>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full dark:bg-gray-200 dark:text-black py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow"
                placeholder="Enter your password"
              />
            </label>
            <div className="flex flex-row justify-between">
              <div>
                <label htmlFor="remember" className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 border-slate-200 focus:bg-indigo-600"
                  />
                  Remember me
                </label>
              </div>
              <div>
                <Link href="#" className="font-medium text-indigo-600">
                  Forgot Password?
                </Link>
              </div>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>
                {loading ? (
                  <span className="animate-pulse">Creating...</span>
                ) : (
                  "Register"
                )}
              </span>
            </button>
            <p className="text-center">
              already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 font-medium inline-flex space-x-1 items-center"
              >
                <span>login now </span>
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
