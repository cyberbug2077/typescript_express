import App from "./app";
import PostsController from "./posts/posts.controllers";

const app = new App([new PostsController()], 5500);

app.listen();
