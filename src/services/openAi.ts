import OpenAI from "openai";
import { APIPromise } from "openai/core";
import { OPENAI_API_KEY } from "./../constants";

import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from "openai/resources";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Generate the initial messages for the chat completion service request
 * based on the previously data loaded.
 */
const generateNewChat = (): ChatCompletionMessageParam[] => {
  const currentMessages: ChatCompletionMessageParam[] = [];
  const systemPrompt =
    "Eres un vendedor de una empesa de software (CentralTurbos SpA.) que atiende a la clientela via mensajes por lo que tus respuestas no deben ser muy largas y tienen que estar hechar para enviarse por medio de un servicio de mensajeria como whatsapp. En la empresa en que trabajas se ofrecen distintos tipo de servicios de programacion y quiero que me respondas como tal. Los servicios se describen junto a su titulo, descripcion y precio. - [Servicio de paginas web] Una pagina y ya. : 100$ - [Apps moviles] Aplicaciones mobiles. : 100$";
  const contextPrompts: [inputText: string, responseText?: string | null][] =
    [];

  // Add system role prompt
  currentMessages.push({ role: "system", content: systemPrompt });

  // Restore the previous context
  contextPrompts.forEach(([inputText, responseText]) => {
    currentMessages.push({ role: "user", content: inputText });

    if (responseText) {
      currentMessages.push({ role: "assistant", content: responseText });
    }
  });

  return currentMessages;
};

/** Messages system records to follow the chat context by an identifier context as key */
const messagesStore: Record<string, ChatCompletionMessageParam[]> = {
  alberto: [
    ...generateNewChat(),
    { role: "user", content: "Hola me llamo alberto" },
  ],
  emily: [
    ...generateNewChat(),
    { role: "user", content: "Hola me llamo emily" },
  ],
};

/** OpenAi Chat Completion service request */
const getChatCompletion = (
  historyMessages: ChatCompletionMessageParam[]
): APIPromise<ChatCompletion> => {
  const modelId = "gpt-3.5-turbo";

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: historyMessages,
    model: modelId,
    max_tokens: 100,
  };

  return openai.chat.completions.create(params);
};

/** Get the response text from the chat completion response. */
const getResponseText = (chatCompletion: ChatCompletion) =>
  chatCompletion.choices.shift()?.message.content ?? "";

/**
 * The OpenAI chat completion service is consumed with the chat history taken by the `sessionId`
 * to return the new response text.
 */
export const continueChat = async (
  sessionId: string,
  promptText: string
): Promise<string> => {
  // Get the specific chat from the given `sessionID`
  const chatHistory: ChatCompletionMessageParam[] =
    messagesStore[sessionId] ?? generateNewChat();

  // store current prompt
  chatHistory.push({ role: "user", content: promptText });

  // OpenAi service request
  const chatCompletion = await getChatCompletion(chatHistory);

  const responseText = getResponseText(chatCompletion);

  // store current response
  chatHistory.push({ role: "assistant", content: responseText });

  // store new chat history
  messagesStore[sessionId] = chatHistory;

  return responseText;
};
