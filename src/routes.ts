import * as Flows from "./controller/flows";
import * as Home from "./controller/home";
import * as Sessions from "./controller/sessions";
import * as Users from "./controller/users";

export const AppRoutes = [
  {
    path: "/",
    method: "get",
    action: Home.index
  },
  {
    path: "/flows",
    method: "get",
    action: Flows.list
  },
  {
    path: "/flows",
    method: "post",
    action: Flows.create
  },
  {
    path: "/flows/:id",
    method: "delete",
    action: Flows.destroy
  },
  {
    path: "/users",
    method: "post",
    action: Users.create
  },
  {
    path: "/login",
    method: "post",
    action: Sessions.create
  }
];
