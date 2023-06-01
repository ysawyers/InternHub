import { Component, For, Show, createEffect, createResource, createSignal } from "solid-js";
import { Request, sendRequest } from "../helpers/request";
import { Relationship } from "../types";
import { Chat } from "./Chat";
import { useParams, useNavigate, useLocation } from "@solidjs/router";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Messages: Component<any> = ({ user }) => {
  const navigate = useNavigate();
  const location: any = useLocation();

  const [messagesQuery] = createSignal<Request>({
    url: `${VITE_SERVER_DOMAIN}/protected/messages/relationships`,
    method: "GET",
  });
  const [messages, { mutate }] = createResource(messagesQuery, sendRequest);

  const [updatedList, setUpdatedList] = createSignal(false);

  createEffect(() => {
    if (location.state?.newRelationship && !updatedList()) {
      if (messages.state === "ready") {
        mutate([location.state.relationship, ...messages()]);
        setUpdatedList(true);
      }
    }
  });

  return (
    <div class="flex h-full w-full">
      {/* Messages Nav Container */}
      <div class="messages-sidebar shrink-0 overflow-y-scroll bg-[#374982] text-white drop-shadow-lg lg:w-80">
        <p class="p-4 text-lg font-medium md:hidden">{`${user().firstName}'s`} Messages</p>
        <Show when={!messages.loading}>
          <For each={messages()}>
            {(relationship: Relationship) => (
              <section
                class={`${
                  useParams().uuid === relationship.messageId && "bg-slate-100/10"
                }   p-3 hover:cursor-pointer hover:bg-slate-100/10`}
                onClick={() => {
                  navigate(`/explore/messages/${relationship.messageId}`, {
                    state: {
                      newRelationship: false,
                      relationship: relationship,
                    },
                  });
                }}
              >
                <div class="flex h-full w-fit items-center">
                  <img src={relationship.recipient.profile.profilePicture} class={`w-12 rounded-lg`}></img>
                  <div class="ml-3 md:hidden">
                    <p class="mb-1 text-[14px]">
                      {relationship.recipient.firstName} {relationship.recipient.lastName}
                    </p>
                    <Show when={!!relationship.lastMessage} fallback={<p class="text-xs">Send a message!</p>}>
                      <p class="text-xs">
                        {relationship.lastSenderId === user().id ? "You" : relationship.recipient.firstName}:{" "}
                        {relationship.lastMessage.substring(0, 40 - relationship.recipient.firstName.length)}
                        {relationship.lastMessage.substring(0, 40 - relationship.recipient.firstName.length)
                          .length < relationship.lastMessage.length && "..."}
                      </p>
                    </Show>
                  </div>
                </div>
              </section>
            )}
          </For>
        </Show>
      </div>

      <Show when={!!useParams().uuid}>
        <Chat user={user} updateLastMessage={mutate} />
      </Show>
    </div>
  );
};
