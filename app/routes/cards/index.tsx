import { Link } from "@remix-run/react";

export default function CardIndexPage() {
  return (
    <p>
      No card selected. Select a card on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new card.
      </Link>
    </p>
  );
}
