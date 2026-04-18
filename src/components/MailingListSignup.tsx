// Task 12: implement mailing list signup form
export default function MailingListSignup() {
  return (
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 px-3 py-2 rounded text-sm bg-white text-black focus:outline-none"
        aria-label="Email address for mailing list"
      />
      <button
        type="button"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
      >
        Subscribe
      </button>
    </div>
  );
}
