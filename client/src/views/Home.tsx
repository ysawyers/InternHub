import { Component, createEffect, createResource, For, Show, createSignal, Index } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Request, sendRequest } from "../helpers/request";
import { Listing, Relationship } from "../types";
import { v4 as uuidv4 } from "uuid";

import MessageIcon from "../assets/paper-plane-solid.svg?component-solid";
import ReportIcon from "../assets/flag-solid.svg?component-solid";
import TrashIcon from "../assets/trash-solid.svg?component-solid";
import SkeletonLoader from "../assets/skeleton-loader.svg?component-solid";
import { fuzzySearchResults } from "../helpers/fuzzy";
import { states } from "../constants";

const { VITE_SERVER_DOMAIN } = import.meta.env;

export const Home: Component<any> = ({ user, listings, mutate }) => {
  const navigate = useNavigate();

  const [queryRelationship, setQueryRelationship] = createSignal({} as Request);
  const [relationship] = createResource(queryRelationship, sendRequest);

  const [queryDeleteListing, setQueryDeleteListing] = createSignal<Request>({} as Request);
  const [deletedListing] = createResource(queryDeleteListing, sendRequest);

  const [fetchedListings, setFetchedListings] = createSignal<Listing[]>(listings());
  const [seasonFilter, setSeasonFilter] = createSignal("");
  const [chosenListing, setChosenListing] = createSignal({} as Listing);

  const [searchInput, setSearchInput] = createSignal("");
  const [searchQuery, setSearchQuery] = createSignal("");
  const [toggleSearch, setToggleSearch] = createSignal(false);
  const [searchBoxRef, setSearchBoxRef] = createSignal<HTMLElement>();

  createEffect(() => {
    if (relationship.state === "ready") {
      if (Object.keys(relationship()).length === 0) {
        const tempMessageId = uuidv4();
        const tempRelationship = {
          messageId: tempMessageId,
          recipientId: chosenListing().authorId,
          lastMessage: "",
          lastSenderId: user().id,
          recipient: {
            firstName: chosenListing().author.firstName,
            lastName: chosenListing().author.lastName,
            profile: {
              profilePicture: chosenListing().author.profile.profilePicture,
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

  createEffect(() => {
    mutate(
      fetchedListings().filter((listing) => {
        if (searchQuery() !== "") {
          let listingState = "";
          for (const state of states) {
            if (listing.state === state[1]) {
              listingState = state[0];
            }
          }

          if (searchQuery().toLowerCase() === `${listing.city}, ${listingState}`.toLowerCase()) {
            return true;
          }
          return false;
        }
        return true;
      })
    );
  });

  createEffect(() => {
    if (searchInput() === "") {
      setSearchQuery("");
    }
  });

  createEffect(() => {
    if (deletedListing.state === "ready") {
      mutate((listings: Listing[]) =>
        listings.filter((listing) => {
          if (listing.id === deletedListing()) {
            return false;
          }
          return true;
        })
      );
    }
  });

  return (
    <div class="w-[60%] p-4 screen:ml-5 md:w-[75%] sm:absolute sm:top-0 sm:w-[100%]">
      {/* Search Bar */}
      <div class="relative w-full">
        <input
          type="text"
          placeholder="Where are you interning? (i.e. San Francisco, California)"
          class="h-10 w-full rounded-xl bg-slate-100 p-4 shadow focus:outline-none"
          value={searchQuery() || searchInput()}
          onInput={(e) => {
            setSearchInput(e.target.value);
          }}
          onFocus={() => {
            setToggleSearch(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setToggleSearch(false);
            }, 100);
          }}
          ref={setSearchBoxRef}
        />
        <div class="absolute h-fit w-full">
          <Show when={searchInput() !== "" && toggleSearch()}>
            <Index each={fuzzySearchResults(searchInput())}>
              {(result) => (
                <div
                  class="border-x border-b bg-white p-2 hover:cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSearchQuery(result().item);
                    searchBoxRef()?.blur();
                  }}
                >
                  <p class="text-[14px]">{result().item}</p>
                </div>
              )}
            </Index>
          </Show>
        </div>
      </div>

      <p class="mt-5 text-lg font-medium">Filters</p>
      <div>
        <div class="mt-4 flex flex-wrap">
          <div>
            <select
              class="mr-4 rounded-lg p-3 shadow-md outline-none"
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option disabled selected>
                Internship Season
              </option>
              <option value="Summer">Summer</option>
              <option class="Winter">Winter</option>
              <option class="Spring">Spring</option>
              <option class="Fall">Fall</option>
            </select>
          </div>
        </div>
      </div>

      <p class="mt-8 text-lg font-medium">Recent Listings</p>

      {/* Load Listing Dynamically  */}
      <div>
        <Show
          when={!listings.loading}
          fallback={
            <div class="mt-5 w-[90%]">
              <SkeletonLoader class="w-full" />
              <SkeletonLoader class="w-full" />
            </div>
          }
        >
          <For
            each={listings().filter((listing: any) => {
              if (seasonFilter() === "") return true;
              return seasonFilter() === listing.season;
            })}
          >
            {(listing: Listing) => (
              <div class="mt-5">
                {/* hover:bottom-1 */}
                <section class="w-full rounded border-2 border-[#374982] bg-slate-200 p-5 drop-shadow-lg screen:relative">
                  <header>
                    <div class="flex items-center">
                      <img
                        src={listing.author.profile.profilePicture}
                        class="mb-1 mr-2 w-10 rounded hover:cursor-pointer"
                        onClick={() => navigate(`/explore/profile/${listing.authorId}`)}
                      />
                      <h2 class="text-lg font-medium">
                        {listing.author.firstName} {listing.author.lastName}, 18
                      </h2>
                      <div class="ml-auto flex items-center">
                        <Show
                          when={user().id === listing.authorId}
                          fallback={
                            <>
                              <MessageIcon
                                class="w-[19px] hover:cursor-pointer"
                                onClick={() => {
                                  if (user().id !== listing.authorId) {
                                    setQueryRelationship({
                                      url: `http://${VITE_SERVER_DOMAIN}/protected/messages/relationship/${listing.authorId}`,
                                      method: "GET",
                                    });
                                    setChosenListing(listing);
                                  }
                                }}
                              />
                              {/* <ReportIcon class="ml-4 w-[19px] fill-red-500 hover:cursor-pointer" /> */}
                            </>
                          }
                        >
                          <TrashIcon
                            class="ml-4 w-[19px] fill-red-500 hover:cursor-pointer"
                            onClick={() => {
                              setQueryDeleteListing({
                                url: `http://${VITE_SERVER_DOMAIN}/protected/listings/${listing.id}/remove`,
                                method: "DELETE",
                              });
                            }}
                          />
                        </Show>
                      </div>
                    </div>
                    <h2 class="text-md mt-2 font-medium">
                      {listing.season} {listing.year}
                      {!!listing.companyName ? `, ${listing.companyName}` : ""}
                    </h2>
                    <h3 class="text-sm">
                      {listing.city}, {listing.state}
                    </h3>
                  </header>
                  <div class="mt-2 break-words">{listing.description}</div>
                  <div class="mt-4 text-[13px]">
                    Monthly Budget: {listing.monthlyBudget === -1 ? "N/A" : "$" + listing.monthlyBudget}
                  </div>
                </section>
              </div>
            )}
          </For>
        </Show>

        <div class="screen:h-5 sm:h-[65px]"></div>
      </div>
    </div>
  );
};
