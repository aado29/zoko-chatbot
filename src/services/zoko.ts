import axios from "axios";
import { ZOKO_API_BASE_URL, ZOKO_API_KEY } from "./../constants";
import { ResponseError } from "../utils/errors";

import type { AxiosError } from "axios";

interface SendMessageResponse {
  messageId: string;
  status: 202;
  statusText: "Accepted";
}

export interface SendMessageErrorResponse {
  status: 400 | 409;
  type: "invalid_request_error" | "client_error";
  message: string;
  timestamp: number;
}

/** Send message via zoko a message to a specific recipient number */
export const sendMessage = async (
  recipient: number,
  message: string
): Promise<SendMessageResponse> => {
  try {
    const { data } = await axios.post<SendMessageResponse>(
      `${ZOKO_API_BASE_URL}/message`,
      {
        channel: "whatsapp",
        recipient: String(recipient),
        type: "text",
        message,
      },
      {
        headers: {
          apikey: ZOKO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (e) {
    const { status, response: { data } = {} } =
      e as AxiosError<SendMessageErrorResponse>;

    const statusCode = data?.status ?? status ?? 500;
    const message = data?.message || "Server error";

    throw new ResponseError(statusCode, message);
  }
};
