import type { LoaderFunction, ActionFunction, MetaFunction } from 'react-router';

export namespace Route {
    export type MetaArgs = Parameters<MetaFunction>[0];
    export type LoaderArgs = Parameters<LoaderFunction>[0];
    export type ActionArgs = Parameters<ActionFunction>[0];
}

export type ProfileData = {
    user_stats: {
        posts_count: number;
        followers_count: number;
        following_count: number;
        likes_received: number;
    };
    recent_activity: Array<{
        id: number;
        type: 'post' | 'comment' | 'like';
        content: string;
        timestamp: string;
    }>;
}; 