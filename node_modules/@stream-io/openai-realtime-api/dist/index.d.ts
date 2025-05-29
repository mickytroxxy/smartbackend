import { RealtimeClient } from '@openai/realtime-api-beta';
export type RealtimeAPIModel = "gpt-4o-realtime-preview" | "gpt-4o-realtime-preview-2024-10-01" | (string & {});
export type { RealtimeClient } from "@openai/realtime-api-beta";
/**
 * Creates OpenAI Realtime API client. The client is compatible with OpenAI's
 * reference implementation: https://github.com/openai/openai-realtime-api-beta
 */
export declare function createRealtimeClient(options: {
    baseUrl: string;
    call: {
        type: string;
        id: string;
    };
    streamApiKey: string;
    streamUserToken: string;
    openAiApiKey: string;
    model?: RealtimeAPIModel;
    debug?: boolean;
}): RealtimeClient;
