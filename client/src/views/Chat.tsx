import { Component, onCleanup, createSignal, For, createResource, Accessor, createEffect } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { io } from "socket.io-client";
import { ChatMessage, Relationship } from "../types";
import { Request, sendRequest } from "../helpers/request";
import { OptionsModal } from "../components/OptionsModal";

import OptionsIcon from "../assets/ellipsis-solid.svg?component-solid";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Chat: Component<any> = ({ user, updateLastMessage }) => {
  const location: any = useLocation();
  const navigate = useNavigate();

  const [queryChat, setQueryChat] = createSignal({
    url: `${VITE_SERVER_DOMAIN}/protected/messages/chat/${location.state.relationship.messageId}`,
    method: "GET",
  } as Request);
  const [chat, { mutate }] = createResource(queryChat, sendRequest);

  const [socket] = createSignal(io(`${VITE_SERVER_DOMAIN}`));
  const [message, setMessage] = createSignal("");
  const [isTyping, setIsTyping] = createSignal(false);
  const [displayModal, setDisplayModal] = createSignal(false);

  let typingDelay = setTimeout(() => {
    socket().emit("toggle-typing", { messageId: location.state.relationship.messageId, isTyping: false });
  }, 1000);

  socket().on("new-message", (payload: ChatMessage) => {
    mutate([payload, ...chat()]);

    updateLastMessage((relationships: Relationship[]) => {
      const idx = relationships.findIndex((relationship) => relationship.messageId === payload.messageId);
      let relationship = relationships[idx];

      relationship.lastMessage = payload.body;
      relationship.lastSenderId = payload.senderId;

      relationships.splice(idx, 1);
      relationships.unshift(relationship);
      return structuredClone(relationships);
    });
  });

  socket().on("toggle-typing", ({ isTyping }: { isTyping: boolean }) => {
    setIsTyping(isTyping);
  });

  createEffect(() => {
    socket().emit("join-chat", {
      messageId: location.state.relationship.messageId,
      userId: user().id,
    });

    setQueryChat({
      url: `${VITE_SERVER_DOMAIN}/protected/messages/chat/${location.state.relationship.messageId}`,
      method: "GET",
    } as Request);
  });

  createEffect(() => {
    if (message() === "") {
      socket().emit("toggle-typing", { messageId: location.state.relationship.messageId, isTyping: false });
    } else {
      clearTimeout(typingDelay);
      typingDelay = setTimeout(() => {
        socket().emit("toggle-typing", { messageId: location.state.relationship.messageId, isTyping: false });
      }, 1000);
    }
  });

  onCleanup(() => {
    clearTimeout(typingDelay);
    socket().disconnect();
  });

  const displayProfilePicture = (currSenderId: number, idx: Accessor<number>): boolean => {
    if (currSenderId !== user().id) {
      if (idx() - 1 >= 0) {
        if (chat()[idx() - 1].senderId !== currSenderId) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  };

  return (
    <div class="relative flex h-full w-full flex-col">
      <OptionsModal displayModal={displayModal} setDisplayModal={setDisplayModal}>
        <button class="px-[4em] py-3 text-red-500/90 hover:bg-slate-200/20">Block User</button>
      </OptionsModal>

      <div class="flex w-full items-center p-4">
        <img
          src={location.state.relationship.recipient.profile.profilePicture}
          class={`w-9 rounded-lg hover:cursor-pointer`}
          onClick={() => navigate(`/explore/profile/${location.state.relationship.recipientId}`)}
        ></img>
        <p class="ml-2">
          {location.state.relationship.recipient.firstName} {location.state.relationship.recipient.lastName}
        </p>

        {/* <OptionsIcon class="ml-auto w-6 hover:cursor-pointer" onClick={() => setDisplayModal(true)} /> */}
      </div>

      <div class="chat-container mb-2 flex flex-col-reverse overflow-y-auto overflow-x-hidden">
        <p class={`ml-4 text-[15px] text-slate-400/80 ${isTyping() ? "mt-2" : "hidden"}`}>
          {location.state.relationship.recipient.firstName} is typing...
        </p>

        <div class="mb-4"></div>

        <For each={chat()}>
          {(chatMessage: ChatMessage, idx) => (
            <div class="flex items-end">
              {displayProfilePicture(chatMessage.senderId, idx) && (
                <img
                  src={location.state.relationship.recipient.profile.profilePicture}
                  class={`w-[28px] rounded-full ${
                    chatMessage.senderId !== user().id && "mb-[2px] ml-4"
                  } hover:cursor-pointer`}
                  onClick={() => navigate(`/explore/profile/${location.state.relationship.recipientId}`)}
                />
              )}

              <div
                class={`${
                  chatMessage.senderId === user().id
                    ? "ml-auto mr-4 bg-[#3797F0] text-white"
                    : `mr-auto ${
                        !displayProfilePicture(chatMessage.senderId, idx) ? "ml-[52px]" : "ml-2"
                      } bg-slate-200`
                } mb-[2px] max-w-[50%] break-words rounded-2xl p-2`}
              >
                <p class="text-sm">{chatMessage.body}</p>
              </div>
            </div>
          )}
        </For>
      </div>

      <form
        class="mb-1 flex h-fit items-center p-2"
        onSubmit={(e) => {
          e.preventDefault();

          if (message() !== "") {
            socket().emit("new-message", {
              isNewRelationship: location.state.newRelationship,
              relationship: location.state.relationship,
              messageId: location.state.relationship.messageId,
              senderId: user().id,
              body: message(),
            });
            setMessage("");
            location.state.newRelationship = false;
          }
        }}
      >
        <input
          type="text"
          placeholder="Send a Message..."
          class="mr-3 h-10 w-full rounded-lg border-2 p-2 text-sm focus:outline-none"
          value={message()}
          onInput={(e) => {
            setMessage(e.target.value);
            socket().emit("toggle-typing", {
              messageId: location.state.relationship.messageId,
              isTyping: true,
            });
          }}
        />
        <button class="mr-2">Send</button>
      </form>
    </div>
  );
};
