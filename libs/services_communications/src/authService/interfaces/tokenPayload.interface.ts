import { UserType } from "@app/shared";

export interface TokenPayload {
  id: string;
  email: string;
  type: UserType;
}
