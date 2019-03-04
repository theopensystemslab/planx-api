import * as Flows from "./controller/flows";
import { homeAction } from "./controller/home";

export const AppRoutes = [
  {
    path: "/",
    method: "get",
    action: homeAction
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
  }
];
