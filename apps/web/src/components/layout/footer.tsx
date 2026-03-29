export function DashboardFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-4">
      <p className="text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Aveo. All rights reserved.
      </p>
    </footer>
  );
}
