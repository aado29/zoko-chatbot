import { Request, Response } from "express";
import { continueChat } from "../services/openAi";
import { sendMessage } from "../services/zoko";
import { ResponseError } from "src/utils/errors";

const numbersWitheList = ["+56977273879"];

const chatController = {
  assistant: async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    const { prompt: promptText } = req.body;

    const responseText = await continueChat(sessionId, promptText);

    res.json({ response: responseText, prompt: promptText });
  },

  zokoWebhook: async (req: Request, res: Response): Promise<void> => {
    res.sendStatus(200);

    const { event, platformSenderId, text } = req.body;

    if (event !== "message:user:in") {
      return;
    }

    if (!numbersWitheList.includes(platformSenderId)) {
      return;
    }

    try {
      const responseText = await continueChat(platformSenderId, text);

      const recipientNumber = Number(platformSenderId.replace("+", ""));

      await sendMessage(recipientNumber, responseText);
    } catch (e) {
      const { status, message } = e as ResponseError;
      console.error(`Zokobot Error: ${status} - ${message}`);
    }
  },
};

export default chatController;
