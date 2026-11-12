import type { Asset } from "../../shared/types/common.types.js";
export interface SponsorFields {
  name:string;logo:Asset|null;tier:string|null;website:string|null;contactPerson:string|null;
  contactMobile:string|null;status:"active"|"inactive";notes:string|null;
}
export type PublicSponsorDTO=Pick<SponsorFields,"name"|"logo"|"tier"|"website"|"status"> & {_id:string;};
export type AdminSponsorDTO=PublicSponsorDTO & Pick<SponsorFields,"contactPerson"|"contactMobile"|"notes">;
