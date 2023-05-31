import { Component, Show, createEffect, createResource, createSignal, onCleanup } from "solid-js";
import { Request, sendRequest } from "../helpers/request";
import { useParams, A, useNavigate, useLocation } from "@solidjs/router";

import { Home } from "../views/Home";
import { Messages } from "../views/Messages";
import { Settings } from "../views/Settings";
import { Profile } from "../views/Profile";

import { ListingModal } from "../components/ListingModal";

import MessagesIcon from "../assets/comments-solid.svg?component-solid";
import HomeIcon from "../assets/house-chimney-solid.svg?component-solid";
import CreateIcon from "../assets/square-plus-solid.svg?component-solid";
import SettingsIcon from "../assets/gear-solid.svg?component-solid";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Dashboard: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userQuery, setUserQuery] = createSignal<Request>({
    url: `http://${VITE_SERVER_DOMAIN}/protected/user/data`,
    method: "GET",
  });
  const [user] = createResource(userQuery, sendRequest);

  const [queryListings, setQueryListing] = createSignal({} as Request);
  const [listings, { mutate }] = createResource(queryListings, sendRequest);

  const [displayModal, setDisplayModal] = createSignal(false);
  const [messagesView, setMessagesView] = createSignal(false);

  const highlightSection = (section: boolean): string => {
    if (section) {
      return "bg-slate-100/5 font-medium";
    }
    return "";
  };

  createEffect(() => {
    // @ts-ignore
    if (location.state?.modal) {
      setDisplayModal(true);
    }
  });

  createEffect(() => {
    if (useParams().view === "messages" || !!useParams().uuid) {
      setMessagesView(true);
    } else {
      setMessagesView(false);
    }
  });

  createEffect(() => {
    if (useParams().view === "home") {
      setQueryListing({
        url: `http://${VITE_SERVER_DOMAIN}/protected/listings/recent`,
        method: "GET",
      });
    }
  });

  return (
    <div class="flex h-screen w-full overflow-y-auto sm:flex-col-reverse sm:self-start">
      {/* Navigation */}
      <Show
        when={!user.loading}
        fallback={
          <nav
            class={`w-60 screen:sticky screen:top-0 screen:h-full screen:self-start md:w-fit sm:fixed sm:bottom-0 sm:z-[1] sm:flex sm:h-[65px] sm:justify-around ${
              messagesView() ? "screen:w-fit" : ""
            } bg-[#1B2234] p-3 text-white drop-shadow-xl sm:w-[100%] [&>*]:rounded [&>*]:p-2`}
          ></nav>
        }
      >
        <nav
          class={`w-60 screen:sticky screen:top-0 screen:h-full screen:self-start md:w-fit sm:fixed sm:bottom-0 sm:z-[1] sm:flex sm:h-[65px] sm:justify-around ${
            messagesView() ? "screen:w-fit" : ""
          } bg-[#1B2234] p-3 text-white drop-shadow-xl sm:w-[100%] [&>*]:rounded [&>*]:p-2`}
        >
          <div
            class={`${messagesView() ? "hidden" : "lg:block"} mb-4 hidden hover:cursor-pointer `}
            onClick={() => {
              navigate("/explore/home", { state: { modal: false } });
            }}
          >
            <div class="flex items-center">
              <p class={`text-[1.3em] md:hidden ${messagesView() ? "hidden" : ""}`}>InternHub</p>
            </div>
          </div>
          <A
            href="/explore/home"
            class={`mb-2 flex items-center justify-center hover:bg-slate-100/5 hover:font-medium md:w-fit sm:m-0 sm:w-[18%] ${highlightSection(
              useParams().view === "home"
            )}`}
          >
            <HomeIcon class={`w-[23px] fill-[#607FF2] pb-1 pt-1`} />
            <p class={`md:hidden ${messagesView() ? "hidden" : ""} mx-auto`}>Home</p>
          </A>
          <A
            href="/explore/messages"
            class={`mb-2 flex items-center justify-center hover:bg-slate-100/5 hover:font-medium md:w-fit sm:m-0 sm:w-[18%] ${highlightSection(
              messagesView()
            )}`}
          >
            <MessagesIcon class={`w-[23px] fill-[#607FF2] pb-1 pt-1`} />
            <p class={`md:hidden ${messagesView() ? "hidden" : ""} mx-auto`}>Messages</p>
          </A>
          <button
            class="mb-2 flex w-full items-center justify-center hover:bg-slate-100/5 hover:font-medium md:w-fit sm:m-0 sm:w-[18%]"
            onClick={() => {
              navigate("/explore/home", { state: { modal: true } });
            }}
          >
            <CreateIcon class="w-[22px] fill-[#607FF2] py-[1px]" />
            <p class={`md:hidden ${messagesView() ? "hidden" : ""} mx-auto`}>Create</p>
          </button>
          <A
            href={`/explore/profile/${user().id}`}
            class={`mb-2 flex items-center justify-center hover:bg-slate-100/5 hover:font-medium md:w-fit sm:m-0 sm:w-[18%] ${highlightSection(
              !!useParams().userId
            )}`}
          >
            <img src={user().profile.profilePicture} class={`w-[23px] rounded-lg py-[1px]`}></img>
            <p class={`md:hidden ${messagesView() ? "hidden" : ""} mx-auto`}>Profile</p>
          </A>
          <A
            href="/explore/settings"
            class={`mb-2 flex items-center justify-center hover:bg-slate-100/5 hover:font-medium md:w-fit sm:m-0 sm:w-[18%] ${highlightSection(
              useParams().view === "settings"
            )}`}
          >
            <SettingsIcon class={`w-[23px] fill-[#607FF2] pb-[2px] pt-[2px]`} />
            <p class={`md:hidden ${messagesView() ? "hidden" : ""} mx-auto`}>Settings</p>
          </A>
        </nav>

        <Show when={displayModal()}>
          <ListingModal setDisplayModal={setDisplayModal} user={user} mutate={mutate} />
        </Show>

        {/* Main Content */}
        <Show when={useParams().view === "home" && listings.state === "ready"}>
          <Home user={user} listings={listings} mutate={mutate} />
        </Show>

        {/* Use Async Transition Here */}
        <Show when={messagesView() && !user.loading}>
          <Messages user={user} />
        </Show>

        <Show when={!!useParams().userId}>
          <Profile user={user} />
        </Show>

        <Show when={useParams().view === "settings"}>
          <Settings />
        </Show>
      </Show>
    </div>
  );
};
