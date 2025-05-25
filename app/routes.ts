import { route, index, type RouteConfig } from "@react-router/dev/routes";

// Define routes explicitly using the @react-router/dev/routes API
export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("profile", "routes/profile.tsx"),
    route("posts/new", "routes/posts.new.tsx"),
    route("posts/:id", "routes/posts.$id.tsx"),
    route("posts/:id/edit", "routes/posts.$id.edit.tsx")
] satisfies RouteConfig;
