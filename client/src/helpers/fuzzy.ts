import { City } from "country-state-city";
import { states } from "../constants";
import Fuse from "fuse.js";

let allMatches: string[] = [];

for (const state of states) {
  City.getCitiesOfState("US", state[1]).forEach((city) => {
    allMatches.push(`${city.name}, ${state[0]}`);
  });
}

const fuse = new Fuse(allMatches, {
  threshold: 0.5,
});

export const fuzzySearchResults = (input: string) => {
  return fuse.search(input).filter((_, i) => i < 7);
};
