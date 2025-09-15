import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to tasks by default
  redirect("/tasks");
}