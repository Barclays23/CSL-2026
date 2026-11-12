export type UploadPurpose =
  | "user-profile"
  | "player-profile"
  | "team-logo"
  | "team-poster"
  | "manager-profile"
  | "sponsor-logo";

export interface ImageUploadDto {
  purpose: UploadPurpose;
}
export type ImageUploadInput = ImageUploadDto;
