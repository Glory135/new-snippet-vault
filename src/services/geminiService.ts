
// This service now acts as a bridge to our backend API
// This prevents the "API Key missing" error in the browser

export const generateCodeSnippet = async (prompt: string, language: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'generate',
        prompt,
        language
      }),
    });

    if (!response.ok) throw new Error('Failed to communicate with server');

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return `// Error generating code: ${(error as Error).message}`;
  }
};

export const explainCode = async (code: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'explain',
        code
      }),
    });

    if (!response.ok) throw new Error('Failed to communicate with server');

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Explanation Error:", error);
    return 'Error generating explanation.';
  }
};
