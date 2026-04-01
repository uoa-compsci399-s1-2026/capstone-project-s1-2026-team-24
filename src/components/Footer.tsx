export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--uoa-navy)" }} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-center">
        &copy; {new Date().getFullYear()} University of Auckland. All rights reserved.
      </div>
    </footer>
  );
}
