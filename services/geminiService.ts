import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Post, User } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for generating social media posts
const postSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      authorName: { type: Type.STRING },
      authorHandle: { type: Type.STRING },
      content: { type: Type.STRING },
      likes: { type: Type.INTEGER },
    },
    required: ["authorName", "authorHandle", "content", "likes"],
  },
};

/**
 * Generates simulated social media posts using Gemini
 */
export const generateFeedPosts = async (count: number = 5): Promise<Post[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Hãy tạo ra ${count} bài đăng mạng xã hội thú vị, ngắn gọn bằng tiếng Việt.
      Chủ đề: Trending, Gen Z, công nghệ, drama nhẹ nhàng, hoặc meme.
      Đảm bảo nội dung tự nhiên, có teencode nhẹ.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: postSchema,
        systemInstruction: "Bạn là một AI chuyên tạo dữ liệu giả lập cho mạng xã hội. Hãy sáng tạo và vui vẻ.",
      },
    });

    const rawPosts = JSON.parse(response.text || "[]");

    return rawPosts.map((p: any, index: number) => ({
      id: `ai-post-${Date.now()}-${index}`,
      author: {
        id: `ai-user-${Math.random().toString(36).substr(2, 9)}`,
        name: p.authorName,
        handle: `@${p.authorHandle}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.authorHandle}`,
        isCurrentUser: false,
      },
      content: p.content,
      likes: p.likes || Math.floor(Math.random() * 100),
      comments: [],
      timestamp: new Date().toISOString(),
      displayTimestamp: 'Vừa xong',
      image: Math.random() > 0.8 ? `https://picsum.photos/seed/${Math.random()}/600/400` : undefined,
      likedBy: []
    }));
  } catch (error) {
    console.error("Error generating posts:", error);
    return [];
  }
};

/**
 * Generates a reply for the chat feature with dynamic persona
 */
export const generateChatReply = async (
  history: { role: string, parts: { text: string }[] }[], 
  newMessage: string,
  personaContext: string = "Bạn là một người bạn ảo thân thiện trên mạng xã hội."
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: personaContext,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Hmm, mạng hơi lag xíu, nói lại đi bạn ui!";
  } catch (error) {
    console.error("Chat error:", error);
    return "Xin lỗi, hiện tại mình không thể trả lời. Thử lại sau nhé!";
  }
};

/**
 * Generates a comment on a post
 */
export const generateComment = async (postContent: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Hãy viết một bình luận ngắn (dưới 10 từ) bằng tiếng Việt cho bài đăng này: "${postContent}". Bình luận kiểu gen Z, hài hước hoặc khen ngợi.`,
    });
    return response.text?.trim() || "Đỉnh quá!";
  } catch (error) {
    return "Tuyệt vời!";
  }
};