import { Component, For, Show, batch, createEffect, createResource, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { Request, sendRequest } from "../helpers/request";
import { states } from "../constants";
import { City } from "country-state-city";

import validator from "validator";
import { useLocation, useNavigate } from "@solidjs/router";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const ListingModal: Component<any> = ({ setDisplayModal, user, mutate }) => {
  const navigate = useNavigate();
  const [newListingQuery, setNewListingQuery] = createSignal({} as Request);
  const [generatedListing] = createResource<Request, Request>(newListingQuery, sendRequest);

  const [newListing, setNewListing] = createStore({
    companyName: "",
    season: "",
    state: ["", ""],
    city: "",
    year: 0,
    monthlyBudget: "",
    description: "",
  });
  const [displayCities, setDisplayCities] = createSignal("");
  const [error, setError] = createSignal("");

  const validateNewListing = () => {
    if (!newListing.season) {
      throw new Error("Must select an internship season");
    }

    if (!newListing.state[0]) {
      throw new Error("Must select a state");
    }

    if (!newListing.city) {
      throw new Error("Must select a city");
    }

    if (!newListing.year) {
      throw new Error("Must select a year");
    }

    if (!validator.isNumeric(newListing.monthlyBudget.toString())) {
      throw new Error("Monthly Budget must be numeric");
    }

    if (newListing.companyName.length > 50) {
      throw new Error("Company name must be less than 50 characters");
    }
  };

  const createListing = async () => {
    setError("");

    try {
      validateNewListing();

      setNewListingQuery({
        url: `http://${VITE_SERVER_DOMAIN}/protected/listings/new`,
        method: "POST",
        data: {
          companyName: newListing.companyName,
          season: newListing.season,
          state: newListing.state[1],
          city: newListing.city,
          year: newListing.year,
          monthlyBudget: parseInt(newListing.monthlyBudget),
          description: newListing.description,
        },
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  createEffect(() => {
    if (generatedListing.state === "ready") {
      const pushedListing = {
        ...generatedListing(),
        author: {
          firstName: user().firstName,
          lastName: user().lastName,
          profile: {
            profilePicture: user().profile.profilePicture,
          },
        },
      };
      batch(() => {
        mutate((prev: any) => [pushedListing, ...prev]);
        setDisplayModal(false);
        navigate("/explore/home", {
          state: {
            modal: false,
          },
        });
      });
    }
  });

  return (
    <>
      <div
        class="absolute z-10 h-full w-full bg-black/25"
        onClick={() => {
          setDisplayModal(false);
          navigate("/explore/home", {
            state: {
              modal: false,
            },
          });
        }}
      />
      <section class="modal w-[30em] sm:h-screen sm:w-full">
        {/* Loading State on Submission */}
        <Show when={generatedListing.loading}>
          <div class="fixed z-10 h-full w-full rounded bg-black/20">
            <p class="relative left-[40%] top-[45%]">dsaasd</p>
          </div>
        </Show>
        <header class="bg-[#1B2234] px-3 py-4 text-lg font-medium text-white drop-shadow screen:rounded-t">
          Create Listing
        </header>
        <div class="p-5">
          <form onSubmit={(e) => e.preventDefault()}>
            <p class="mb-4 block font-medium underline">Internship Details</p>
            <div class="flex justify-between">
              <div class="mr-8 w-[12em]">
                <label for="company-name" class="mb-1 block text-[14px]">
                  Company Name (optional)
                </label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="i.e. Facebook, Google"
                  class="w-full border-b text-[14px] focus:outline-none"
                  value={newListing.companyName}
                  onInput={(e) => setNewListing("companyName", e.target.value)}
                />
              </div>
              <div class="w-[12em]">
                <label for="season" class="mb-1 block text-[14px]">
                  Season*
                </label>
                <select
                  name="season"
                  class="w-full text-[14px] outline-none"
                  onChange={(e) => setNewListing("season", e.target.value)}
                >
                  <option disabled selected>
                    Select Season
                  </option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                </select>
              </div>
            </div>
            <div class="mt-4 flex justify-between">
              <div class="w-[12em]">
                <label for="state" class="mb-1 block text-[14px]">
                  State*
                </label>
                <select
                  name="state"
                  class="w-full text-[14px] outline-none"
                  onChange={(e) => {
                    const chosenState = e.target.value.split(",");
                    setNewListing("state", chosenState);
                    setDisplayCities(chosenState[1]);
                  }}
                >
                  <option disabled selected>
                    Select State
                  </option>
                  <For each={states}>{(state) => <option value={state}>{state[0]}</option>}</For>
                </select>
              </div>
              <div class="w-[12em]">
                <label for="city" class="mb-1 block text-[14px]">
                  City*
                </label>
                <select
                  disabled={!newListing.state[0]}
                  name="city"
                  class="w-full text-[14px] outline-none"
                  onChange={(e) => setNewListing("city", e.target.value)}
                >
                  <option disabled selected>
                    Select City
                  </option>
                  <For each={City.getCitiesOfState("US", displayCities())}>
                    {(city) => <option value={city.name}>{city.name}</option>}
                  </For>
                </select>
              </div>
            </div>

            <div class="w-[12em]">
              <label for="year" class="mt-4 block text-[14px]">
                Year*
              </label>
              <select
                name="year"
                class="w-full text-[14px] outline-none"
                onChange={(e) => setNewListing("year", parseInt(e.target.value))}
              >
                <option disabled selected>
                  Select Year
                </option>
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
                <option value={new Date().getFullYear() + 3}>{new Date().getFullYear() + 3}</option>
              </select>
            </div>

            <p class="mb-4 mt-5 block font-medium underline">Personal Details</p>
            <div class="mb-4">
              <div class="mb-4">
                <label for="description" class="mb-1 block text-[14px]">
                  Monthly Budget (Your Share)
                </label>
                <div class="flex items-center">
                  <p class="mr-1">$</p>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    name="description"
                    placeholder="Enter Amount"
                    class="w-[40%] border-b text-[14px] focus:outline-none"
                    disabled={newListing.monthlyBudget === "-1"}
                    value={newListing.monthlyBudget === "-1" ? 0 : newListing.monthlyBudget}
                    onInput={(e) => setNewListing("monthlyBudget", e.target.value)}
                  />
                </div>
                <div class="mt-3 flex">
                  <input
                    type="checkbox"
                    class="mt-[2px]"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewListing("monthlyBudget", "-1");
                      } else {
                        setNewListing("monthlyBudget", "");
                      }
                    }}
                  />
                  <p class="ml-1 text-[14px]">Not sure?</p>
                </div>
              </div>

              <div>
                <label for="description" class="mb-1 block text-[14px]">
                  Listing Description*
                </label>
                <textarea
                  id="zaza"
                  name="description"
                  placeholder="Introduce yourself and what you're looking for"
                  class="w-full resize-none overflow-y-auto border p-1 text-[14px] focus:outline-none"
                  rows={4}
                  value={newListing.description}
                  onInput={(e) => setNewListing("description", e.target.value)}
                />
              </div>
            </div>
          </form>
          <Show when={error()}>
            <p class="mt-[20px] text-center text-sm text-red-500">{error()}</p>
          </Show>

          <button
            class="float-right mt-5 rounded-sm bg-[#FD830D] p-1 px-2 text-white"
            onClick={createListing}
          >
            Submit
          </button>
          <button
            class="float-right my-5 mr-4 rounded-sm bg-slate-400/90 p-1 px-2 text-white"
            onClick={() => {
              setDisplayModal(false);
              navigate("/explore/home", {
                state: {
                  modal: false,
                },
              });
            }}
          >
            Cancel
          </button>
        </div>
      </section>
    </>
  );
};
