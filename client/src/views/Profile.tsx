import { Component, Show, createEffect, createResource, createSignal } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { Request, sendRequest } from "../helpers/request";

import { EditProfileModal } from "../components/EditProfileModal";

import MessageIcon from "../assets/paper-plane-solid.svg?component-solid";
import BirthdayIcon from "../assets/cake-candles-solid.svg?component-solid";
import PencilIcon from "../assets/pencil-solid.svg?component-solid";
import OptionsIcon from "../assets/ellipsis-solid.svg?component-solid";
import { OptionsModal } from "../components/OptionsModal";
import { v4 as uuidv4 } from "uuid";
import { Relationship } from "../types";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Profile: Component<any> = ({ user }) => {
  const [profileQuery, setProfileQuery] = createSignal<Request>({} as Request);
  const [profile, { mutate }] = createResource(profileQuery, sendRequest);

  const [queryRelationship, setQueryRelationship] = createSignal({} as Request);
  const [relationship] = createResource(queryRelationship, sendRequest);

  const [queryBlockUser, setQueryBlockUser] = createSignal({} as Request);
  const [blocked] = createResource(queryBlockUser, sendRequest);

  const [showEditProfile, setShowEditProfile] = createSignal(false);
  const [displayModal, setDisplayModal] = createSignal(false);
  const [displayOptionsModal, setDisplayOptionsModal] = createSignal(false);

  const isMyProfile = () => user().id === parseInt(useParams().userId);
  const age = () => {
    const diff = new Date().getFullYear() - new Date(profile().dob).getFullYear();
    if (new Date(profile().dob).getMonth() < new Date().getMonth()) {
      return diff;
    }
    return diff - 1;
  };

  const navigate = useNavigate();

  createEffect(() => {
    setProfileQuery({
      url: `http://${VITE_SERVER_DOMAIN}/protected/user/profile/${useParams().userId}`,
      method: "GET",
    });
  });

  createEffect(() => {
    if (blocked.state === "ready") {
      setDisplayOptionsModal(false);
      navigate("/explore/home");
    }
  });

  createEffect(() => {
    if (relationship.state === "ready") {
      if (Object.keys(relationship()).length === 0) {
        const tempMessageId = uuidv4();
        const tempRelationship = {
          messageId: tempMessageId,
          recipientId: parseInt(useParams().userId),
          lastMessage: "",
          lastSenderId: user().id,
          recipient: {
            firstName: profile().firstName,
            lastName: profile().lastName,
            profile: {
              profilePicture: profile().profile.profilePicture,
            },
          },
        } as Relationship;
        navigate(`/explore/messages/${tempMessageId}`, {
          state: {
            newRelationship: true,
            relationship: tempRelationship,
          },
        });
      } else {
        navigate(`/explore/messages/${relationship().messageId}`, {
          state: {
            newRelationship: false,
            relationship: relationship(),
          },
        });
      }
    }
  });

  return (
    <>
      <div class="profile-container md:w-full">
        <div class="h-full w-[80%] px-3 pt-4 md:w-[85%] sm:w-full">
          <div class="relative w-full rounded-lg bg-[#374982]/80 drop-shadow-md">
            <Show when={!profile.loading}>
              {isMyProfile() && (
                <div
                  class="absolute z-[2] flex h-full w-full items-center justify-center rounded-lg hover:cursor-pointer hover:bg-black/40"
                  onMouseOver={() => setShowEditProfile(true)}
                  onMouseLeave={() => setShowEditProfile(false)}
                  onClick={() => setDisplayModal(true)}
                >
                  {showEditProfile() && (
                    <div class="flex">
                      <PencilIcon class="mr-2 w-[19px] fill-white" />
                      <p class="text-white">Edit Profile</p>
                    </div>
                  )}
                </div>
              )}

              <div class="flex items-center p-4 text-white">
                <img src={profile().profile.profilePicture} class={`w-[60px] rounded-lg`}></img>
                <div class="ml-3 flex h-[60px] w-full flex-col justify-between">
                  <div class="flex w-full">
                    <p class="text-lg font-bold">
                      {profile().firstName} {profile().lastName}
                    </p>
                    {!isMyProfile() && (
                      <>
                        <MessageIcon
                          class="ml-auto mr-2 w-[19px] fill-white hover:cursor-pointer"
                          onClick={() =>
                            setQueryRelationship({
                              url: `http://${VITE_SERVER_DOMAIN}/protected/messages/relationship/${
                                profile().id
                              }`,
                              method: "GET",
                            })
                          }
                        />
                        <OptionsIcon
                          class="ml-2 w-[19px] fill-white hover:cursor-pointer"
                          onClick={() => setDisplayOptionsModal(true)}
                        />
                      </>
                    )}
                  </div>

                  <div class="mb-2 flex text-xs">
                    <BirthdayIcon class="w-[11px] fill-white" />
                    <p class="ml-[5px] text-[11px] font-bold">{age()}</p>
                  </div>
                </div>
              </div>

              <Show when={profile().profile.bio.length > 0}>
                <div class="mt-4 px-4 pb-4 text-white">
                  <p class="mb-1 text-[15px] font-bold">About Me</p>
                  <p class="break-words text-[14px]">{profile().profile.bio}</p>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>

      <Show when={displayModal()}>
        <EditProfileModal profile={profile} setDisplayModal={setDisplayModal} mutate={mutate} />
      </Show>

      <OptionsModal displayModal={displayOptionsModal} setDisplayModal={setDisplayOptionsModal}>
        <button
          class="px-[4em] py-3 text-red-500/90 hover:bg-slate-200/20"
          onClick={() => {
            setQueryBlockUser({
              url: `http://${VITE_SERVER_DOMAIN}/protected/user/block/${profile().id}`,
              method: "POST",
            });
          }}
        >
          Block User
        </button>
      </OptionsModal>
    </>
  );
};
