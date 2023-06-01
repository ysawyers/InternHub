import { Component, createEffect, createResource, createSignal } from "solid-js";
import { Request, sendRequest } from "../helpers/request";
import { useNavigate } from "@solidjs/router";
import { useRequestContext } from "../contexts/RequestProvider";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Settings: Component = () => {
  const { setAccessToken } = useRequestContext();
  const navigate = useNavigate();

  const [queryLogout, setQueryLogout] = createSignal({} as Request);
  const [loggedOut] = createResource(queryLogout, sendRequest);

  createEffect(() => {
    if (loggedOut.state === "ready") {
      setAccessToken("");
      navigate("/login", { replace: true });
    }
  });

  return (
    <div class="settings-container md:w-full sm:w-full">
      <button
        class="m-2 w-24 rounded bg-red-500 p-2 text-white"
        onClick={() => {
          setQueryLogout({
            url: `${VITE_SERVER_DOMAIN}/protected/user/logout`,
            method: "DELETE",
            withCredentials: true,
          });
        }}
      >
        Logout
      </button>
    </div>
  );
};
