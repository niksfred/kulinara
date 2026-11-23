import ImageEditor from '@react-native-community/image-editor';
import Constants from 'expo-constants';
import OpenAI from 'openai';
import { DetectedItem } from '../types/DetectedItem';

const TARGET_MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;
const MIN_EXPIRATION_DAYS = 1;
const MAX_EXPIRATION_DAYS = 365;

let cachedClient: OpenAI | null = null;

type ClassifyImageInput = {
  uri: string;
  width: number;
  height: number;
};

type ModelItem = {
  name: string;
  expiration: string;
};

type ModelResponse = {
  items: ModelItem[];
};

function getApiKey() {
  const key: unknown = Constants.expoConfig?.extra?.openaiApiKey;
  return typeof key === 'string' ? key.trim() : '';
}

function getClient() {
  if (cachedClient) return cachedClient;
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'OpenAI API key is missing. Set OPENAI_API_KEY in .env and restart Expo. Manual tracking works without a key.'
    );
  }
  cachedClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  return cachedClient;
}

function getResizedDimensions(width: number, height: number) {
  const maxSide = Math.max(width, height);
  if (maxSide <= TARGET_MAX_SIDE) {
    return { width, height };
  }
  const scale = TARGET_MAX_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function parseExpirationDays(expiration: string): number {
  const normalized = expiration.trim().toLowerCase();
  const numeric = normalized.match(/\d+/);
  if (!numeric) return 7;
  let days = Number(numeric[0]);
  if (normalized.includes('week')) days *= 7;
  if (normalized.includes('month')) days *= 30;
  if (normalized.includes('year')) days *= 365;
  return Math.min(MAX_EXPIRATION_DAYS, Math.max(MIN_EXPIRATION_DAYS, days));
}

function parseContentAsItems(content: string | null | undefined): ModelItem[] {
  if (!content) return [];
  const parsed = JSON.parse(content) as ModelResponse;
  if (!Array.isArray(parsed.items)) return [];
  return parsed.items.filter(
    (item): item is ModelItem =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      typeof item.expiration === 'string'
  );
}

async function toBase64Jpeg({ uri, width, height }: ClassifyImageInput) {
  const displaySize = getResizedDimensions(width, height);
  const cropped = await ImageEditor.cropImage(uri, {
    offset: { x: 0, y: 0 },
    size: { width, height },
    displaySize,
    resizeMode: 'contain',
    format: 'jpeg',
    quality: JPEG_QUALITY,
    includeBase64: true,
  });

  if (!cropped.base64) {
    throw new Error('Failed to build base64 image data.');
  }

  return cropped.base64;
}

export async function classifyImage(input: ClassifyImageInput): Promise<DetectedItem[]> {
  const client = getClient();
  const base64Image = await toBase64Jpeg(input);

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'grocery_items',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  expiration: { type: 'string' },
                },
                required: ['name', 'expiration'],
              },
            },
          },
          required: ['items'],
        },
      },
    },
    messages: [
      {
        role: 'system',
        content:
          'Identify grocery food products visible in the image and return only valid JSON following the schema. For packaged items, prioritize reading the front-of-package text. Use the main product label, the largest visible text, and the most prominent food name on the package. Prefer the product type over the brand name or marketing slogan. If the package clearly shows a grocery item in text, include it even when the object itself is visually ambiguous. Only return an empty list when no grocery food item can be identified from either the image or readable packaging text.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Look carefully for packaged grocery items. Try to read the main text on the package, especially the biggest font, the central front label, and any clearly visible food/product name. If both brand and product are visible, return the product name or a concise shopper-friendly name such as "whole wheat bread" instead of only the brand. Return JSON as an object with an "items" array. Each item must include name and typical expiration after purchase from a shop/market (for example: "7 days", "2 weeks").',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });
  const items = parseContentAsItems(completion.choices[0]?.message?.content);

  return items
    .map((item) => ({
      name: item.name.trim(),
      expirationDays: parseExpirationDays(item.expiration),
    }))
    .filter((item) => item.name.length > 0);
}
