export function SearchEntryForm() {
  return (
    <form action="/properties" method="get" className="search-entry-form">
      <label>
        <span className="sr-only">Search land</span>
        <input name="q" maxLength={120} placeholder="Location, landmark or Property ID" />
      </label>
      <select name="category" aria-label="Land category">
        <option value="">All land</option>
        <option value="agricultural">Agricultural</option>
        <option value="na">NA land</option>
        <option value="industrial">Industrial</option>
      </select>
      <button className="button button-gold" type="submit">
        Search land
      </button>
    </form>
  );
}
