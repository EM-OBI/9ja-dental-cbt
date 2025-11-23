/*
export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  generateText(messages: AIMessage[]): Promise<string>;
  modelName: string;
  providerName: string;
}

export class CloudflareAIProvider implements AIProvider {
  public readonly providerName = "cloudflare";

  constructor(
    private ai: Cloudflare.AI,
    public modelName: string = "@cf/meta/llama-3-8b-instruct"
  ) {}

  async generateText(messages: AIMessage[]): Promise<string> {
    const response = await this.ai.run(this.modelName, { messages });
    return response.response || "";
  }
}

export class OpenAIProvider implements AIProvider {
  public readonly providerName = "openai";

  constructor(private apiKey: string, public modelName: string = "gpt-4o") {}

  async generateText(messages: AIMessage[]): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0]?.message?.content || "";
  }
}

export class AnthropicProvider implements AIProvider {
  public readonly providerName = "anthropic";

  constructor(
    private apiKey: string,
    public modelName: string = "claude-3-5-sonnet-20241022"
  ) {}

  async generateText(messages: AIMessage[]): Promise<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 4096,
        system: systemMessage?.content || "You are a helpful assistant.",
        messages: userMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    return data.content[0]?.text || "";
  }
}

export class GoogleGeminiProvider implements AIProvider {
  public readonly providerName = "google";

  constructor(
    private apiKey: string,
    public modelName: string = "gemini-1.5-pro"
  ) {}

  async generateText(messages: AIMessage[]): Promise<string> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    const contents = userMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = systemMessage
      ? { parts: [{ text: systemMessage.content }] }
      : undefined;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Gemini API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    return data.candidates[0]?.content?.parts[0]?.text || "";
  }
}

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "google" | "cloudflare";
  apiKey?: string;
  modelName?: string;
}

export function createAIProvider(env: Cloudflare.Env): AIProvider {
  const config = getProviderConfig(env);

  console.log("[AI Provider] Initializing provider:", config.provider);

  switch (config.provider) {
    case "openai":
      if (!config.apiKey) {
        throw new Error("OPENAI_API_KEY is required for OpenAI provider");
      }
      return new OpenAIProvider(config.apiKey, config.modelName || "gpt-4o");

    case "anthropic":
      if (!config.apiKey) {
        throw new Error("ANTHROPIC_API_KEY is required for Anthropic provider");
      }
      return new AnthropicProvider(
        config.apiKey,
        config.modelName || "claude-3-5-sonnet-20241022"
      );

    case "google":
      if (!config.apiKey) {
        throw new Error("GOOGLE_AI_API_KEY is required for Google provider");
      }
      return new GoogleGeminiProvider(
        config.apiKey,
        config.modelName || "gemini-1.5-pro"
      );

    case "cloudflare":
      if (!env.AI) {
        throw new Error("AI binding not available for Cloudflare provider");
      }
      return new CloudflareAIProvider(
        env.AI,
        config.modelName || "@cf/meta/llama-3-8b-instruct"
      );

    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

function getProviderConfig(env: Cloudflare.Env): AIProviderConfig {
  const preferredProvider = (env.AI_PROVIDER as string)?.toLowerCase();

  if (preferredProvider === "openai" && env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL,
    };
  }

  if (preferredProvider === "anthropic" && env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
      modelName: env.ANTHROPIC_MODEL,
    };
  }

  if (preferredProvider === "google" && env.GOOGLE_AI_API_KEY) {
    return {
      provider: "google",
      apiKey: env.GOOGLE_AI_API_KEY,
      modelName: env.GOOGLE_MODEL,
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      modelName: env.OPENAI_MODEL,
    };
  }

  if (env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
      modelName: env.ANTHROPIC_MODEL,
    };
  }

  if (env.GOOGLE_AI_API_KEY) {
    return {
      provider: "google",
      apiKey: env.GOOGLE_AI_API_KEY,
      modelName: env.GOOGLE_MODEL,
    };
  }

  if (env.AI) {
    return {
      provider: "cloudflare",
      modelName: env.CLOUDFLARE_AI_MODEL,
    };
  }

  throw new Error(
    "No AI provider configured. Set AI_PROVIDER and corresponding API key."
  );
}

export async function generateTextWithFallback(
  env: Cloudflare.Env,
  messages: AIMessage[]
): Promise<{ text: string; provider: string; model: string }> {
  const providers: Array<() => AIProvider | null> = [
    () => {
      if (env.OPENAI_API_KEY) {
        return new OpenAIProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);
      }
      return null;
    },
    () => {
      if (env.ANTHROPIC_API_KEY) {
        return new AnthropicProvider(
          env.ANTHROPIC_API_KEY,
          env.ANTHROPIC_MODEL
        );
      }
      return null;
    },
    () => {
      if (env.GOOGLE_AI_API_KEY) {
        return new GoogleGeminiProvider(
          env.GOOGLE_AI_API_KEY,
          env.GOOGLE_MODEL
        );
      }
      return null;
    },
    () => {
      if (env.AI) {
        return new CloudflareAIProvider(env.AI, env.CLOUDFLARE_AI_MODEL);
      }
      return null;
    },
  ];

  let lastError: Error | null = null;

  for (const providerFactory of providers) {
    const provider = providerFactory();
    if (!provider) continue;

    try {
      console.log(
        `[AI Fallback] Trying provider: ${provider.providerName} (${provider.modelName})`
      );

      const text = await provider.generateText(messages);

      console.log(
        `[AI Fallback] Success with ${provider.providerName} (${provider.modelName})`
      );

      return {
        text,
        provider: provider.providerName,
        model: provider.modelName,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[AI Fallback] Provider ${provider.providerName} failed:`,
        lastError.message
      );
    }
  }

  throw new Error(
    `All AI providers failed. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}
**/
