import { A, useNavigate } from "@solidjs/router";
import { Component, createEffect, createSignal } from "solid-js";

import validator from "validator";
import axios from "axios";

import googleIcon from "../assets/icons8-google-48.png";
import { useRequestContext } from "../contexts/RequestProvider";
import { redirectAuthenticatedUser } from "../helpers/request";

type errorTypes = "email" | "password";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Login: Component = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useRequestContext();

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const [error, setError] = createSignal("");
  const [errorTag, setErrorTag] = createSignal("");

  createEffect(redirectAuthenticatedUser);

  const validateFields = () => {
    const vEmail = validator.isEmail(email(), { allow_utf8_local_part: false });
    const vPassword = validator.isLength(password(), { min: 8, max: 254 });

    if (!vEmail) {
      setErrorTag("email");
      throw new Error("Email is invalid!");
    }

    if (!vPassword) {
      setErrorTag("password");
      throw new Error("Password is invalid!");
    }
  };

  const loginWithDefault = async () => {
    setErrorTag("");

    try {
      validateFields();

      const res = await axios({
        method: "post",
        url: `${VITE_SERVER_DOMAIN}/public/default-login`,
        data: {
          email: email(),
          password: password(),
        },
        withCredentials: true,
      });
      setAccessToken(res.data.accessToken);

      navigate("/explore/home", { replace: true });
    } catch (err: any) {
      const log = err.response?.data || err.message;
      setError(log);
    }
  };

  const loginWithGoogle = () => {
    console.log("Login with google!");
  };

  const toggleErrorHighlight = (defaultStyling: string, inputType: errorTypes) => {
    if (inputType === errorTag()) {
      return defaultStyling + " border-red-500";
    }
    return defaultStyling;
  };

  return (
    <div class="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#4C51C6] to-[#607FF2]">
      <section class="rounded bg-white p-6 drop-shadow-lg">
        <header>
          <h1 class="mb-6 text-xl font-medium">Login</h1>
        </header>
        <form onSubmit={(e) => e.preventDefault()} onsubmit={loginWithDefault}>
          <div class="mb-8">
            <label for="email" class="block">
              Email
            </label>
            <input
              type="text"
              id="email"
              class={toggleErrorHighlight("w-80 rounded border p-1 focus:outline-none", "email")}
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
            ></input>
            <label for="password" class="mt-4 block">
              Password
            </label>
            <input
              type="text"
              id="password"
              class={toggleErrorHighlight("w-80 rounded border p-1 focus:outline-none", "password")}
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
            ></input>
          </div>

          <button class="mb-2 w-full bg-[#FD830D] p-2 text-white">Login</button>
        </form>

        <div class="mb-4 text-center">
          <A href="/" class="text-sm">
            Don't have an account?
          </A>

          <p class="mt-2 text-sm text-red-500">{error()}</p>
        </div>

        {/* <hr></hr>

        <div
          class="mt-5 flex w-full items-center justify-center border-2 p-2 hover:cursor-pointer"
          onClick={loginWithGoogle}
        >
          <img src={googleIcon} alt="Google Icon" class="h-8"></img>
          <p class="text-md mx-auto">Sign in with Google</p>
        </div> */}
      </section>
    </div>
  );
};
