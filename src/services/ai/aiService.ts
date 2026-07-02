/**
 * OmniAI — AI Service (Groq API Integration)
 * Calls Groq's Llama 3 to parse natural-language editing commands into structured actions.
 */

import type { EditActionType, AIPromptResult } from '@/src/types/project';

interface ParsedCommand {
  actions: EditActionType[];
  response: string;
  editorChanges: {
    filter?: string;
    speed?: number;
    trimStart?: number;
    trimEnd?: number;
    textOverlay?: { text: string; position: 'top' | 'center' | 'bottom'; color: string };
    volume?: number;
  };
}

const SYSTEM_PROMPT = `You are the AI editing assistant inside OmniAI, a mobile video editor.
You receive the user's natural language request and call the appropriate editing tool functions.
RULES:
1. You may call MULTIPLE tools for complex requests (e.g., "trim 2 seconds and add a warm filter").
2. Convert time to milliseconds if needed (1 second = 1000 ms).
3. If a request cannot be fulfilled, provide a helpful text response explaining what to do manually.
4. Keep the response message short and engaging. Use emojis.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'apply_filter',
      description: 'Apply a color filter to the video.',
      parameters: {
        type: 'object',
        properties: {
          filterName: {
            type: 'string',
            enum: ['none', 'warm', 'cool', 'vintage', 'cinema', 'vivid', 'bw'],
            description: 'The name of the filter to apply.',
          },
        },
        required: ['filterName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_speed',
      description: 'Change the playback speed of the video.',
      parameters: {
        type: 'object',
        properties: {
          speed: {
            type: 'number',
            description: 'The playback speed multiplier (e.g., 0.5 for slow, 2.0 for fast).',
          },
        },
        required: ['speed'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'trim_video',
      description: 'Trim the beginning of the video.',
      parameters: {
        type: 'object',
        properties: {
          trimStartMs: {
            type: 'number',
            description: 'The number of milliseconds to cut from the start.',
          },
        },
        required: ['trimStartMs'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'adjust_volume',
      description: 'Change the volume of the video.',
      parameters: {
        type: 'object',
        properties: {
          volume: {
            type: 'number',
            description: 'Volume level from 0.0 to 1.0 (0 is mute).',
          },
        },
        required: ['volume'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_text_overlay',
      description: 'Add a text overlay or caption to the video.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text content to display.',
          },
          position: {
            type: 'string',
            enum: ['top', 'center', 'bottom'],
            description: 'Where to place the text.',
          },
          color: {
            type: 'string',
            description: 'The hex color code for the text (default #FFFFFF).',
          },
        },
        required: ['text', 'position'],
      },
    },
  },
];

let lastEditorChanges: ParsedCommand['editorChanges'] = {};

export async function processAIPrompt(
  prompt: string,
  durationMs: number
): Promise<AIPromptResult> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key is missing. Please check your .env file.');
  }

  // Reset last changes
  lastEditorChanges = {};

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Video duration: ${durationMs}ms. User request: ${prompt}` },
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    
    let actions: EditActionType[] = [];
    let aiResponse = message?.content || '🤖 Processing your edits...';

    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolNames = message.tool_calls.map((tc: any) => tc.function.name);
      aiResponse = `🤖 Applied: ${toolNames.join(', ').replace(/_/g, ' ')}!`;
      
      for (const tc of message.tool_calls) {
        const args = JSON.parse(tc.function.arguments);
        
        switch (tc.function.name) {
          case 'apply_filter':
            actions.push('apply_filter');
            lastEditorChanges.filter = args.filterName;
            break;
          case 'change_speed':
            actions.push('change_speed');
            lastEditorChanges.speed = args.speed;
            break;
          case 'trim_video':
            actions.push('trim');
            lastEditorChanges.trimStart = args.trimStartMs;
            break;
          case 'adjust_volume':
            actions.push('adjust_volume');
            lastEditorChanges.volume = args.volume;
            break;
          case 'add_text_overlay':
            actions.push('add_text');
            lastEditorChanges.textOverlay = {
              text: args.text,
              position: args.position as 'top' | 'center' | 'bottom',
              color: args.color || '#FFFFFF',
            };
            break;
        }
      }
    }

    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      prompt,
      response: aiResponse,
      actions: actions.length > 0 ? actions : ['ai_edit'],
      timestamp: Date.now(),
      success: true,
    };
  } catch (error: any) {
    console.error('Error calling Groq:', error);
    throw error;
  }
}

/**
 * Get the editor changes from the last AI result.
 */
export function getEditorChanges(prompt: string) {
  return lastEditorChanges;
}

