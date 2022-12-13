import { Link } from "@remix-run/react";

export default function CardsPage() {
  return (
    <div>
      <h1>
        <Link to=".">Cards</Link>
      </h1>

      <main>
        <Link to="new">+ New Card</Link>
      </main>
    </div>
  );
}
