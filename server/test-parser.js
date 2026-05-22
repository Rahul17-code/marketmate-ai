function parseRobustJSON(text) {
  if (!text) throw new Error('Empty response received from AI.');
  
  let cleaned = text.trim();
  
  // 1. Extract the JSON object boundaries (between first '{' and last '}')
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  
  // 2. Strip standard markdown code blocks if they are still there
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // 3. Remove trailing commas in arrays or objects which break standard JSON.parse
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  return JSON.parse(cleaned);
}

// Test cases
const testCases = [
  // 1. Standard markdown block
  '```json\n{\n  "name": "test"\n}\n```',
  // 2. Text before and after
  'Sure, here is the JSON:\n{\n  "name": "test"\n}\nHope this helps!',
  // 3. Trailing commas in arrays and objects
  '{\n  "items": ["one", "two",],\n  "nested": {\n    "key": "val",\n  },\n}',
  // 4. Combined mess
  'Here is the response: ```json\n{\n  "list": [1, 2, 3,],\n  "status": "success",\n}```\nHave a good day!'
];

testCases.forEach((tc, idx) => {
  try {
    const result = parseRobustJSON(tc);
    console.log(`Test ${idx + 1} passed!`, result);
  } catch (err) {
    console.error(`Test ${idx + 1} failed:`, err.message);
  }
});
