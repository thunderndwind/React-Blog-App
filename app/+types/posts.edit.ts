import type { LoaderFunction, ActionFunction, MetaFunction } from 'react-router';

export namespace Route {
    export type MetaArgs = Parameters<MetaFunction>[0];
    export type LoaderArgs = Parameters<LoaderFunction>[0];
    export type ActionArgs = Parameters<ActionFunction>[0];
} 