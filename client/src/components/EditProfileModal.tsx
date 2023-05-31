import { Component, Show, createEffect, createResource, createSignal } from "solid-js";

import PencilIcon from "../assets/pencil-solid.svg?component-solid";
import { Request, sendRequest } from "../helpers/request";
import { validateEditProfileForm } from "../helpers/validation";

export const EditProfileModal: Component<any> = ({ setDisplayModal, profile, mutate }) => {
  const [queryEditProfile, setQueryEditProfile] = createSignal<Request>({} as Request);
  const [newProfile] = createResource(queryEditProfile, sendRequest);

  const [email, setEmail] = createSignal(profile().email);
  const [bio, setBio] = createSignal(profile().profile.bio);
  const [profilePicture, setProfilePicture] = createSignal(profile().profile.profilePicture);
  const [error, setError] = createSignal("");

  const wordCount = () => {
    const words = bio().split(" ");

    if (words[words.length - 1] === "") {
      return words.length - 1;
    }
    return words.length;
  };

  const [imageUploadRef, setImageUploadRef] = createSignal<any>();

  const { VITE_SERVER_DOMAIN } = import.meta.env;

  const submitProfileChanges = async () => {
    setError("");

    let newProfileContent = new FormData();
    if (imageUploadRef().files.length > 0) {
      newProfileContent.append("profilePicture", imageUploadRef().files[0]);
    }
    newProfileContent.append("email", email());
    newProfileContent.append("bio", bio());

    try {
      validateEditProfileForm({
        email: email(),
        bio: bio(),
        profilePicture: imageUploadRef().files[0],
        wordCount: wordCount(),
      });

      setQueryEditProfile({
        url: `http://${VITE_SERVER_DOMAIN}/protected/user/profile/update`,
        method: "PUT",
        data: newProfileContent,
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    } catch (error: any) {
      setError(error.response?.data || error.message);
    }
  };

  createEffect(() => {
    if (newProfile.state === "ready") {
      mutate({
        ...profile(),
        email: newProfile().email,
        profile: {
          bio: newProfile().bio,
          profilePicture: !!newProfile().profilePicture
            ? newProfile().profilePicture
            : profile().profile.profilePicture,
        },
      });

      setDisplayModal(false);
    }
  });

  return (
    <>
      <div class="absolute z-10 h-full w-full bg-black/25" onClick={() => setDisplayModal(false)}></div>
      <section class="modal sm:h-screen sm:w-full">
        <header class="bg-[#1B2234] px-3 py-4 text-lg font-medium text-white drop-shadow screen:rounded-t">
          Edit Profile
        </header>
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex flex-col items-center">
              <div class="relative flex h-[80px] w-[80px] items-end">
                <input type="file" accept=".png, .jpg, .jpeg" class="hidden" ref={setImageUploadRef} />
                <PencilIcon
                  class="absolute right-0 top-0 w-[20px] rounded bg-[#1B2234] fill-white p-1 hover:cursor-pointer"
                  onClick={() => {
                    imageUploadRef().click();

                    imageUploadRef().onchange = (e: any) => {
                      setProfilePicture(URL.createObjectURL(imageUploadRef().files[0]));
                    };
                  }}
                />
                <img src={profilePicture()} class={`block w-[75px] rounded-lg`}></img>
              </div>
              <p class="mt-2 text-sm">Profile Picture</p>
            </div>

            <div class="ml-8 flex flex-col">
              <div class="flex">
                <div>
                  <label for="first-name" class="block text-[14px]">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    value={profile().firstName}
                    class="border-b p-1 text-[14px]"
                    disabled
                  />
                </div>

                <div class="ml-4">
                  <label for="last-name" class="block text-[14px]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    value={profile().lastName}
                    class="border-b p-1 text-[14px]"
                    disabled
                  />
                </div>
              </div>

              <div class="mt-3">
                <label for="email" class="block text-[14px]">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  value={email()}
                  class="w-full border-b p-1 text-[14px] focus:outline-none"
                  onInput={(e) => setEmail(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>

          <div class="mt-8">
            <p class="text-[14px]">About Me</p>
            <textarea
              class="mt-1 w-full resize-none border p-1 text-[13px] focus:outline-none"
              rows={5}
              placeholder="Talk a little bit about yourself..."
              value={bio()}
              onInput={(e) => setBio(e.currentTarget.value)}
            />
            <Show when={wordCount() > 0}>
              <p class="float-right text-xs">{wordCount()}/130</p>
            </Show>
          </div>

          <div class="mt-12"></div>
          <Show when={!!error()}>
            <p class="text-center text-[14px] text-red-500">{error()}</p>
          </Show>
          <div class="ml-auto mt-2 flex w-fit">
            <div
              class="mr-3 mt-5 w-fit rounded-sm bg-slate-400/90 p-1 px-2 text-sm text-white hover:cursor-pointer"
              onClick={() => setDisplayModal(false)}
            >
              Cancel
            </div>
            <div
              class="mt-5 w-fit rounded-sm bg-[#FD830D] p-1 px-2 text-sm text-white hover:cursor-pointer"
              onClick={submitProfileChanges}
            >
              Save Changes
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
