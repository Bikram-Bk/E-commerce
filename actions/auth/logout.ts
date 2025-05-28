"use server";

import { fetchApiClient } from "@/lib/oneentry";

import { cookies } from "next/headers";

interface IErrorResponse {
  statusCode: number;
  timestamp: string;
  message: string;
  pageData: null;
}

export default async function logoutAction() {
  const cookiStore = cookies();

  const refreshTokenCookie = (await cookiStore).get("refresh_token")?.value;

  const accessTokenCookie = (await cookiStore).get("access_token")?.value;

  const apiClient = await fetchApiClient();

  if (!refreshTokenCookie || !accessTokenCookie) {
    return {
      message: "You are not currently logged in.",
    };
  }

  try {
    const logoutResponse = await apiClient?.AuthProvider.setAccessToken(
      accessTokenCookie
    ).logout("email", refreshTokenCookie);

    if (typeof logoutResponse != "boolean") {
      const errorResponse = logoutResponse as unknown as IErrorResponse;

      return {
        message: errorResponse.message,
      };
    }

    (await cookiStore).delete("refresh_token");
    (await cookiStore).delete("access_token");
    (await cookiStore).delete("user_identifier");

    (await cookiStore).set("refresh_token", "", { maxAge: 0 });
    (await cookiStore).set("access_token", "", { maxAge: 0 });
    (await cookiStore).set("user_identifier", "", { maxAge: 0 });

    return { message: "Logout successfull." };
  } catch (err) {
    console.log("Error during logout:", err);

    throw new Error("An error occured while logging out. Please try again");
  }
}
