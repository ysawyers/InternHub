import { Component, createEffect } from "solid-js";
import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { useRequestContext } from "../contexts/RequestProvider";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";

import validator from "validator";
import axios from "axios";
import { redirectAuthenticatedUser } from "../helpers/request";

const { VITE_SERVER_DOMAIN } = import.meta.env;

type errorTypes = "email" | "firstName" | "lastName" | "password" | "confirmPassword" | "dob";

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dob: string;
}

export const Landing: Component = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useRequestContext();

  const [newUser, setNewUser] = createStore<NewUser>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
  } as NewUser);

  const [errorTag, setErrorTag] = createSignal("");
  const [error, setError] = createSignal("");

  createEffect(redirectAuthenticatedUser);

  const validateFields = () => {
    const vEmail = validator.isEmail(newUser.email, {
      allow_utf8_local_part: false,
    });
    const vFirstNameLen = validator.isLength(newUser.firstName, { min: 2, max: 15 });
    const vFirstNameAlph = validator.isAlpha(newUser.firstName, "en-US");
    const vLastNameLen = validator.isLength(newUser.lastName, { min: 2, max: 15 });
    const vLastNameAlph = validator.isAlpha(newUser.lastName, "en-US");
    const vPassword = validator.isLength(newUser.password, { min: 8, max: 254 });

    if (!vEmail) {
      setErrorTag("email");
      throw new Error("Email is invalid");
    }

    if (!vFirstNameLen || !vFirstNameAlph) {
      setErrorTag("firstName");
      throw new Error("First name is invalid");
    }

    if (!vLastNameLen || !vLastNameAlph) {
      setErrorTag("lastName");
      throw new Error("Last name is invalid");
    }

    if (!vPassword) {
      setErrorTag("password");
      throw new Error("Password length is invalid! (min. 8 characters)");
    }

    if (newUser.password !== newUser.confirmPassword) {
      setErrorTag("confirmPassword");
      throw new Error("Passwords do not match");
    }

    if (!newUser.dob) {
      setError("dob");
      throw new Error("Must provide a valid date of birth");
    }
  };

  const toggleErrorHighlight = (defaultStyling: string, inputType: errorTypes) => {
    if (inputType === errorTag()) {
      return defaultStyling + " border-red-500";
    }
    return defaultStyling;
  };

  const registerWithDefault = async (e: Event) => {
    setError("");
    setErrorTag("");

    try {
      validateFields();

      const res = await axios({
        method: "post",
        url: `${VITE_SERVER_DOMAIN}/public/default-register`,
        data: newUser,
        withCredentials: true,
      });
      setAccessToken(res.data.accessToken);

      navigate("/explore/home", { replace: true });
    } catch (err: any) {
      const log = err.response?.data || err.message;
      setError(log);
    }
  };

  const registerWithGoogle = (e: Event) => {
    console.log("Login With Google");
  };

  return (
    <>
      <div class="flex h-[24em] w-full flex-wrap justify-around bg-gradient-to-r from-[#4C51C6] to-[#607FF2]">
        {/* Call To Action */}
        <div class="mt-24 text-white md:text-center">
          <h1 class="mb-8 text-4xl">InternHub</h1>
          <h2 class="mb-4 text-2xl ">Looking forward to your internship?</h2>
          <p class="text-md">Let's take care of the hassle of finding a roomate.</p>
        </div>

        {/* line-break */}
        <div class="h-0 md:basis-full"></div>

        {/* Form */}
        <section class="mt-12 rounded bg-white p-6 drop-shadow-lg">
          <header>
            <h1 class="mb-6 text-xl font-medium">Create Account</h1>
          </header>
          <form onSubmit={(e) => e.preventDefault()}>
            <div class="flex">
              <div class="mr-2">
                <label for="first-name" class="block">
                  First Name
                </label>
                <input
                  type="text"
                  id="first-name"
                  class={toggleErrorHighlight("block rounded border p-1", "firstName")}
                  placeholder="John"
                  value={newUser.firstName}
                  onInput={(e) => setNewUser("firstName", e.target.value)}
                ></input>
              </div>
              <div class="ml-2">
                <label for="last-name" class="block">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last-name"
                  class={toggleErrorHighlight("block rounded border p-1", "lastName")}
                  placeholder="Doe"
                  value={newUser.lastName}
                  onInput={(e) => setNewUser("lastName", e.target.value)}
                ></input>
              </div>
            </div>
            <br></br>

            <label for="email" class="block">
              Email
            </label>
            <input
              type="text"
              id="email"
              class={toggleErrorHighlight("block w-full rounded border p-1", "email")}
              placeholder="name@example.com"
              value={newUser.email}
              onInput={(e) => setNewUser("email", e.target.value)}
            ></input>
            <br></br>

            <label for="dob" class="block">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              class={toggleErrorHighlight("text-md w-full rounded border p-1 focus:outline-none", "dob")}
              onChange={(e) => setNewUser("dob", e.target.value)}
            />
            <br></br>
            <br></br>

            <label for="password" class="block">
              Password
            </label>
            <input
              type="password"
              id="password"
              class={toggleErrorHighlight("block w-full rounded border p-1", "password")}
              value={newUser.password}
              onInput={(e) => setNewUser("password", e.target.value)}
            ></input>
            <br></br>

            <label for="confirm-password" class="block">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Re-enter password"
              class={toggleErrorHighlight("block w-full rounded border p-1", "confirmPassword")}
              value={newUser.confirmPassword}
              onInput={(e) => setNewUser("confirmPassword", e.target.value)}
            ></input>
            <br></br>

            <button class="mb-2 w-full bg-[#FD830D] p-2 text-white" onClick={registerWithDefault}>
              Sign Up!
            </button>
          </form>

          <div class="text-center">
            <A href="login" class="text-sm">
              already have an account?
            </A>

            <p class="mt-2 text-sm text-red-500">{error()}</p>
          </div>

          {/* 
          <hr></hr>

          <div
            class="mt-5 flex w-full items-center justify-center border-2 p-2 hover:cursor-pointer"
            onClick={registerWithGoogle}
          >
            <img src={googleIcon} alt="Google Icon" class="h-8"></img>
            <p class="text-md mx-auto">Sign in with Google</p>
          </div> */}
        </section>
      </div>
    </>
  );
};
