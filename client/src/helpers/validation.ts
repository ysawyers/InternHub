import validator from "validator";

interface ProfileFormFields {
  email: string;
  bio: string;
  profilePicture: File;
  wordCount: number;
}

export const validRegisterForm = () => {};

export const validateLoginForm = () => {};

export const validateListingForm = () => {};

export const validateEditProfileForm = (fields: ProfileFormFields) => {
  if (!validator.isEmail(fields.email, { allow_utf8_local_part: false })) {
    throw new Error("Email is invalid");
  }

  if (fields.wordCount > 130 || fields.bio.length > 1000) {
    throw new Error("Profile bio is too long");
  }

  if (fields.profilePicture) {
    const { type, size } = fields.profilePicture;
    if (type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg") {
      throw new Error("Image must be a jpeg, jpg, or png");
    }

    if (size > 5 * 1024 * 1024) {
      throw new Error("Image must be less than 5MB");
    }
  }
};
