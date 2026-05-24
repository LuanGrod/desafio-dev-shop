import type { Route } from "./+types/home";
import { redirect } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checkout | Case Cell Shop" },
    {
      name: "description",
      content: "Redirecionamento para o checkout.",
    },
  ];
}

export function loader() {
  return redirect("/checkout");
}

export default function Home() {
  return null;
}
