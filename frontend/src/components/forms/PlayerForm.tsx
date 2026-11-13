// frontend/src/components/players/PlayerForm.tsx
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AUCTION_STATUSES, PLAYER_STATUSES, POSITIONS } from "@/constants/football.constants";
import { playerFormSchema, type PlayerFormValues } from "@/schemas/player.schema";
import type { Asset } from "@/types/api.types";
import type { AdminPlayer, PublicPlayer } from "@/types/player.types";
import type { Team } from "@/types/team.types";
import { applyFieldErrors, isAdminRecord } from "@/utils/forms";

export function PlayerForm({
  player,
  teams,
  submitting,
  onSubmit,
}: {
  player?: PublicPlayer | AdminPlayer | null;
  teams: Team[];
  submitting: boolean;
  onSubmit: (values: PlayerFormValues, photo: Asset | null) => Promise<void>;
}) {
  const admin = player && isAdminRecord(player) ? player : null;
  const [photo, setPhoto] = useState<Asset | null>(player?.profilePic ?? null);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema) as Resolver<PlayerFormValues>,
    mode: "onTouched",
    defaultValues: {
      name: player?.name ?? "",
      mobile: admin?.mobile ?? "",
      email: admin?.email ?? "",
      dateOfBirth: admin?.dateOfBirth ? admin.dateOfBirth.slice(0, 10) : "",
      position: (player?.position ?? "") as PlayerFormValues["position"],
      isIconPlayer: player?.isIconPlayer ?? false,
      teamRef: player?.teamRef ?? "",
      jerseyNo: player?.jerseyNo ?? null,
      auctionPrice: player?.auctionPrice ?? 0,
      auctionStatus: player?.auctionStatus ?? "pending",
      status: player?.status ?? "active",
    },
  });

  const { register, handleSubmit, setError, setValue, watch, formState } = form;

  const status = watch("status");
  const auctionStatus = watch("auctionStatus");
  const teamRef = watch("teamRef");

  const isActive = status === "active";
  const isSold = isActive && auctionStatus === "sold";
  const hasTeam = isSold && Boolean(teamRef);

  // Clear dependent fields whenever status, auctionStatus, or teamRef hides them
  useEffect(() => {
    if (status === "inactive") {
      setValue("isIconPlayer", false, { shouldValidate: true });
      setValue("auctionStatus", "pending", { shouldValidate: true });
      setValue("auctionPrice", 0, { shouldValidate: true });
      setValue("teamRef", "", { shouldValidate: true });
      setValue("jerseyNo", null, { shouldValidate: true });
    }
  }, [status, setValue]);

  useEffect(() => {
    if (auctionStatus !== "sold") {
      setValue("auctionPrice", 0, { shouldValidate: true });
      setValue("teamRef", "", { shouldValidate: true });
      setValue("jerseyNo", null, { shouldValidate: true });
    }
  }, [auctionStatus, setValue]);

  useEffect(() => {
    if (!teamRef) {
      setValue("jerseyNo", null, { shouldValidate: true });
    }
  }, [teamRef, setValue]);

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit(values, photo);
        } catch (error) {
          applyFieldErrors(error, setError);
          throw error;
        }
      })}
    >
      <ImageUploader
        label="Profile picture"
        purpose="player-profile"
        value={photo}
        onChange={setPhoto}
      />

      <FormField label="Name" required error={formState.errors.name?.message}>
        <Input placeholder="Enter player full name" {...register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Mobile" required error={formState.errors.mobile?.message}>
          <Input {...register("mobile")} inputMode="tel" placeholder="9847012345" />
        </FormField>
        <FormField label="Email" error={formState.errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="player@example.com" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date of birth" error={formState.errors.dateOfBirth?.message}>
          <Input type="date" {...register("dateOfBirth")} />
        </FormField>
        <FormField label="Position" required error={formState.errors.position?.message}>
          <Select {...register("position")}>
            <option value="">Select position</option>
            {POSITIONS.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Player status"
        hint="Only active players can participate in the auction or be assigned to a team. 
              Marking a player inactive clears the team, jersey and price."
        error={formState.errors.status?.message}
      >
        <Select {...register("status")}>
          {PLAYER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </FormField>

      {isActive ? (
        <>
          <Checkbox
            id="player-is-icon"
            label="Icon player"
            {...register("isIconPlayer")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Auction status" error={formState.errors.auctionStatus?.message}>
              <Select {...register("auctionStatus")}>
                {AUCTION_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {isSold ? (
              <FormField
                label="Auction price (INR)"
                required
                error={formState.errors.auctionPrice?.message}
              >
                <Input type="number" min={1} {...register("auctionPrice")} />
              </FormField>
            ) : null}
          </div>

          {isSold ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Team" required error={formState.errors.teamRef?.message}>
                <Select {...register("teamRef")}>
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              {hasTeam ? (
                <FormField label="Jersey number" error={formState.errors.jerseyNo?.message}>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    placeholder="1 - 99"
                    {...register("jerseyNo")}
                  />
                </FormField>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save player"}
      </Button>
    </form>
  );
}