/**
 * AI Code Review Service
 * Integrates with GPT API for code analysis and suggestions
 */

export interface AIReviewRequest {
  code: string;
  language: string;
  userId?: string;
  context?: string;
}

export interface AIReviewResult {
  success: boolean;
  review?: {
    score: number; // 0-100
    summary: string;
    suggestions: Array<{
      line?: number;
      severity: 'info' | 'warning' | 'error';
      message: string;
      fix?: string;
    }>;
    strengths: string[];
    improvements: string[];
    optimizations: string[];
  };
  error?: string;
}

/**
 * Review code using AI (GPT-5.2 or compatible API)
 */
export async function reviewCode(request: AIReviewRequest): Promise<AIReviewResult> {
  try {
    // TODO: Replace with actual GPT-5.2 API endpoint
    const API_ENDPOINT = process.env.EXPO_PUBLIC_AI_API_ENDPOINT || '';
    const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';

    if (!API_ENDPOINT || !API_KEY) {
      // Return demo review for development
      return simulateAIReview(request);
    }

    const prompt = `You are an expert code reviewer. Analyze the following ${request.language} code and provide:
1. Overall score (0-100)
2. Brief summary
3. Specific suggestions with line numbers if applicable
4. Code strengths
5. Areas for improvement
6. Performance optimizations

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Respond in JSON format with: { score, summary, suggestions, strengths, improvements, optimizations }`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer providing constructive feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const reviewText = data.choices[0]?.message?.content || '';

    // Parse JSON response
    const review = JSON.parse(reviewText);

    return {
      success: true,
      review,
    };
  } catch (error) {
    console.error('AI review error:', error);
    // Fallback to simulated review
    return simulateAIReview(request);
  }
}

/**
 * Simulate AI review for demo/offline mode
 */
export async function simulateAIReview(request: AIReviewRequest): Promise<AIReviewResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const codeLength = request.code.length;
  const hasComments = request.code.includes('//') || request.code.includes('/*');
  const hasFunctions = request.code.includes('function') || request.code.includes('def');
  
  let score = 70;
  if (hasComments) score += 10;
  if (hasFunctions) score += 10;
  if (codeLength > 100) score += 5;

  return {
    success: true,
    review: {
      score: Math.min(score, 95),
      summary: `Your ${request.language} code shows good structure and readability. There are a few areas where you can improve performance and maintainability.`,
      suggestions: [
        {
          line: 3,
          severity: 'info',
          message: 'Consider adding error handling for edge cases',
          fix: 'Add try-catch block or input validation',
        },
        {
          line: 7,
          severity: 'warning',
          message: 'Variable naming could be more descriptive',
          fix: 'Use camelCase or snake_case with meaningful names',
        },
        {
          severity: 'info',
          message: 'Add comments to explain complex logic',
        },
      ],
      strengths: [
        'Clean and readable code structure',
        'Follows language conventions',
        'Good use of modern syntax',
      ],
      improvements: [
        'Add input validation',
        'Implement error handling',
        'Consider edge cases',
        'Add documentation comments',
      ],
      optimizations: [
        'Use more efficient data structures for large inputs',
        'Consider caching repeated calculations',
        'Reduce nested loops where possible',
      ],
    },
  };
}
