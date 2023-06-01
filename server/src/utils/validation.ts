import validator from "validator";
import { InvalidRequestException } from "./exceptions";
import { Listing, RegisterFields } from "./types";

export const validateRegister = (options: RegisterFields) => {
  if (!validator.isEmail(options.email, { allow_utf8_local_part: false })) {
    throw new InvalidRequestException("Email is invalid");
  }

  if (!validator.isLength(options.firstName, { min: 2, max: 15 })) {
    throw new InvalidRequestException("First name is invalid");
  }

  if (!validator.isLength(options.lastName, { min: 2, max: 30 })) {
    throw new InvalidRequestException("Last name is invalid");
  }

  if (!validator.isLength(options.password, { min: 8, max: 254 })) {
    throw new InvalidRequestException("Password length is invalid");
  }

  if (options.password !== options.confirmPassword) {
    throw new InvalidRequestException("Passwords do not match");
  }

  if (!options.dob) {
    throw new InvalidRequestException("Must provide a valid date of birth");
  }
};

export const validateLogin = (options: { email: string; password: string }) => {
  if (!validator.isEmail(options.email, { allow_utf8_local_part: false })) {
    throw new InvalidRequestException("Invalid username or password");
  }

  if (!validator.isLength(options.password, { min: 8, max: 254 })) {
    throw new InvalidRequestException("Invalid username or password");
  }
};

export const validateListing = (options: Listing) => {
  if (options.description.length > 1200) {
    throw new InvalidRequestException("Listing description must be less than 1200 characters");
  }

  if (options.companyName.length > 50) {
    throw new InvalidRequestException("Company name must be less than 50 characters");
  }

  if (options.season.length > 7) {
    throw new InvalidRequestException("Season is invalid");
  }

  if (!validator.isAlpha(options.season)) {
    throw new InvalidRequestException("Season is invalid");
  }

  if (options.city.length > 30) {
    throw new InvalidRequestException("Invalid City");
  }

  if (options.state.length > 20) {
    throw new InvalidRequestException("Invalid State");
  }

  if (!validator.isNumeric(options.monthlyBudget.toString())) {
    throw new InvalidRequestException("Monthly Budget must be numeric");
  }
};

export const validateProfile = (fields: any) => {
  const wordCount = () => {
    const words = fields.bio.split(" ");
    if (words[words.length - 1] === "") {
      return words.length - 1;
    }
    return words.length;
  };

  if (!validator.isEmail(fields.email, { allow_utf8_local_part: false })) {
    throw new Error("Email is invalid");
  }

  if (wordCount() > 130 || fields.bio.length > 1000) {
    throw new Error("Profile bio is too long");
  }
};
