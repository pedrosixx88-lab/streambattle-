// Landing page — will be fully built in M6
// For now, redirects to login so the app is functional
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
