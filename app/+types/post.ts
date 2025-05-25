// Define the common Post type used throughout the application
export type Post = {
    id: number;
    title: string;
    content: string;
    author: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        profile_picture?: string;
    };
    image: string | null;
    created_at: string;
    updated_at: string;
    likes_count: number;
    likes: number[];
}; 